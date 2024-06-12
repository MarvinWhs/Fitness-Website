/* Autor: Niklas Lobo */

import { expect } from 'chai';
import { Browser, BrowserContext, Page, chromium } from 'playwright';

describe('CalendarPageComponent', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;

  before(async () => {
    browser = await chromium.launch();
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto('http://localhost:8080/calendar-page'); // Adjust with your actual application URL
  });

  after(async () => {
    await browser.close();
  });

  it('should add, edit, and delete notes on the calendar page', async () => {
    // Wait for the calendar to load
    await page.waitForSelector('#calendar');

    // Add a new note
    await page.click('button#addNoteButton');
    await page.waitForSelector('#addNoteModal');
    await page.fill('input[name="name"]', 'Test Note');
    await page.fill('textarea[name="content"]', 'This is a test note.');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500); // Wait for the note to be added
    const addedNoteExists = await page.waitForSelector(`.note-card:has-text("Test Note")`);
    expect(addedNoteExists).to.exist;

    // Edit the added note
    await page.click('.edit-button');
    await page.waitForSelector('#editNoteModal');
    await page.fill('textarea[name="content"]', 'Updated note content.');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500); // Wait for the note to be updated
    const updatedNoteExists = await page.waitForSelector(`.note-card:has-text("Updated note content.")`);
    expect(updatedNoteExists).to.exist;

    // Delete the note
    await page.click('.delete-button');
    await page.waitForTimeout(500); // Wait for the note to be deleted
    const deletedNote = await page.waitForSelector(`.note-card:has-text("Updated note content.")`, {
      state: 'detached'
    });
    expect(deletedNote).to.be.null;
  });
});
