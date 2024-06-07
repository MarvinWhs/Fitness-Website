import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { expect } from 'chai';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Falls du TypeScript verwendest, um den aktuellen Dateipfad zu bekommen
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('TrainingsCardComponent', () => {
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

  it('should filter exercises based on search input', async () => {
    if (!page) throw new Error('Page is not initialized');
    await page.goto('http://localhost:8080/exercises');

    await page.fill('input.search-box', 'test exercise');
    await page.waitForTimeout(1000); // Warte auf die Filterung

    const exercises = await page.$$('.exercise');
    const exerciseNames = await Promise.all(exercises.map(async exercise => await exercise.textContent()));

    expect(exerciseNames.every(name => name?.toLowerCase().includes('test exercise'))).to.be.true;
  });

  it('should filter exercises based on difficulty', async () => {
    if (!page) throw new Error('Page is not initialized');
    await page.goto('http://localhost:8080/exercises');

    await page.selectOption('select.difficulty-filter', 'Medium');
    await page.waitForTimeout(1000); // Warte auf die Filterung

    const exercises = await page.$$('.exercise-details p:has-text("Schwierigkeitsgrad: Medium")');
    expect(exercises.length).to.be.greaterThan(0);
  });

  it('should prevent deleting an exercise without authentication', async () => {
    if (!page) throw new Error('Page is not initialized');
    await page.goto('http://localhost:8080/exercises');

    const deleteButton = await page.$('.delete-exercise');
    await deleteButton?.click();

    await page.waitForTimeout(1000);

    const notification = await page.$('notification-widget');
    const shadowRoot = await notification?.evaluateHandle((element: any) => element.shadowRoot);
    const errorText = await shadowRoot?.evaluate((root: any) => root.querySelector('div')?.textContent);
    expect(errorText).to.include('Sie müssen sich anmelden, um Übungen löschen zu können!');
  });

  it('should delete an exercise when authenticated', async () => {
    if (!page) throw new Error('Page is not initialized');
    await page.goto('http://localhost:8080/login-page');

    // Führe hier die Login-Schritte aus
    await page.fill('input[name="username"]', 'Testie2');
    await page.fill('input[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();

    await page.goto('http://localhost:8080/exercises');

    const deleteButton = await page.$('.delete-exercise');
    await deleteButton?.click();

    await page.waitForTimeout(1000);

    const notification = await page.$('notification-widget');
    const shadowRoot = await notification?.evaluateHandle((element: any) => element.shadowRoot);
    const successText = await shadowRoot?.evaluate((root: any) => root.querySelector('div')?.textContent);
    expect(successText).to.include('Übung erfolgreich gelöscht');
  });

  it("should prevent deleting another user's exercise", async () => {
    if (!page) throw new Error('Page is not initialized');
    await page.goto('http://localhost:8080/login-page');

    // Führe hier die Login-Schritte aus
    await page.fill('input[name="username"]', 'Testie2');
    await page.fill('input[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();

    await page.goto('http://localhost:8080/exercises');

    // Suche nach einer Übung, die nicht dem angemeldeten Benutzer gehört
    const otherUsersExercise = await page.$('.exercise:has-text("Nicht Testuser Übung") .delete-exercise');
    if (otherUsersExercise) {
      await otherUsersExercise.click();
      await page.waitForTimeout(1000);

      const notification = await page.$('notification-widget');
      const shadowRoot = await notification?.evaluateHandle((element: any) => element.shadowRoot);
      const errorText = await shadowRoot?.evaluate((root: any) => root.querySelector('div')?.textContent);
      expect(errorText).to.include('Sie können nur Übungen löschen, welche sie selber erstellt haben!');
    } else {
      console.warn('Keine Übung von einem anderen Benutzer zum Testen gefunden');
    }
  });
});
