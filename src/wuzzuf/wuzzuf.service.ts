import { Injectable } from '@nestjs/common';
import { CreateWuzzufDto } from './dto/create-wuzzuf.dto';
import { UpdateWuzzufDto } from './dto/update-wuzzuf.dto';
import { Cluster } from 'puppeteer-cluster';
// import puppeteer, { Puppeteer } from 'puppeteer';
import * as puppeteer from 'puppeteer';

@Injectable()
export class WuzzufService {
  //   {
  sleep = (milliseconds: number) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  };

  urls: string[] = [];
  jobs = [];

  scrapeJobLinks = async (page: puppeteer.Page) => {
    while (true) {
      await this.sleep(3000);
      await page.waitForSelector('.css-1gatmva');
      const allJobs = await page.$$('.css-1gatmva');

      for (const job of allJobs) {
        let link = '';
        try {
          link = await page.evaluate(
            (el) => el.querySelector('.css-o171kl').getAttribute('href'),
            job,
          );
          link = 'https://wuzzuf.net' + link;
        } catch (err) {}

        this.urls.push(link);
        // console.log('url length: ' + this.urls.length);
      }

      const nextButton = await page.$(
        'button svg path[d="M9.213 5L7.5 6.645 13.063 12 7.5 17.355 9.213 19l7.287-7z"]',
      );

      if (nextButton) {
        await Promise.all([
          nextButton.click({ delay: 100 }), // Optional delay to simulate human-like clicking
          page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }),
        ]);
      } else {
        break;
      }
    }
  };

  scrapeJobDetails = async (page: puppeteer.Page, url: string) => {
    await page.goto(url);
    await page.waitForSelector('.css-1t5f0fr', { timeout: 5000 });

    let title: string | undefined = '';
    // company: string | undefined,
    // companyLogo: string | undefined,
    // location: string | undefined,
    // experience: string | undefined,
    // postedDate: string | undefined,
    // jobRequirements: string | undefined = '';

    const jobTitleElement = await page.$('.css-f9uh36');
    if (jobTitleElement) {
      title = await jobTitleElement.evaluate((element) => element.textContent);
    } else {
      console.error('Job title element not found');
    }

    const jobTypesElement = await page.$('.css-11rcwxl');
    const jobTypes: string[] = [];
    for (const jobType of await jobTypesElement.$$('a')) {
      const jobTypeName = await jobType.evaluate(
        (el) => el.querySelector('.css-ja0r8m').textContent,
      );
      jobTypes.push(jobTypeName);
    }

    const companyDetails = await page.$eval(
      '.css-9geu3q',
      (el) => el.textContent,
    );
    const index = companyDetails.indexOf('-');
    const company = companyDetails.slice(0, index - 1);
    const location = companyDetails.slice(index + 1);

    const companyLogo = await page.$eval('.css-jb4x6y', (el) =>
      el.getAttribute('src'),
    );

    const experience = await page.$eval('.css-47jx3m', (el) => el.textContent);
    const postedDate = await page.$eval('.css-182mrdn', (el) => el.textContent);

    const jobRequirements = await page.$eval(
      '.css-1t5f0fr',
      (el) => el.innerHTML,
    );

    return {
      title,
      jobTypes,
      company,
      location,
      companyLogo,
      experience,
      postedDate,
      jobRequirements,
      url,
    };
  };

  runClusters = async (viewBrowser: boolean) => {
    const cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_PAGE,
      maxConcurrency: 10,
      // monitor: true,
      puppeteerOptions: {
        headless: viewBrowser,
        // defaultViewport: false,
        userDataDir: './tmp',
        timeout: 60000,
      },
    });

    cluster.on('taskerror', (err, data) => {
      console.log(`err ${data}: ${err.message}`);
    });

    await cluster.task(async ({ page, data: url }) => {
      const jobDetails = await this.scrapeJobDetails(page, url);
      this.jobs.push(jobDetails);
      console.log(this.jobs);
    });
    for (const url of this.urls) {
      cluster.queue(url);
    }
    await cluster.idle();
    await cluster.close();
  };

  runScrapping = async (url: string, viewBrowser: boolean) => {
    try {
      if (typeof url !== 'string') {
        throw new Error('URL must be a string');
      }
      const browser = await puppeteer.launch({
        headless: viewBrowser,
        userDataDir: './tmp',
      });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await this.scrapeJobLinks(page);
      console.log(this.urls.length);
      this.runClusters(viewBrowser);
      await browser.close();
    } catch (error) {
      console.error('Error occurred during scraping:', error);
    }
  };

  getJobs() {
    return this.jobs;
  }
  create(createWuzzufDto: CreateWuzzufDto) {
    return 'This action adds a new job in wuzzuf';
  }

  findAll() {
    return `This action returns all wuzzuf`;
  }

  findOne(id: number) {
    return `This action returns a #${id} wuzzuf`;
  }

  update(id: number, updateWuzzufDto: UpdateWuzzufDto) {
    return `This action updates a #${id} wuzzuf`;
  }

  remove(id: number) {
    return `This action removes a #${id} wuzzuf`;
  }
}
