import { Module } from '@nestjs/common';
import { WuzzufService } from './wuzzuf.service';
import { WuzzufController } from './wuzzuf.controller';
import { SocketGateway } from 'src/socket.getway';

@Module({
  controllers: [WuzzufController],
  providers: [WuzzufService, SocketGateway],
})
export class WuzzufModule {}
