/* Autor: Marvin Wiechers */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { expect } from 'chai';

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
    await page.goto('https://localhost:8080/exercises');
    const title = await page.textContent('h1');
    expect(title).to.equal('Fitness-Übungen');
  });

  it('should filter exercises based on search input', async () => {
    if (!page) throw new Error('Page is not initialized');
    await page.goto('https://localhost:8080/exercises');

    await page.fill('input.search-box', 'test exercise');
    await page.waitForTimeout(1000); // Warte auf die Filterung

    const exercises = await page.$$('.exercise');
    const exerciseNames = await Promise.all(exercises.map(async exercise => await exercise.textContent()));

    expect(exerciseNames.every(name => name?.toLowerCase().includes('test exercise'))).to.be.true;
  });

  it('should filter exercises based on difficulty', async () => {
    if (!page) throw new Error('Page is not initialized');
    await page.goto('https://localhost:8080/exercises');

    await page.selectOption('select.difficulty-filter', 'Medium');
    await page.waitForTimeout(1000); // Warte auf die Filterung

    const exercises = await page.$$('.exercise-details p:has-text("Schwierigkeitsgrad: Medium")');
    expect(exercises.length).to.be.greaterThan(0);
  });

  it('should prevent deleting an exercise without authentication', async () => {
    if (!page) throw new Error('Page is not initialized');
    await page.goto('https://localhost:8080/exercises');
    await page.hover('.exercise-container-container:first-child');

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
    await page.getByPlaceholder('Beschreibung der Übung').click();
    await page.getByPlaceholder('Beschreibung der Übung').fill('hier ist die erste Beschreibung');
    await page.getByPlaceholder('Dauer in Minuten').click();
    await page.getByPlaceholder('Dauer in Minuten').fill('5');
    await page.locator('select[name="difficulty"]').selectOption('Medium');
    await page.getByRole('button', { name: 'Hinzufügen', exact: true }).click();

    await page.waitForTimeout(1000);

    await page.hover('.exercise-container-container:first-child');
    await page.getByRole('button', { name: 'Übung löschen' }).click();

    await page.waitForTimeout(1000);

    const notification = await page.$('notification-widget');
    const shadowRoot = await notification?.evaluateHandle((element: any) => element.shadowRoot);
    const successText = await shadowRoot?.evaluate((root: any) => root.querySelector('div')?.textContent);
    expect(successText).to.include('Übung erfolgreich gelöscht');
    await page.locator('#myNavbar').getByRole('button', { name: 'Ausloggen' }).click();
  });

  it("should prevent deleting another user's exercise", async () => {
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

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.hover('.exercise-container-container:last-child');
    await page.getByRole('button', { name: 'Übung löschen' }).click();

    await page.waitForTimeout(1000);

    const notification = await page.$('notification-widget');
    const shadowRoot = await notification?.evaluateHandle((element: any) => element.shadowRoot);
    const errorText = await shadowRoot?.evaluate((root: any) => root.querySelector('div')?.textContent);
    expect(errorText).to.include('Sie können nur Übungen löschen, welche sie selber erstellt haben!');
    await page.locator('#myNavbar').getByRole('button', { name: 'Ausloggen' }).click();
  });

  it('should add and edit an exercise', async () => {
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
    await page.getByPlaceholder('Name der Übung').fill('Test');
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
    await page.hover('.exercise-container-container:first-child');
    await page.getByRole('button', { name: 'Übung bearbeiten' }).click();
    await page.getByRole('textbox', { name: 'Beschreibung der Übung' }).click();
    await page.getByRole('textbox', { name: 'Beschreibung der Übung' }).fill('Hier wurde neu getestet');
    await page.getByRole('button', { name: 'Ändern' }).click();

    await page.waitForTimeout(1000);

    const notification = await page.$('notification-widget');
    const shadowRoot = await notification?.evaluateHandle((element: any) => element.shadowRoot);
    const successText = await shadowRoot?.evaluate((root: any) => root.querySelector('div')?.textContent);
    expect(successText).to.include('Übung erfolgreich aktualisiert');
    await page.locator('#myNavbar').getByRole('button', { name: 'Ausloggen' }).click();
  });
});
