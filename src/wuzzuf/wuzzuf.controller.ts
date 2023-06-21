import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  // Res,
} from '@nestjs/common';
import { WuzzufService } from './wuzzuf.service';
import { ScrapyWuzzufDto } from './dto/scrapy-wuzzuf.dto';
import { UpdateWuzzufDto } from './dto/update-wuzzuf.dto';
import { ConnectedSocket, SubscribeMessage } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Controller('wuzzuf')
export class WuzzufController {
  constructor(private readonly wuzzufService: WuzzufService) {}

  @Post()
  @SubscribeMessage('startScraping')
  async scrapy(@Body() body: ScrapyWuzzufDto) {
    const { userId, url, viewBrowser } = body;
    console.log(`url: ${url}, view: ${viewBrowser} for user: ${userId}`);
    try {
      const response = await this.wuzzufService.runScrapping(
        userId,
        url,
        viewBrowser,
      );

      // this.wuzzufService.sendProgressUpdates(`scraping completed...`);
      console.log({ ...response });
      return response;
    } catch (error) {
      console.error('Error occurred during scraping:', error);
      return {
        status: 'error',
        data: [],
        error: error.message,
      };
    }
  }

  @Get()
  findAll() {
    return this.wuzzufService.getJobs();
  }

  // @Get(':url')
  // async findOne(
  //   @Param('url') url: string,
  //   @Query('viewBrowser') viewBrowser: boolean,
  // ) {
  //   await this.wuzzufService.runScrapping(url, viewBrowser);
  //   return this.wuzzufService.jobs;
  // }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWuzzufDto: UpdateWuzzufDto) {
    return this.wuzzufService.update(+id, updateWuzzufDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.wuzzufService.remove(+id);
  }
}
