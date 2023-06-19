import { Module } from '@nestjs/common';
import { WweController } from './wwe.controller';
import { WweService } from './wwe.service';

@Module({
  controllers: [WweController],
  providers: [WweService],
})
export class WweModule {}
