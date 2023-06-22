import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
// import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { SocketGateway } from './socket.getway';
// import { WuzzufGateway } from './wuzzuf/wuzzuf.getway';
import { WuzzufModule } from './wuzzuf/wuzzuf.module';
import { WweModule } from './wwe/wwe.module';
@Module({
  imports: [WuzzufModule, WweModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
