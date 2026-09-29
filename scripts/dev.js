import { spawn } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const processes = [
  spawn(npmCommand, ['run', 'dev:frontend'], { stdio: 'inherit', shell: true }),
  spawn(npmCommand, ['run', 'multiplayer'], { stdio: 'inherit', shell: true }),
];

const stop = () => {
  processes.forEach((child) => child.kill());
};

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
process.on('exit', stop);