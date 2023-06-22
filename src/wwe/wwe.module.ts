import { Module } from '@nestjs/common';
import { SocketGateway } from 'src/socket.getway';
import { WweController } from './wwe.controller';
import { WweService } from './wwe.service';

@Module({
  controllers: [WweController],
  providers: [WweService, SocketGateway],
})
export class WweModule {}
