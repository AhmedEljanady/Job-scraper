import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WuzzufModule } from './wuzzuf/wuzzuf.module';
import { WweModule } from './wwe/wwe.module';
@Module({
  imports: [WuzzufModule, WweModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
