/* Autor: Niklas Lobo */

import { expect } from 'chai';
import { Browser, BrowserContext, Page, chromium } from 'playwright';

describe('LoginPage', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;

  before(async () => {
    try {
      browser = await chromium.launch({ headless: false });
    } catch (error) {
      console.error('Error launching browser:', error);
    }
  });

  beforeEach(async () => {
    if (browser) {
      context = await browser.newContext();
      page = await context.newPage();
    }
  });

  afterEach(async () => {
    if (context) {
      await context.close();
    }
  });

  after(async () => {
    if (browser) {
      await browser.close();
    }
  });

  it('should display login form and handle login process', async () => {
    await page.goto('https://localhost:8080/login-page');

    await page.waitForSelector('input[name="username"]');
    await page.fill('input[name="username"]', 'Testnutzer');
    await page.waitForSelector('input[name="password"]');
    await page.fill('input[name="password"]', 'Test123!');

    await Promise.all([page.waitForNavigation(), page.click('button[type="submit"]')]);

    expect(page.url()).to.contain('/fitness-home');
  });

  it('should render the main content of the login page', async () => {
    await page.goto('https://localhost:8080/login-page');
    await page.waitForSelector('.login-container');
    const mainContentExists = await page.isVisible('.login-container');
    expect(mainContentExists).to.be.true;
  });

  it('should have no error messages initially', async () => {
    await page.goto('https://localhost:8080/login-page');
    const errorMessages = await page.$$eval('.error-message', elements => elements.map(el => el.textContent?.trim()));
    expect(errorMessages.every(msg => !msg)).to.be.true;
  });
});
