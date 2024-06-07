/* Autor: Marvin Wiechers */
import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { expect } from 'chai';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('TrainingsComponent', () => {
  let browser: Browser | undefined;
  let context: BrowserContext | undefined;
  let page: Page | undefined;

  before(async () => {
    try {
      browser = await chromium.launch({ headless: false });
    } catch (error) {
      console.error('Error launching browser:', error);
    }
  });

  after(async () => {
    if (browser) {
      await browser.close();
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

  it('should render the component and display initial elements', async () => {
    if (!page) throw new Error('Page is not initialized');
    await page.goto('http://localhost:8080/exercises');
    const title = await page.textContent('h1');
    expect(title).to.equal('Fitness-Übungen');
  });

  it('should open the modal when the add exercise button is clicked', async () => {
    if (!page) throw new Error('Page is not initialized');
    await page.goto('http://localhost:8080/exercises');
    await page.click('button#adding');
    const modal = await page.$('#addExerciseModal');
    const style = await modal?.evaluate(node => window.getComputedStyle(node).display);
    expect(style).to.equal('flex');
  });

  it('should close the modal when the close button is clicked', async () => {
    if (!page) throw new Error('Page is not initialized');
    await page.goto('http://localhost:8080/exercises');
    await page.click('button#adding');
    await page.click('#addExerciseModal .close-button');
    const modal = await page.$('#addExerciseModal');
    const style = await modal?.evaluate(node => window.getComputedStyle(node).display);
    expect(style).to.equal('none');
  });

  it('should prevent adding an exercise without authentication', async () => {
    if (!page) throw new Error('Page is not initialized');
    await page.goto('http://localhost:8080/exercises');
    await page.click('button#adding');

    await page.fill('input[name="name"]', 'Test Exercise');
    await page.fill('textarea[name="description"]', 'Test Description');
    await page.fill('input[name="duration"]', '30');
    await page.selectOption('select[name="difficulty"]', 'Medium');

    // Mock file upload
    const fileInput = await page.$('input[type="file"]');
    const filePath = path.resolve(__dirname, 'assets/test-image.jpg');
    await fileInput?.setInputFiles(filePath);

    await page.click('button[type="submit"]');

    // Add a delay to ensure the form submission process is complete
    await page.waitForTimeout(1000);

    // Verify that the modal is still open
    const modal = await page.$('#addExerciseModal');
    const style = await modal?.evaluate(node => window.getComputedStyle(node).display);
    expect(style).to.equal('flex');

    // Check for error notification in Shadow DOM
    const notification = await page.$('notification-widget');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shadowRoot = await notification?.evaluateHandle((element: any) => element.shadowRoot);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorText = await shadowRoot?.evaluate((root: any) => root.querySelector('div').textContent);
    expect(errorText).to.include('Fehler beim Senden der Daten, melden Sie sich an!');
  });

  it('should prevent invalid file types from being uploaded', async () => {
    if (!page) throw new Error('Page is not initialized');
    await page.goto('http://localhost:8080/exercises');
    await page.click('button#adding');

    // Mock invalid file upload
    const fileInput = await page.$('input[type="file"]');
    const filePathInvalid = path.resolve(__dirname, 'assets/test-document.pdf');
    await fileInput?.setInputFiles(filePathInvalid);

    // Add a delay to ensure the file validation process is complete
    await page.waitForTimeout(1000);

    // Check for error notification in Shadow DOM
    const errorNotification = await page.$('notification-widget');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shadowRoot = await errorNotification?.evaluateHandle((element: any) => element.shadowRoot);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorText = await shadowRoot?.evaluate((root: any) => root.querySelector('div').textContent);
    expect(errorText).to.include('Ungültiger Dateityp. Bitte wählen Sie ein Bild.');
  });
});
