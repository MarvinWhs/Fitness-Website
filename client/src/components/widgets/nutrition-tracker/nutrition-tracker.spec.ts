/* Autor: Lucas Berlage */

import { expect } from 'chai';
import { html, fixture, fixtureCleanup } from '@open-wc/testing-helpers';
import sinon from 'sinon';
import './nutrition-tracker';
import { NutritionTracker } from './nutrition-tracker';
import { HttpClient } from '../../../http-client';
import { Notificator } from '../notificator/notificator';

describe('NutritionTracker', () => {
  let element: NutritionTracker;
  let httpClient: HttpClient;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let httpClientStub: sinon.SinonStub;

  beforeEach(async () => {
    element = await fixture<NutritionTracker>(html`<nutrition-tracker></nutrition-tracker>`);
    httpClient = new HttpClient();
    httpClient.init('https://localhost:3000');
    httpClientStub = sinon.stub(httpClient, 'post').resolves(new Response(null, { status: 200 }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (element as any).httpClient = httpClient;
  });

  afterEach(() => {
    fixtureCleanup();
    sinon.restore();
  });

  it('should add foodcard', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spyCloseModal = sinon.spy(element as any, 'closeModal');

    const button = element.shadowRoot!.querySelector('.plus-button') as HTMLButtonElement;
    button.click();
    await element.updateComplete;

    const form = element.shadowRoot!.querySelector('form') as HTMLFormElement;
    const nameInput = form.querySelector('input[name="name"]') as HTMLInputElement;
    const descriptionInput = form.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
    const quantity = form.querySelector('input[name="quantity"]') as HTMLInputElement;
    const calories = form.querySelector('select[name="calories"]') as HTMLSelectElement;

    nameInput.value = 'Test Food';
    descriptionInput.value = 'This is a test';
    quantity.value = '30';
    calories.value = 'Medium';

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await element.updateComplete;

    expect(spyCloseModal.calledOnce).to.be.true;
  });

  it('should load food cards successfully', async () => {
    const foodCards = [{ id: '1', name: 'Apple', calories: 95, description: 'A red apple', quantity: 1 }];

    const getStub = sinon.stub(httpClient, 'get').resolves(new Response(JSON.stringify(foodCards)));

    await element.loadFoodCards();

    expect(element.foodCards).to.have.lengthOf(1);
    expect(element.foodCards[0].name).to.equal('Apple');

    sinon.assert.calledOnce(getStub);
  });

  it('should delete a food card', async () => {
    const foodCardId = '1';
    element.foodCards = [{ id: foodCardId, name: 'Apple', calories: 95, description: 'A red apple', quantity: 1 }];

    // Mock HttpClient delete method
    const deleteStub = sinon.stub(httpClient, 'delete').resolves(new Response(null, { status: 200 }));

    await element.deleteFoodCard(foodCardId);

    expect(element.foodCards).to.be.empty;

    sinon.assert.calledOnce(deleteStub);
  });

  it('should check calories', () => {
    element.totalCalories = 500;
    element.foodCards = [{ id: '1', name: 'Apple', calories: 95, description: 'A red apple', quantity: 1 }];

    const showNotificationStub = sinon.stub(Notificator, 'showNotification');

    element.checkCalories();

    sinon.assert.calledOnce(showNotificationStub);
  });

  it('should not add food card with empty inputs', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spyCloseModal = sinon.spy(element as any, 'closeModal');
    const button = element.shadowRoot!.querySelector('.plus-button') as HTMLButtonElement;
    button.click();
    await element.updateComplete;

    const form = element.shadowRoot!.querySelector('form') as HTMLFormElement;

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await element.updateComplete;

    expect(spyCloseModal.called).to.be.false;
  });

  it('should set total calories', () => {
    const inputValue = '200';

    const showNotificationStub = sinon.stub(Notificator, 'showNotification');

    const inputElement = element.totalCaloriesInput;
    inputElement.value = inputValue;

    element.submitTotalCalories();

    expect(element.totalCalories).to.equal(parseInt(inputValue));
    sinon.assert.calledOnce(showNotificationStub);
  });

  it('should reset total calories', () => {
    element.totalCalories = 200;

    const showNotificationStub = sinon.stub(Notificator, 'showNotification');

    element.resetTotalCalories();

    expect(element.totalCalories).to.equal(0);
    sinon.assert.calledOnce(showNotificationStub);
  });

  it('should open the modal', () => {
    element.openModal();

    expect(element.isModalOpen).to.be.true;
  });

  it('should close the modal', () => {
    element.isModalOpen = true;

    element.closeModal();

    expect(element.isModalOpen).to.be.false;
  });

  it('should add a food card with valid inputs', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spyCloseModal = sinon.spy(element as any, 'closeModal');

    const button = element.shadowRoot!.querySelector('.plus-button') as HTMLButtonElement;
    button.click();
    await element.updateComplete;

    const form = element.shadowRoot!.querySelector('form') as HTMLFormElement;
    const nameInput = form.querySelector('input[name="name"]') as HTMLInputElement;
    const descriptionInput = form.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
    const quantityInput = form.querySelector('input[name="quantity"]') as HTMLInputElement;
    const caloriesInput = form.querySelector('input[name="calories"]') as HTMLInputElement;

    nameInput.value = 'Test Food';
    descriptionInput.value = 'This is a test food';
    quantityInput.value = '2';
    caloriesInput.value = '150';

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await element.updateComplete;

    expect(spyCloseModal.calledOnce).to.be.true;
    expect(element.foodCards).to.have.lengthOf(1);
    expect(element.foodCards[0].name).to.equal('Test Food');
  });

  it('should reset total calories and show notification', () => {
    element.totalCalories = 200;

    const showNotificationStub = sinon.stub(Notificator, 'showNotification');

    element.resetTotalCalories();

    expect(element.totalCalories).to.equal(0);
    sinon.assert.calledOnce(showNotificationStub);
  });
});
