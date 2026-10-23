/**
 * Sound Effects System for CramZero Multiplayer
 * Uses Web Audio API for low-latency playback with volume control
 */

let audioCtx = null;
let masterGain = null;
const sfxBuffers = new Map();
const SFX_VOLUME_KEY = 'cramzero-sfx-volume';
const SFX_MUTE_KEY = 'cramzero-sfx-mute';

/** List of all sound effect names to preload */
export const SFX_NAMES = [
  // Countdown
  'countdown_3', 'countdown_2', 'countdown_1', 'countdown_go',
  // Answers
  'answer_correct', 'answer_incorrect', 'answer_locked',
  // Round/Match
  'round_end', 'match_victory', 'match_defeat', 'match_draw',
  // Emotes (generic + specific)
  'emote_sent', 'player_join', 'player_leave',
  'emote_gg', 'emote_nice', 'emote_oops', 'emote_mind_blown',
  'emote_thinking', 'emote_laugh', 'emote_sad', 'emote_fire',
];

/** Initialize AudioContext on first user interaction */
export function initAudio() {
  if (audioCtx) return audioCtx;

  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.connect(audioCtx.destination);

    // Restore volume from localStorage
    const savedVolume = Number(localStorage.getItem(SFX_VOLUME_KEY));
    const savedMute = localStorage.getItem(SFX_MUTE_KEY) === 'true';
    masterGain.gain.value = savedMute ? 0 : (isNaN(savedVolume) ? 0.7 : savedVolume);

    // Resume on user interaction (required by browser policies)
    const resumeAudio = () => {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      document.removeEventListener('click', resumeAudio);
      document.removeEventListener('keydown', resumeAudio);
    };
    document.addEventListener('click', resumeAudio, { once: true });
    document.addEventListener('keydown', resumeAudio, { once: true });

    return audioCtx;
  } catch (e) {
    console.warn('Web Audio API not available:', e);
    return null;
  }
}

/** Get or create AudioContext */
export function getAudioContext() {
  if (!audioCtx) initAudio();
  return audioCtx;
}

/** Load a single sound effect from /sfx/{name}.webm */
export async function loadSfx(name) {
  const ctx = getAudioContext();
  if (!ctx) return null;

  if (sfxBuffers.has(name)) return sfxBuffers.get(name);

  try {
    const response = await fetch(`/sfx/${name}.webm`);
    if (!response.ok) throw new Error(`Failed to load ${name}`);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    sfxBuffers.set(name, audioBuffer);
    return audioBuffer;
  } catch (e) {
    console.warn(`Failed to load SFX: ${name}`, e);
    // Return a generated beep as fallback
    return generateToneBuffer(name);
  }
}

/** Generate a procedural tone as fallback when audio files aren't available */
function generateToneBuffer(name) {
  const ctx = getAudioContext();
  if (!ctx) return null;

  const config = getToneConfig(name);
  const sampleRate = ctx.sampleRate;
  const duration = config.duration;
  const length = sampleRate * duration;
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    // Envelope: quick attack, exponential decay
    const env = Math.exp(-t * config.decay);
    // Frequency modulation for character
    const freq = config.freq + config.fmDepth * Math.sin(2 * Math.PI * config.fmRate * t);
    data[i] = env * Math.sin(2 * Math.PI * freq * t) * config.volume;
  }

  sfxBuffers.set(name, buffer);
  return buffer;
}

