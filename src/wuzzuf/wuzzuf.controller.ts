import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
} from '@nestjs/common';
import { WuzzufService } from './wuzzuf.service';
import { ScrapyWuzzufDto } from './dto/scrapy-wuzzuf.dto';
import { UpdateWuzzufDto } from './dto/update-wuzzuf.dto';

@Controller('wuzzuf')
export class WuzzufController {
  constructor(private readonly wuzzufService: WuzzufService) {}

  // @Post()
  // create(@Body() createWuzzufDto: CreateWuzzufDto) {
  //   return this.wuzzufService.create(createWuzzufDto);
  // }

  //TODO: error in response f post request because run scrapeURLs >> browser close >> return the response >> run scrape details
  @Post()
  async scrapy(@Body() body: ScrapyWuzzufDto) {
    // const url =
    //   'https://wuzzuf.net/search/jobs/?a=navbl&filters%5Bpost_date%5D%5B0%5D=within_24_hours&q=backend';
    // const viewBrowser = true;
    const { url, viewBrowser } = body;
    console.log(`url: ${url}, view: ${viewBrowser}`);
    const response = {
      status: 'in progress',
      data: [],
    };
    await this.wuzzufService.runScrapping(url, viewBrowser);
    response.status = 'complete';
    response.data = this.wuzzufService.getJobs();
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
