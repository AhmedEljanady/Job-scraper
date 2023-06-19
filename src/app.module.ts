import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
// import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WuzzufModule } from './wuzzuf/wuzzuf.module';
import { WweModule } from './wwe/wwe.module';

@Module({
  imports: [
    // ConfigModule.forRoot({ isGlobal: true }),
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: process.env.POSTGRESS_HOST,
    //   port: +process.env.POSTGRESS_PORT,
    //   username: process.env.POSTGRESS_USER,
    //   password: process.env.POSTGRESS_PASSWORD,
    //   database: process.env.POSTGRESS_DATABASE,
    //   autoLoadEntities: true,
    //   synchronize: true,
    // }),
    WuzzufModule,
    WweModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
