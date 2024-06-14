/* Autor: Niklas Lobo */

import { expect } from 'chai';
import { Browser, BrowserContext, Page, chromium } from 'playwright';

describe('CalendarPageComponent', () => {
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

  it('should add a note on the calendar page', async () => {
    await page.goto('https://localhost:8080/calendar-page');

    await page.locator('#myNavbar').getByRole('link', { name: 'Anmelden' }).click();
    await page.getByLabel('Benutzer:').click();
    await page.getByLabel('Benutzer:').fill('test11');
    await page.getByLabel('Benutzer:').press('Tab');
    await page.getByLabel('Passwort:').fill('Test1234!');
    await page.getByLabel('Passwort:').press('Enter');
    await page.waitForNavigation();
    await page.locator('#myNavbar').getByRole('link', { name: 'Kalendar' }).click();
    await page.goto('https://localhost:8080/calendar-page');

    await page.waitForSelector('#calendar');

    await page.click('#addNoteButton');
    await page.waitForSelector('#addNoteModal');
    await page.fill('input[name="name"]', 'Test Note');
    await page.fill('textarea[name="content"]', 'This is a test note.');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    const addedNoteExists = await page.waitForSelector(`.note-card:has-text("Test Note")`);
    expect(addedNoteExists).to.exist;
  });

  it('should edit a note on the calendar page', async () => {
    await page.goto('https://localhost:8080/calendar-page');

    await page.locator('#myNavbar').getByRole('link', { name: 'Anmelden' }).click();
    await page.getByLabel('Benutzer:').click();
    await page.getByLabel('Benutzer:').fill('test11');
    await page.getByLabel('Benutzer:').press('Tab');
    await page.getByLabel('Passwort:').fill('Test1234!');
    await page.getByLabel('Passwort:').press('Enter');
    await page.waitForNavigation();
    await page.locator('#myNavbar').getByRole('link', { name: 'Kalendar' }).click();
    await page.goto('https://localhost:8080/calendar-page');

    await page.waitForSelector('#calendar');

    await page.click('.edit-button');
    await page.waitForSelector('#editNoteModal');
    await page.fill('note.name', 'Updated Test Note');
    await page.fill('note.content', 'This is a updated test note.');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    const updatedNoteExists = await page.waitForSelector(`.note-card:has-text("Updated note content.")`);
    expect(updatedNoteExists).to.exist;
  });
  it('should delete a note on the calendar page', async () => {
    await page.goto('https://localhost:8080/calendar-page');

    await page.locator('#myNavbar').getByRole('link', { name: 'Anmelden' }).click();
    await page.getByLabel('Benutzer:').click();
    await page.getByLabel('Benutzer:').fill('test11');
    await page.getByLabel('Benutzer:').press('Tab');
    await page.getByLabel('Passwort:').fill('Test1234!');
    await page.getByLabel('Passwort:').press('Enter');
    await page.waitForNavigation();
    await page.locator('#myNavbar').getByRole('link', { name: 'Kalendar' }).click();
    await page.goto('https://localhost:8080/calendar-page');

    await page.waitForSelector('#calendar');

    await page.click('.delete-button');
    await page.waitForTimeout(500);

    const deletedNote = await page.waitForSelector(`.note-card:has-text("Updated note content.")`, {
      state: 'detached'
    });
    expect(deletedNote).to.be.null;
  });
});