/** Tone configurations for procedural fallbacks */
function getToneConfig(name) {
  const configs = {
    // Countdown - descending thuds
    countdown_3: { freq: 120, duration: 0.3, decay: 8, volume: 0.5, fmDepth: 0, fmRate: 0 },
    countdown_2: { freq: 160, duration: 0.3, decay: 8, volume: 0.5, fmDepth: 0, fmRate: 0 },
    countdown_1: { freq: 220, duration: 0.3, decay: 8, volume: 0.5, fmDepth: 0, fmRate: 0 },
    countdown_go: { freq: 300, duration: 0.5, decay: 5, volume: 0.6, fmDepth: 100, fmRate: 10 },

    // Answers
    answer_correct: { freq: 523, duration: 0.4, decay: 6, volume: 0.4, fmDepth: 50, fmRate: 15 }, // C5 + chime
    answer_incorrect: { freq: 200, duration: 0.5, decay: 4, volume: 0.4, fmDepth: 50, fmRate: 5 },  // Low buzz
    answer_locked: { freq: 800, duration: 0.1, decay: 20, volume: 0.3, fmDepth: 0, fmRate: 0 },   // Sharp click

    // Round/Match
    round_end: { freq: 440, duration: 0.3, decay: 10, volume: 0.4, fmDepth: 0, fmRate: 0 },      // A4 ding
    match_victory: { freq: 659, duration: 1.2, decay: 3, volume: 0.5, fmDepth: 100, fmRate: 8 }, // E5 fanfare
    match_defeat: { freq: 180, duration: 1.0, decay: 2, volume: 0.4, fmDepth: 30, fmRate: 3 },   // Minor chord feel
    match_draw: { freq: 330, duration: 0.6, decay: 4, volume: 0.4, fmDepth: 20, fmRate: 4 },     // Neutral

    // Emotes (generic)
    emote_sent: { freq: 600, duration: 0.15, decay: 15, volume: 0.3, fmDepth: 0, fmRate: 0 },    // Quick pop
    player_join: { freq: 400, duration: 0.3, decay: 6, volume: 0.4, fmDepth: 80, fmRate: 12 },   // Cheerful pling
    player_leave: { freq: 250, duration: 0.4, decay: 3, volume: 0.3, fmDepth: 50, fmRate: 4 },   // Sad wobble

    // Specific emotes
    emote_gg: { freq: 500, duration: 0.4, decay: 5, volume: 0.4, fmDepth: 60, fmRate: 10 },      // Applause sting
    emote_nice: { freq: 600, duration: 0.3, decay: 8, volume: 0.4, fmDepth: 40, fmRate: 12 },    // Upbeat chime
    emote_oops: { freq: 300, duration: 0.5, decay: 4, volume: 0.4, fmDepth: 200, fmRate: 3 },    // Slide whistle
    emote_mind_blown: { freq: 200, duration: 0.6, decay: 3, volume: 0.4, fmDepth: 400, fmRate: 20 }, // Sci-fi whoosh
    emote_thinking: { freq: 400, duration: 1.0, decay: 1, volume: 0.2, fmDepth: 0, fmRate: 0 },  // Steady tick (looped)
    emote_laugh: { freq: 500, duration: 0.5, decay: 5, volume: 0.4, fmDepth: 100, fmRate: 8 },   // Giggle
    emote_sad: { freq: 220, duration: 0.7, decay: 3, volume: 0.3, fmDepth: 50, fmRate: 2 },     // Tiny violin
    emote_fire: { freq: 150, duration: 0.5, decay: 4, volume: 0.5, fmDepth: 300, fmRate: 15 },  // Flame whoosh
  };

  return configs[name] || { freq: 440, duration: 0.3, decay: 8, volume: 0.4, fmDepth: 0, fmRate: 0 };
}

/** Preload all sound effects */
export async function preloadAllSfx() {
  const ctx = initAudio();
  if (!ctx) return;

  await Promise.all(SFX_NAMES.map(name => loadSfx(name)));
}

/** Play a sound effect by name */
export function playSfx(name, options = {}) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const { volume = 1, rate = 1, loop = false } = options;
  const buffer = sfxBuffers.get(name);

  if (!buffer) {
    // Try to load on-demand
    loadSfx(name).then(buf => {
      if (buf) playSfx(name, options);
    });
    return;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = rate;
  source.loop = loop;

  // Per-sound gain for individual volume control
  const gainNode = ctx.createGain();
  gainNode.gain.value = volume;

  source.connect(gainNode);
  gainNode.connect(masterGain);
  source.start(0);

  return source;
}

/** Set master volume (0-1) */
export function setSfxVolume(volume) {
  const clamped = Math.max(0, Math.min(1, volume));
  if (masterGain) masterGain.gain.value = clamped;
  localStorage.setItem(SFX_VOLUME_KEY, String(clamped));
  localStorage.setItem(SFX_MUTE_KEY, 'false');
}

/** Get current master volume */
export function getSfxVolume() {
  return masterGain ? masterGain.gain.value : Number(localStorage.getItem(SFX_VOLUME_KEY) || 0.7);
}

/** Toggle mute */
export function toggleSfxMute() {
  const isMuted = masterGain?.gain.value === 0;
  if (masterGain) {
    masterGain.gain.value = isMuted ? (Number(localStorage.getItem(SFX_VOLUME_KEY)) || 0.7) : 0;
  }
  localStorage.setItem(SFX_MUTE_KEY, String(!isMuted));
  return !isMuted;
}

/** Check if muted */
export function isSfxMuted() {
  return masterGain?.gain.value === 0 || localStorage.getItem(SFX_MUTE_KEY) === 'true';
}

/** Stop all sounds */
export function stopAllSfx() {
  // Web Audio API doesn't have a simple stop-all, but we can disconnect masterGain temporarily
  if (masterGain) {
    masterGain.disconnect();
    masterGain.connect(audioCtx.destination);
  }
}

/** Cleanup audio resources */
export function cleanupAudio() {
  if (audioCtx && audioCtx.state !== 'closed') {
    audioCtx.close();
    audioCtx = null;
    masterGain = null;
    sfxBuffers.clear();
  }
}

/** Check if reduced motion is preferred (for accessibility) */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Play sound only if not reduced motion (for non-essential sounds) */
export function playSfxIfAllowed(name, options = {}) {
  const { essential = false } = options;
  if (!essential && prefersReducedMotion()) return;
  return playSfx(name, options);
}