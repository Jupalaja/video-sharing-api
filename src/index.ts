import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import { userRouter } from './user/user.router';
import { videoRouter } from './video/video.router';
import { authRouter } from './auth/auth.router';
import { Server } from 'http';

dotenv.config();

if (!process.env.PORT) {
  console.log(`Error to get ports`);
  process.exit(1);
}

const PORT: number = parseInt(process.env.PORT as string, 10);

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/user', userRouter);
app.use('/api/video', videoRouter);
app.use('/api/auth', authRouter);
let server: Server;

export function startServer(): Promise<Server> {
  return new Promise((resolve, reject) => {
    if (server && server.listening) {
      resolve(server);
    } else {
      server = app
        .listen(PORT, () => {
          console.log(`Server started on port ${PORT}`);
          resolve(server);
        })
        .on('error', reject);
    }
  });
}

export function stopServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (server && server.listening) {
      server.close((err) => {
        if (err) {
          console.error('Failed to close the server:', err);
          reject(err);
        } else {
          console.log('Server successfully closed');
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}

startServer();
