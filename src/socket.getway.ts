import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as shortid from 'shortid';

/*TODO:
here are two problems here:
1- there are 4 different IDs generated every refresh
2- this.activeUsers save only two of them   SOLVED
*/

@WebSocketGateway({ cors: true })
export class SocketGateway {
  @WebSocketServer()
  server: Server;

  private activeUsers: { [userId: string]: Socket } = {};
  private static instance: SocketGateway; // this solve secound problem

  constructor() {
    return SocketGateway.instance || (SocketGateway.instance = this);
  }

  handleConnection(client: Socket) {
    const userId = this.generateUserId();
    if (!this.activeUsers[userId]) {
      this.activeUsers[userId] = client;
      client.emit('connected', { userId });
    } else {
      console.log(`User ${userId} already connected.`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.findUserId(client);
    delete this.activeUsers[userId];
  }

  sendProgressUpdates(
    userId: string,
    progress: string,
    isError = false,
    isWarning = false,
    isSuccess = false,
  ): void {
    if (userId in this.activeUsers) {
      const client = this.activeUsers[userId];
      client.emit('progress', { progress, isError, isWarning, isSuccess }); //this.server or client
    } else {
      console.log(`User ${userId} is not connected.`);
    }
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
