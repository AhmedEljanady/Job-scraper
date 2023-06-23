import { Module } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SocketGateway } from './socket.getway';
import { WebSocketAdapter } from './websocket.adapter';
import { WuzzufModule } from './wuzzuf/wuzzuf.module';
import { WweModule } from './wwe/wwe.module';
@Module({
  imports: [WuzzufModule, WweModule],
  controllers: [AppController],
  providers: [
    AppService,
    SocketGateway,
    { provide: WebSocketAdapter, useClass: IoAdapter },
  ],
})
export class AppModule {}
