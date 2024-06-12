/* Autor: Niklas Lobo */

import { expect } from 'chai';
import { Browser, BrowserContext, Page, chromium } from 'playwright';

describe('RegisterPage', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;

  before(async () => {
    browser = await chromium.launch();
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto('http://localhost:8080//register-page');

    after(async () => {
      await browser.close();
    });

    it('should display registration form and handle registration process', async () => {
      await page.waitForSelector('input[name="username"]');
      await page.fill('input[name="username"]', 'testuser');
      await page.waitForSelector('input[name="password"]');
      await page.fill('input[name="password"]', 'Password1!');
      await page.waitForSelector('input[name="confirmPassword"]');
      await page.fill('input[name="confirmPassword"]', 'Password1!');
      await page.waitForSelector('input[name="email"]');
      await page.fill('input[name="email"]', 'testuser@example.com');

      await Promise.all([page.waitForLoadState(), page.click('button[type="submit"]')]);

      expect(page.url()).to.contain('/fitness-home');
    });

    it('should display error messages for invalid input', async () => {
      await page.waitForSelector('input[name="username"]');
      await page.fill('input[name="username"]', 'testuser');
      await page.waitForSelector('input[name="password"]');
      await page.fill('input[name="password"]', 'Password1!');
      await page.waitForSelector('input[name="confirmPassword"]');
      await page.fill('input[name="confirmPassword"]', 'Password1!');
      await page.waitForSelector('input[name="email"]');
      await page.fill('input[name="email"]', 'invalid-email');

      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);

      const emailErrorMessage = await page.$eval('input[name="email"] + .error-message', el => el.textContent?.trim());
      expect(emailErrorMessage).to.equal('Bitte geben Sie eine gültige E-Mail-Adresse an');
    });
  });
});
