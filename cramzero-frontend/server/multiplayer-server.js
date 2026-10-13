import { WebSocketServer } from 'ws';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const PORT = Number(process.env.MULTIPLAYER_PORT || 8787);
const HOST = process.env.MULTIPLAYER_HOST || '0.0.0.0';
const QUESTION_SECONDS = 15;
const rooms = new Map();
const lockPath = path.resolve('.multiplayer-server.lock');

const acquireLock = () => {
  try {
    const existingPid = Number(fs.readFileSync(lockPath, 'utf8'));
    if (existingPid && existingPid !== process.pid) {
      try {
        process.kill(existingPid, 0);
        console.error(`A multiplayer server is already running (PID ${existingPid}).`);
        process.exit(1);
      } catch {
        fs.unlinkSync(lockPath);
      }
    }
  } catch {
    // The lock does not exist yet.
  }
  fs.writeFileSync(lockPath, String(process.pid), { flag: 'wx' });
};

acquireLock();
process.once('exit', () => {
  try {
    if (fs.readFileSync(lockPath, 'utf8') === String(process.pid)) fs.unlinkSync(lockPath);
  } catch {
    // The lock was already removed.
  }
});

const wss = new WebSocketServer({ host: HOST, port: PORT });

const send = (socket, message) => {
  if (socket.readyState === socket.OPEN) {
    socket.send(JSON.stringify(message));
  }
};

const broadcast = (room, message) => {
  room.players.forEach((player) => send(player.socket, message));
};

const publicRoomState = (room) => ({
  type: 'room_state',
  room: {
    pin: room.pin,
    phase: room.phase,
    hostId: room.hostId,
    deck: {
      ...room.deck,
      cards: room.deck.cards.map(({ definition, ...card }) => (
        ['round-result', 'results', 'cancelled'].includes(room.phase)
          ? { ...card, definition }
          : card
      )),
    },
    players: room.players.map(({ socket: _socket, ...player }) => player),
    questionIndex: room.questionIndex,
    questionStartedAt: room.questionStartedAt,
    countdownStartedAt: room.countdownStartedAt,
    cancelReason: room.cancelReason,
    questionSeconds: QUESTION_SECONDS,
    answeredPlayerIds: [...room.answers.keys()],
    scores: Object.fromEntries(room.players.map((player) => [player.id, player.score])),
  },
});

const publishState = (room) => broadcast(room, publicRoomState(room));

const finishRound = (room) => {
  if (room.phase !== 'playing') return;
  room.phase = 'round-result';
  room.questionStartedAt = null;
  publishState(room);
};

const startQuestion = (room) => {
  room.phase = 'playing';
  room.answers = new Map();
  room.questionStartedAt = Date.now();
  room.countdownStartedAt = null;
  publishState(room);
};

const removePlayer = (room, playerId) => {
  const wasActiveMatch = ['countdown', 'playing', 'round-result'].includes(room.phase);
  room.players = room.players.filter((player) => player.id !== playerId);
  room.answers.delete(playerId);
  if (room.players.length === 0) {
    clearInterval(room.timer);
    rooms.delete(room.pin);
    return;
  }
  if (wasActiveMatch && room.players.length < 2) {
    room.phase = 'cancelled';
    room.questionStartedAt = null;
    room.countdownStartedAt = null;
    room.cancelReason = 'The battle ended because the other player left.';
    publishState(room);
    return;
  }
  if (room.hostId === playerId) {
    room.hostId = room.players[0].id;
    room.players[0].isHost = true;
  }
  publishState(room);
};

const makePin = () => {
  let pin;
  do {
    pin = String(Math.floor(100000 + Math.random() * 900000));
  } while (rooms.has(pin));
  return pin;
};

const makePlayerId = () => randomUUID();

