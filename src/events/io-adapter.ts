import { IoAdapter } from '@nestjs/platform-socket.io';
import * as socketio from 'socket.io';

export class CustomSocketIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: socketio.ServerOptions): any {
    const customOptions: socketio.ServerOptions = {
      cors: {},
      connectionStateRecovery: {
        // maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: true,
      },
      ...options, // Merge with any additional options passed
    };

    const server = super.createIOServer(port, customOptions);

    return server;
  }
}
