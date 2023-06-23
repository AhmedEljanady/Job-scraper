import { Module } from '@nestjs/common';
import { WuzzufService } from './wuzzuf.service';
import { WuzzufController } from './wuzzuf.controller';
import { SocketGateway } from 'src/socket.getway';
// import { IoAdapter } from '@nestjs/platform-socket.io';
// import { WebSocketAdapter } from 'src/websocket.adapter';

@Module({
  controllers: [WuzzufController],
  providers: [
    WuzzufService,
    SocketGateway,
    // { provide: WebSocketAdapter, useClass: IoAdapter },
  ],
})
export class WuzzufModule {}
