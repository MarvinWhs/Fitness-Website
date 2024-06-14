/* Autor: Lucas Berlage */

import { expect } from 'chai';
import { chromium, Browser, BrowserContext, Page } from 'playwright';

describe('NutritionTracker E2E', () => {
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

  it('should render the main content correctly', async () => {
    if (!page) throw new Error('Page is not initialized');
    await page.goto('https://localhost:8080/tracker-home');
    const title = await page.textContent('h1');
    expect(title).to.equal('Willkommen bei Ihrem persönlichen Ernährungstracker!');
  });

  it('should open the modal when the add food button is clicked', async () => {
    if (!page) throw new Error('Page is not initialized');
    await page.goto('https://localhost:8080/tracker-home');
    await page.click('.plus-button');
    const modal = await page.$('.modal-overlay');
    const style = await modal?.evaluate(node => window.getComputedStyle(node).display);
    expect(style).to.equal('flex');
  });

  it('should add a new food card', async () => {
    if (!page) throw new Error('Page is not initialized');
    await page.goto('https://localhost:8080/tracker-home');

    await page.locator('#myNavbar').getByRole('link', { name: 'Anmelden' }).click();
    await page.getByLabel('Benutzer:').click();
    await page.getByLabel('Benutzer:').fill('test11');
    await page.getByLabel('Benutzer:').press('Tab');
    await page.getByLabel('Passwort:').fill('Test1234!');
    await page.getByLabel('Passwort:').press('Enter');
    await page.waitForNavigation();
    await page.locator('#myNavbar').getByRole('link', { name: 'Ernährungstracker' }).click();
    await page.goto('https://localhost:8080/tracker-home');

    await page.click('.plus-button');
    await page.fill('input[name="name"]', 'Test Food');
    await page.fill('textarea[name="description"]', 'Test Description');
    await page.fill('input[name="calories"]', '100');
    await page.fill('input[name="quantity"]', '1');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.food-list');
    const foodCardsCount = await page.$$eval('.food-list .food-card', cards => cards.length);
    expect(foodCardsCount).to.be.greaterThan(0);
  });

  it('should set total calories to 2000 and reset', async () => {
    if (!page) throw new Error('Page is not initialized');
    await page.goto('https://localhost:8080/tracker-home');
    await page.fill('.input_calories', '2000');
    await page.click('.submitCalories');
    await page.waitForTimeout(1000);
    await page.click('.reset');
    const notification = await page.$('notification-widget');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shadowRoot = await notification?.evaluateHandle((element: any) => element.shadowRoot);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorText = await shadowRoot?.evaluate((root: any) => root.querySelector('div')?.textContent);
    expect(errorText).to.include('Gesamtkalorien erfolgreich zurückgesetzt');
  });

  it('should add 5 food cards', async () => {
    if (!page) throw new Error('Page is not initialized');
    await page.goto('https://localhost:8080/tracker-home');

    await page.locator('#myNavbar').getByRole('link', { name: 'Anmelden' }).click();
    await page.getByLabel('Benutzer:').click();
    await page.getByLabel('Benutzer:').fill('test11');
    await page.getByLabel('Benutzer:').press('Tab');
    await page.getByLabel('Passwort:').fill('Test1234!');
    await page.getByLabel('Passwort:').press('Enter');
    await page.waitForNavigation();
    await page.locator('#myNavbar').getByRole('link', { name: 'Ernährungstracker' }).click();
    await page.goto('https://localhost:8080/tracker-home');

    await page.fill('.input_calories', '500');
    await page.click('.submitCalories');

    for (let i = 0; i < 5; i++) {
      await page.click('.plus-button');
      await page.fill('input[name="name"]', 'Test Food');
      await page.fill('textarea[name="description"]', 'Test Description');
      await page.fill('input[name="calories"]', '1');
      await page.fill('input[name="quantity"]', '1');
      await page.click('button[type="submit"]');
      await page.waitForSelector('.food-list');
    }

    const foodCardsCount = await page.$$eval('.food-list .food-card', cards => cards.length);
    expect(foodCardsCount).to.be.greaterThan(4);
  });

  it('should close pop-up after adding a food card that exceeds calorie limit', async () => {
    if (!page) throw new Error('Page is not initialized');
    await page.goto('https://localhost:8080/tracker-home');

    await page.locator('#myNavbar').getByRole('link', { name: 'Anmelden' }).click();
    await page.getByLabel('Benutzer:').click();
    await page.getByLabel('Benutzer:').fill('test11');
    await page.getByLabel('Benutzer:').press('Tab');
    await page.getByLabel('Passwort:').fill('Test1234!');
    await page.getByLabel('Passwort:').press('Enter');
    await page.waitForNavigation();
    await page.locator('#myNavbar').getByRole('link', { name: 'Ernährungstracker' }).click();
    await page.goto('https://localhost:8080/tracker-home');

    await page.fill('.input_calories', '500');
    await page.click('.submitCalories');
    await page.click('.plus-button');
    await page.fill('input[name="name"]', 'High Calorie Food');
    await page.fill('textarea[name="description"]', 'Test Description');
    await page.fill('input[name="calories"]', '600');
    await page.fill('input[name="quantity"]', '1');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.food-list');

    const pop = await page.$('pop-up');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shadowRoot = await pop?.evaluateHandle((element: any) => element.shadowRoot);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorText = await shadowRoot?.evaluate((root: any) => root.querySelector('div')?.textContent);
    expect(errorText).to.include('Kalorienüberschreitung');
    await page.click('.accept-button');
    const popDisplay = await pop?.evaluate(node => window.getComputedStyle(node).display);
    expect(popDisplay).to.equal('none');
  });

  it('should delete a food card and verify it is removed', async () => {
    if (!page) throw new Error('Page is not initialized');
    await page.goto('https://localhost:8080/tracker-home');

    await page.locator('#myNavbar').getByRole('link', { name: 'Anmelden' }).click();
    await page.getByLabel('Benutzer:').click();
    await page.getByLabel('Benutzer:').fill('test11');
    await page.getByLabel('Benutzer:').press('Tab');
    await page.getByLabel('Passwort:').fill('Test1234!');
    await page.getByLabel('Passwort:').press('Enter');
    await page.waitForNavigation();
    await page.locator('#myNavbar').getByRole('link', { name: 'Ernährungstracker' }).click();
    await page.goto('https://localhost:8080/tracker-home');

    await page.click('.plus-button');
    await page.fill('input[name="name"]', 'Test Food to Delete');
    await page.fill('textarea[name="description"]', 'Test Description');
    await page.fill('input[name="calories"]', '100');
    await page.fill('input[name="quantity"]', '1');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.food-list');
    const foodCardsCountBefore = await page.$$eval('.food-list .food-card', cards => cards.length);
    await page.click('.food-card .delete-button');
    await page.waitForSelector('.food-list', { state: 'attached' });
    const foodCardsCountAfter = await page.$$eval('.food-list .food-card', cards => cards.length);
    expect(foodCardsCountAfter).to.equal(foodCardsCountBefore - 1);
  });

  it('should update the quantity of an existing food card and verify the change', async () => {
    if (!page) throw new Error('Page is not initialized');
    await page.goto('https://localhost:8080/tracker-home');

    await page.locator('#myNavbar').getByRole('link', { name: 'Anmelden' }).click();
    await page.getByLabel('Benutzer:').click();
    await page.getByLabel('Benutzer:').fill('test11');
    await page.getByLabel('Benutzer:').press('Tab');
    await page.getByLabel('Passwort:').fill('Test1234!');
    await page.getByLabel('Passwort:').press('Enter');
    await page.waitForNavigation();
    await page.locator('#myNavbar').getByRole('link', { name: 'Ernährungstracker' }).click();
    await page.goto('https://localhost:8080/tracker-home');

    await page.click('.plus-button');
    await page.fill('input[name="name"]', 'Test Food to Update');
    await page.fill('textarea[name="description"]', 'Test Description');
    await page.fill('input[name="calories"]', '100');
    await page.fill('input[name="quantity"]', '1');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.food-list');

    const foodCardToUpdate = await page.$('.food-list .food-card');
    if (foodCardToUpdate) {
      const updateButton = await foodCardToUpdate.$('.update-button');
      if (updateButton) {
        await updateButton.click();
        await page.fill('input[name="quantity"]', '3');
        await page.click('button[type="submit"]');
        await page.waitForSelector('.food-list');
        const updatedQuantity = await foodCardToUpdate.evaluate(card => card.querySelector('.quantity')?.textContent);
        expect(updatedQuantity).to.equal('3');
      }
    }
  });

  it('should display notification after setting total calories', async () => {
    if (!page) throw new Error('Page is not initialized');
    await page.goto('https://localhost:8080/tracker-home');
    await page.fill('.input_calories', '2000');
    await page.click('.submitCalories');
    const notification = await page.$('notification-widget');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shadowRoot = await notification?.evaluateHandle((element: any) => element.shadowRoot);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const notificationText = await shadowRoot?.evaluate((root: any) => root.querySelector('div')?.textContent);
    expect(notificationText).to.include('Gesamtkalorien erfolgreich gesetzt: 2000');
  });

  it('should not add a food card without calories', async () => {
    if (!page) throw new Error('Page is not initialized');
    await page.goto('https://localhost:8080/tracker-home');
    await page.click('.plus-button');
    await page.fill('input[name="name"]', 'Test Food');
    await page.fill('textarea[name="description"]', 'Test Description');
    await page.fill('input[name="quantity"]', '1');
    await page.click('button[type="submit"]');
    const modal = await page.$('.modal-overlay');
    const style = await modal?.evaluate(node => window.getComputedStyle(node).display);
    expect(style).to.equal('flex');
  });

  it('should display pop-up when adding food exceeds total calories', async () => {
    if (!page) throw new Error('Page is not initialized');
    await page.goto('https://localhost:8080/tracker-home');
    await page.fill('.input_calories', '300');
    await page.click('.submitCalories');
    await page.click('.plus-button');
    await page.fill('input[name="name"]', 'Excessive Food');
    await page.fill('textarea[name="description"]', 'Test Description');
    await page.fill('input[name="calories"]', '500');
    await page.fill('input[name="quantity"]', '1');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.food-list');

    const pop = await page.$('pop-up');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shadowRoot = await pop?.evaluateHandle((element: any) => element.shadowRoot);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorText = await shadowRoot?.evaluate((root: any) => root.querySelector('div')?.textContent);
    expect(errorText).to.include('Kalorienüberschreitung');
  });
});
