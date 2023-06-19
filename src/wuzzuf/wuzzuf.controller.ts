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

@Controller('wuzzuf')
export class WuzzufController {
  constructor(private readonly wuzzufService: WuzzufService) {}

  @Post()
  async scrapy(@Body() body: ScrapyWuzzufDto) {
    const { url, viewBrowser } = body;
    console.log(`url: ${url}, view: ${viewBrowser}`);
    // viewBrowser = 'new';
    let response;
    try {
      response = await this.wuzzufService.runScrapping(url, viewBrowser);
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
    return this.wuzzufService.getJobs();
  }

  @Get(':url')
  async findOne(
    @Param('url') url: string,
    @Query('viewBrowser') viewBrowser: boolean,
  ) {
    await this.wuzzufService.runScrapping(url, viewBrowser);
    return this.wuzzufService.jobs;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWuzzufDto: UpdateWuzzufDto) {
    return this.wuzzufService.update(+id, updateWuzzufDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.wuzzufService.remove(+id);
  }
}
