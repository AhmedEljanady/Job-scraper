import { Module } from '@nestjs/common';
import { WuzzufService } from './wuzzuf.service';
import { WuzzufController } from './wuzzuf.controller';

@Module({
  controllers: [WuzzufController],
  providers: [WuzzufService],
})
export class WuzzufModule {}