const handleMessage = (socket, message) => {
  let payload;
  try {
    payload = JSON.parse(message.toString());
  } catch {
    send(socket, { type: 'error', message: 'Invalid multiplayer message.' });
    return;
  }

  if (payload.type === 'host') {
    if (!payload.name || !payload.deck?.cards?.length) {
      send(socket, { type: 'error', message: 'A player name and playable deck are required.' });
      return;
    }
    const playerId = makePlayerId();
    const room = {
      pin: makePin(),
      phase: 'lobby',
      hostId: playerId,
      deck: payload.deck,
      players: [{ id: playerId, name: String(payload.name).trim().slice(0, 32), score: 0, isHost: true, socket }],
      questionIndex: 0,
      questionStartedAt: null,
      countdownStartedAt: null,
      answers: new Map(),
      timer: null,
    };
    rooms.set(room.pin, room);
    socket.room = room;
    socket.playerId = playerId;
    send(socket, { ...publicRoomState(room), type: 'connected', playerId });
    return;
  }

  if (payload.type === 'join') {
    const pin = String(payload.pin || '').replace(/\D/g, '').slice(0, 6);
    const room = rooms.get(pin);
    if (!room) {
      send(socket, { type: 'error', message: 'That lobby was not found.' });
      return;
    }
    if (room.phase !== 'lobby') {
      send(socket, { type: 'error', message: 'That battle has already started.' });
      return;
    }
    if (!payload.name) {
      send(socket, { type: 'error', message: 'Enter a display name to join.' });
      return;
    }
    const playerId = makePlayerId();
    room.players.push({ id: playerId, name: String(payload.name).trim().slice(0, 32), score: 0, isHost: false, socket });
    socket.room = room;
    socket.playerId = playerId;
    send(socket, { ...publicRoomState(room), type: 'connected', playerId });
    publishState(room);
    return;
  }

  const room = socket.room;
  if (!room) {
    send(socket, { type: 'error', message: 'Join or host a lobby first.' });
    return;
  }

  const player = room.players.find((candidate) => candidate.id === socket.playerId);
  if (!player) return;

  if (payload.type === 'leave') {
    socket.room = null;
    removePlayer(room, socket.playerId);
    socket.close();
    return;
  }

  if (payload.type === 'start') {
    if (socket.playerId !== room.hostId || room.players.length < 2 || room.phase !== 'lobby') return;
    room.phase = 'countdown';
    room.questionIndex = 0;
    room.answers = new Map();
    room.questionStartedAt = null;
    room.countdownStartedAt = Date.now();
    publishState(room);
    return;
  }

  if (payload.type === 'answer') {
    if (room.phase !== 'playing' || room.answers.has(player.id)) return;
    const card = room.deck.cards[room.questionIndex];
    const elapsed = Math.max(0, Date.now() - room.questionStartedAt);
    const remaining = Math.max(0, QUESTION_SECONDS * 1000 - elapsed);
    const isCorrect = payload.answer === card.definition;
    const points = isCorrect ? Math.round(1000 * (remaining / (QUESTION_SECONDS * 1000))) : 0;
    player.score += points;
    room.answers.set(player.id, { answer: payload.answer, isCorrect, points });
    send(socket, { type: 'answer_result', isCorrect, points, correctAnswer: card.definition });
    publishState(room);
    if (room.answers.size === room.players.length) finishRound(room);
    return;
  }

  if (payload.type === 'next_question') {
    if (socket.playerId !== room.hostId || room.phase !== 'round-result') return;
    if (room.questionIndex >= room.deck.cards.length - 1) {
      room.phase = 'results';
      publishState(room);
      return;
    }
    room.questionIndex += 1;
    room.answers = new Map();
    room.phase = 'countdown';
    room.questionStartedAt = null;
    room.countdownStartedAt = Date.now();
    publishState(room);
  }
};

wss.on('connection', (socket) => {
  socket.on('message', (message) => handleMessage(socket, message));
  socket.on('close', () => {
    if (socket.room) removePlayer(socket.room, socket.playerId);
  });
});

setInterval(() => {
  rooms.forEach((room) => {
    if (room.phase === 'countdown' && Date.now() - room.countdownStartedAt >= 3000) {
      startQuestion(room);
    }
    if (room.phase === 'playing' && Date.now() - room.questionStartedAt >= QUESTION_SECONDS * 1000) {
      finishRound(room);
    }
  });
}, 250);

console.log(`CramZero multiplayer server listening on ws://${HOST}:${PORT}`);
