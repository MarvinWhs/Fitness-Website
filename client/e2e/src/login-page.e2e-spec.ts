/* Autor: Niklas Lobo */

import { expect } from 'chai';
import { Browser, BrowserContext, Page, chromium } from 'playwright';

describe('LoginPage', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;

  before(async () => {
    browser = await chromium.launch();
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto('http://localhost:8080//login-page');
  });

  after(async () => {
    await browser.close();
  });

  it('should display login form and handle login process', async () => {
    await page.waitForSelector('input[name="username"]');
    await page.fill('input[name="username"]', 'testuser');
    await page.waitForSelector('input[name="password"]');
    await page.fill('input[name="password"]', 'password123');

    await Promise.all([page.waitForLoadState(), page.click('button[type="submit"]')]);

    expect(page.url()).to.contain('/fitness-home');
  });

  it('should display error messages for invalid input', async () => {
    await page.waitForSelector('input[name="username"]');
    await page.fill('input[name="username"]', '');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    const usernameErrorMessage = await page.$eval('input[name="username"] + .error-message', el =>
      el.textContent?.trim()
    );
    expect(usernameErrorMessage).to.equal('Benutzername darf nicht leer sein');
  });

  it('should render the main content of the login page', async () => {
    await page.waitForSelector('.login-container');
    const mainContentExists = await page.isVisible('.login-container');
    expect(mainContentExists).to.be.true;
  });

  it('should have no error messages initially', async () => {
    const errorMessages = await page.$$eval('.error-message', elements => elements.map(el => el.textContent?.trim()));
    expect(errorMessages.every(msg => !msg)).to.be.true;
  });
});
