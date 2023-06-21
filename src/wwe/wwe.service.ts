import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { Cluster } from 'puppeteer-cluster';
import { WweJobs } from './wwe-jobs.interface';

@Injectable()
export class WweService {
  urls: string[] = [];
  jobs: WweJobs[] = [];

  sleep = (milliseconds: number) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  };

  scrapeJobLinks = async (page) => {
    console.log(`scraping job's link`);

    await this.sleep(3000);
    await page.waitForSelector('.jobs');
    const allJobs = await page.$$('.jobs > article > ul > li');
    console.log(allJobs.length);

    for (const job of allJobs) {
      let link = '';
      try {
        link = await page.evaluate(
          (el) =>
            el
              .querySelector('li a[href^="/remote-jobs/"]')
              .getAttribute('href'),
          job,
        );
        if (link.startsWith('/categories')) {
          continue;
        } else {
          link = 'https://weworkremotely.com' + link;
        }
        if (!this.urls.includes(link)) {
          this.urls.push(link);
        }
      } catch (err) {}
    }
    console.log('url length: ' + this.urls.length);
    console.log(this.urls);
  };

  scrapeJobDetails = async (page, url: string) => {
    console.log(`scrapping Job Details... `);
    await page.goto(url);
    await page.waitForSelector('.listing-header-container', { timeout: 5000 });

    let title: string,
      companyLogo: string,
      jobRequirements = '';

    const jobTitleElement = await page.$('.listing-header-container > h1');
    if (jobTitleElement) {
      title = await jobTitleElement.evaluate((element) => element.textContent);
    } else {
      console.error('Job title element not found');
    }

    const jobTypes = [];
    for (const jobType of await page.$$('.listing-tag')) {
      const jobTypeName = await jobType.evaluate((el) => el.textContent);
      jobTypes.push(jobTypeName);
    }

    const company: string = await page.$eval(
      '.company-card > h2',
      (el) => el.textContent,
    );

    try {
      companyLogo = await page.$eval('.listing-logo > img', (el) =>
        el.getAttribute('src'),
      );
    } catch (err) {}

    const applicants: string = await page.$eval(
      'h3:nth-of-type(2)',
      (el) => el.textContent,
    );
    const postedDate: string = await page.$eval(
      '.listing-header-container > h3',
      (el) => el.textContent,
    );

    jobRequirements = await page.$eval(
      '.listing-container',
      (el) => el.innerHTML,
    );

    return {
      title,
      jobTypes,
      company,
      companyLogo,
      applicants,
      postedDate,
      jobRequirements,
      url,
    };
  };

  runClusters = async (maxConcurrency: number) => {
    console.log(`clusters started to scrape Job Details`);
    const cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_PAGE,
      maxConcurrency,
      // monitor: true,
      puppeteerOptions: {
        headless: true,
        // defaultViewport: false,
        userDataDir: './tmp',
        timeout: 0,
      },
    });

    cluster.on('taskerror', (err, data) => {
      console.log(`err ${data}: ${err.message}`);
    });

    await cluster.task(async ({ page, data: url }) => {
      const jobDetails = await this.scrapeJobDetails(page, url);
      if (this.urls.length > this.jobs.length) {
        this.jobs.push(jobDetails);
        console.log(
          `adding new job!! ... there are ${this.jobs.length} jobs now`,
        );
      }
    });

    for (const url of this.urls) {
      cluster.queue(url);
    }

    await cluster.idle();
    await cluster.close();
  };

  runScrapping = async (url: string, maxConcurrency: number) => {
    try {
      console.log(this.jobs.length);
      if (
        !url.startsWith('https://weworkremotely.com/categories') &&
        !url.startsWith('https://weworkremotely.com/remote-jobs/search')
      ) {
        return { status: 'error', error: 'URL must be from WWE job search' };
      }

      const browser = await puppeteer.launch({
        headless: true,
        userDataDir: './tmp',
      });

      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(0);
      console.log(`launching the browser`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });

      await this.scrapeJobLinks(page);

      if (this.urls.length === 0) {
        return { status: 'error', error: 'NO JOBS HERE!!!' };
      }
      console.log(this.urls.length);

      if (this.urls.length > 9) {
        this.urls = this.urls.slice(0, 9);
      }
      console.log(this.urls.length);

      await this.runClusters(maxConcurrency);

      await browser.close();

      return { status: 'complete', data: this.jobs };
    } catch (error) {
      console.error('Error occurred during scraping:', error);
      return { status: 'error', error: error.message };
    }
  };
  getJobs() {
    return this.jobs;
  }
}
