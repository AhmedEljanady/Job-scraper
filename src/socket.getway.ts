import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as shortid from 'shortid';

@WebSocketGateway()
export class SocketGateway {
  @WebSocketServer()
  server: Server;

  private activeUsers: { [userId: string]: Socket } = {};

  // @SubscribeMessage('startScraping');
  // handleStartScraping(client: Socket){

  // }

  handleConnection(client: Socket) {
    const userId = this.generateUserId();
    this.activeUsers[userId] = client;
    client.emit('connected', { userId });
  }

  handleDisconnect(client: Socket) {
    const userId = this.findUserId(client);
    delete this.activeUsers[userId];
  }

  sendProgressUpdates(userId: string, progress: string): void {
    const client = this.activeUsers[userId];
    if (client) client.emit('progress', progress); //this.server or client
  }

  private generateUserId(): string {
    return shortid();
  }

  private findUserId(client: Socket): string | null {
    const userIds = Object.keys(this.activeUsers);
    for (const userId of userIds) {
      if (this.activeUsers[userId] === client) {
        return userId;
      }
    }
    return null;
  }
}
