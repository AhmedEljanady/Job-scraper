import { Injectable } from '@nestjs/common';
import { CreateWuzzufDto } from './dto/create-wuzzuf.dto';
import { UpdateWuzzufDto } from './dto/update-wuzzuf.dto';
import { Cluster } from 'puppeteer-cluster';
import * as puppeteer from 'puppeteer';
import * as dotenv from 'dotenv';
import * as shortid from 'shortid';
import { SocketGateway } from 'src/socket.getway';
dotenv.config();
@Injectable()
export class WuzzufService {
  constructor(private readonly socketGetway: SocketGateway) {}

  sleep = (milliseconds: number) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  };

  urls: string[] = [];
  jobs = [];

  scrapeJobLinks = async (userId: string, page: puppeteer.Page) => {
    this.socketGetway.sendProgressUpdates(userId, `Fetching job links...`);
    while (true) {
      await this.sleep(3000);
      try {
        await page.waitForSelector('.css-1gatmva');
      } catch (err) {
        console.error(err);
        return 'NO JOBS HERE!!';
      }
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

        if (this.urls.includes(link)) {
          continue;
        }

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
        this.socketGetway.sendProgressUpdates(
          userId,
          `Navigate to next page...`,
        );
      } else {
        break;
      }
    }
  };

  scrapeJobDetails = async (
    userId: string,
    page: puppeteer.Page,
    url: string,
  ) => {
    this.socketGetway.sendProgressUpdates(userId, `Scraping job details...`);
    await page.goto(url);
    await page.waitForSelector('.css-1t5f0fr', { timeout: 5000 });

    const id = shortid.generate();
    let title: string | undefined = '';

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
      id,
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

  runClusters = async (userId: string, maxConcurrency: number) => {
    try {
      this.socketGetway.sendProgressUpdates(userId, `Running the clusters...`);
      const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_PAGE,
        maxConcurrency,
        // monitor: true,
        puppeteerOptions: {
          args: [
            '--disable-setuid-sandbox',
            '--no-sandbox',
            '--single-process',
            '--no-zygote',
          ],
          executablePath:
            process.env.NODE_ENV === 'production'
              ? process.env.PUPPETEER_EXECUTABLE_PATH
              : puppeteer.executablePath(),
          headless: true,
          // defaultViewport: false,
          // userDataDir: './tmp',
          timeout: 0,
        },
      });

      cluster.on('taskerror', (err, data) => {
        this.socketGetway.sendProgressUpdates(
          userId,
          `Error during scraping details of job: ( ${data} ) you can check it manually`,
          true,
        );
        console.log(`err ${data}: ${err.message}`);
      });

      await cluster.task(async ({ page, data: url }) => {
        page.setDefaultNavigationTimeout(0);
        const jobDetails = await this.scrapeJobDetails(userId, page, url);
        if (this.urls.length > this.jobs.length) {
          this.socketGetway.sendProgressUpdates(
            userId,
            `New job added... ${this.jobs.length + 1} from ${this.urls.length}`,
            false,
            false,
            true,
          );
          this.jobs.push(jobDetails);
        }
      });

      for (let i = 0; i < this.urls.length; i++) {
        cluster.queue(this.urls[i]);
      }

      await cluster.idle();
      await cluster.close();
    } catch (error) {
      console.error('Error occurred during cluster execution:', error);
      throw error; // Rethrow the error to be caught in the calling function
    }
  };

  runScrapping = async (
    userId: string,
    url: string,
    maxConcurrency: number,
  ) => {
    try {
      if (typeof url !== 'string') {
        return { status: 'error', error: 'URL must be a string' };
      } else if (!url.startsWith('https://wuzzuf.net/search/jobs')) {
        return { status: 'error', error: 'URL must be from Wuzzuf job search' };
      }
      const browser = await puppeteer.launch({
        args: [
          '--disable-setuid-sandbox',
          '--no-sandbox',
          '--single-process',
          '--no-zygote',
        ],
        executablePath:
          process.env.NODE_ENV === 'production'
            ? process.env.PUPPETEER_EXECUTABLE_PATH
            : puppeteer.executablePath(),
        headless: true,
        // userDataDir: './tmp',
      });
      const page = await browser.newPage();
      this.socketGetway.sendProgressUpdates(
        userId,
        `Browser launched successfully...`,
      );
      page.setDefaultNavigationTimeout(0);
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await this.scrapeJobLinks(userId, page);
      if (this.urls.length === 0) {
        return { status: 'error', error: 'NO JOBS HERE!!!' };
      }

      if (this.urls.length > 10) {
        this.socketGetway.sendProgressUpdates(
          userId,
          `there are ${this.urls.length} jobs but we will scraping first 10 only`,
          false,
          true,
        );
        this.urls = this.urls.slice(0, 10);
      } else {
        this.socketGetway.sendProgressUpdates(
          userId,
          `there are ${this.urls.length} jobs to scrape`,
          false,
          false,
          true,
        );
      }

      console.log(this.urls.length);

      await this.runClusters(userId, maxConcurrency);
      await browser.close();
      if (this.urls.length > this.jobs.length) {
        this.socketGetway.sendProgressUpdates(
          userId,
          `if there are missed jobs try to decrease the maxConcurrency ...`,
          false,
          true,
        );
      }
      this.socketGetway.sendProgressUpdates(
        userId,
        `Finish scrapping and browser closed...`,
      );
      return { status: 'complete', data: this.jobs };
    } catch (error) {
      console.error('Error occurred during scraping:', error);
      return { status: 'error', error: error.message };
    }
  };

  getJobs() {
    return this.jobs;
  }

  /***************************************************/

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
