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
    // Wait for the calendar to load
    await page.goto('https://localhost:8080/calendar-page'); // Adjust with your actual application URL

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

    // Add a new note
    await page.click('#addNoteButton');
    await page.waitForSelector('#addNoteModal');
    await page.fill('input[name="name"]', 'Test Note');
    await page.fill('textarea[name="content"]', 'This is a test note.');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500); // Wait for the note to be added

    // Check if the added note exists
    const addedNoteExists = await page.waitForSelector(`.note-card:has-text("Test Note")`);
    expect(addedNoteExists).to.exist;
  });

  it('should edit a note on the calendar page', async () => {
    // Wait for the calendar to load
    await page.goto('https://localhost:8080/calendar-page'); // Adjust with your actual application URL

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

    // Edit the added note
    await page.click('.edit-button');
    await page.waitForSelector('#editNoteModal');
    await page.fill('textarea[name="content"]', 'Updated note content.');
    await page.fill('textarea[name="name"]', 'Updated note content.');
    await page.click('button[name="noteEdit"]');
    await page.waitForTimeout(500); // Wait for the note to be updated

    // Check if the updated note exists
    const updatedNoteExists = await page.waitForSelector(`.note-card:has-text("Updated note content.")`);
    expect(updatedNoteExists).to.exist;
  });
  it('should delete a note on the calendar page', async () => {
    // Wait for the calendar to load
    await page.goto('https://localhost:8080/calendar-page'); // Adjust with your actual application URL

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

    // Delete the note
    await page.click('.delete-button');
    await page.waitForTimeout(500); // Wait for the note to be deleted

    // Check if the deleted note no longer exists
    const deletedNote = await page.waitForSelector(`.note-card:has-text("Updated note content.")`, {
      state: 'detached'
    });
    expect(deletedNote).to.be.null;
  });
});
