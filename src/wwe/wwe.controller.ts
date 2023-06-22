import { Body, Controller, Get, Post } from '@nestjs/common';
import { SubscribeMessage } from '@nestjs/websockets';
import { ScrapyWweDto } from './dto/scrapy-wwe.dto';
import { WweService } from './wwe.service';

@Controller('wwe')
export class WweController {
  constructor(private readonly wweService: WweService) {}

  @Post()
  @SubscribeMessage('startScraping')
  async scrapy(@Body() body: ScrapyWweDto) {
    const { userId, url, maxConcurrency } = body;
    console.log(
      `url: ${url}, maxConcurrency: ${maxConcurrency} for user: ${userId}`,
    );
    let response;
    try {
      response = await this.wweService.runScrapping(
        userId,
        url,
        +maxConcurrency,
      );
    } catch (error) {
      response.status = 'error';
      response.data = [];
      console.error('Error occurred during scraping:', error);
    }
    console.log({ ...response });
    return response;
  }

  @Get()
  findAll() {
    return this.wweService.getJobs();
  }
}
