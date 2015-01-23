import { fork } from 'child_process';
import { join } from 'path';

function spawn(child) {
  (function start() {
    console.log('Starting', child);
    fork(join(__dirname, child), {
      env: {
        NODE_ENV: process.env.NODE_ENV,
      },
    })
    .on('exit', (code) => {
      console.warn(child, 'exited with code', code);
      start();
    });
  })();
}

spawn('flux-server');
spawn('render-server');
