import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

export class WebSocketAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    // Add any custom configuration for the Socket.IO server here
    server.origin([
      'https://job-scraper-g012.onrender.com',
      'http://localhost:3000',
      'http://localhost:3001',
    ]);
    return server;
  }

  createSocketServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);
    // Add any custom configuration for the raw socket server here
    return server;
  }
}
