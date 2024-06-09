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
    await page.goto('https://localhost:8080/exercises');
    const title = await page.textContent('h1');
    expect(title).to.equal('Fitness-Übungen');
  });

  it('should open the modal when the add exercise button is clicked', async () => {
    if (!page) throw new Error('Page is not initialized');
    await page.goto('https://localhost:8080/exercises');
    await page.click('button#adding');
    const modal = await page.$('#addExerciseModal');
    const style = await modal?.evaluate(node => window.getComputedStyle(node).display);
    expect(style).to.equal('flex');
  });

  it('should add an exercise', async () => {
    if (!page) throw new Error('Page is not initialized');
    await page.goto('https://localhost:8080');

    await page.locator('#myNavbar').getByRole('link', { name: 'Anmelden' }).click();
    await page.getByLabel('Benutzer:').click();
    await page.getByLabel('Benutzer:').fill('Testie2');
    await page.getByLabel('Benutzer:').press('Tab');
    await page.getByLabel('Passwort:').fill('Test123!');
    await page.getByLabel('Passwort:').press('Enter');
    await page.waitForNavigation();
    await page.locator('#myNavbar').getByRole('link', { name: 'Trainingseinheiten' }).click();
    await page.goto('https://localhost:8080/exercises');

    await page.getByRole('button', { name: 'Jetzt Übungen hinzufügen' }).click();
    await page.getByPlaceholder('Name der Übung').click();
    await page.getByPlaceholder('Name der Übung').fill('Übung 1');
    await page.getByPlaceholder('Name der Übung').press('Tab');
    await page.getByPlaceholder('Beschreibung der Übung').fill('Testentesten');
    await page.getByPlaceholder('Beschreibung der Übung').press('Tab');
    await page.getByPlaceholder('Dauer in Minuten').press('Enter');
    await page.getByPlaceholder('Dauer in Minuten').press('ArrowUp');
    await page.getByPlaceholder('Dauer in Minuten').press('ArrowUp');
    await page.getByPlaceholder('Dauer in Minuten').press('ArrowUp');
    await page.locator('select[name="difficulty"]').selectOption('Easy');
    await page.getByRole('button', { name: 'Hinzufügen', exact: true }).click();

    await page.waitForTimeout(1000);

    const exercises = await page.$$('.exercise');
    const exerciseNames = await Promise.all(exercises.map(async exercise => await exercise.textContent()));
    expect(exerciseNames.some(name => name?.includes('Übung 1'))).to.be.true;

    await page.waitForTimeout(1000);

    await page.hover('.exercise-container-container:first-child');
    await page.getByRole('button', { name: 'Übung löschen' }).click();
  });

  it('should prevent adding an exercise without authentication', async () => {
    if (!page) throw new Error('Page is not initialized');
    await page.goto('https://localhost:8080/exercises');
    await page.click('button#adding');

    await page.fill('input[name="name"]', 'Test Exercise');
    await page.fill('textarea[name="description"]', 'Test Description');
    await page.fill('input[name="duration"]', '30');
    await page.selectOption('select[name="difficulty"]', 'Medium');

    const fileInput = await page.$('input[type="file"]');
    const filePath = path.resolve(__dirname, 'assets/test-image.jpg');
    await fileInput?.setInputFiles(filePath);

    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    const modal = await page.$('#addExerciseModal');
    const style = await modal?.evaluate(node => window.getComputedStyle(node).display);
    expect(style).to.equal('flex');

    const notification = await page.$('notification-widget');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shadowRoot = await notification?.evaluateHandle((element: any) => element.shadowRoot);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorText = await shadowRoot?.evaluate((root: any) => root.querySelector('div').textContent);
    expect(errorText).to.include('Fehler beim Senden der Daten, melden Sie sich an!');
  });

  it('should prevent invalid file types from being uploaded', async () => {
    if (!page) throw new Error('Page is not initialized');
    await page.goto('https://localhost:8080/exercises');
    await page.click('button#adding');

    const fileInput = await page.$('input[type="file"]');
    const filePathInvalid = path.resolve(__dirname, 'assets/test-document.pdf');
    await fileInput?.setInputFiles(filePathInvalid);

    await page.waitForTimeout(1000);

    const errorNotification = await page.$('notification-widget');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shadowRoot = await errorNotification?.evaluateHandle((element: any) => element.shadowRoot);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorText = await shadowRoot?.evaluate((root: any) => root.querySelector('div').textContent);
    expect(errorText).to.include('Ungültiger Dateityp. Bitte wählen Sie ein Bild.');
  });
});
