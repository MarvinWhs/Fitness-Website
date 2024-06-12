import { expect } from 'chai';
import { html, fixture, fixtureCleanup } from '@open-wc/testing-helpers';
import sinon from 'sinon';
import './nutrition-tracker';
import { NutritionTracker } from './nutrition-tracker';
import { HttpClient } from '../../../http-client'; // Import the HttpClient

describe('NutritionTracker', () => {
  let element: NutritionTracker;
  let httpClientStub: sinon.SinonStubbedInstance<HttpClient>;

  beforeEach(async () => {
    httpClientStub = sinon.createStubInstance(HttpClient);
    element = await fixture<NutritionTracker>(html`<nutrition-tracker></nutrition-tracker>`);
    element.httpClient = httpClientStub as unknown as HttpClient; // Cast to avoid TypeScript errors
  });

  afterEach(() => {
    fixtureCleanup();
    sinon.restore();
  });

  it('should initialize with an empty food card list', async () => {
    httpClientStub.get.resolves(new Response(JSON.stringify([])));
    await element.loadFoodCards();
    expect(element.foodCards).to.be.empty;
  });

  it('should fetch food cards on connectedCallback', async () => {
    const foodCards = [{ id: '1', name: 'Apple', calories: 95, description: 'A red apple', quantity: 1 }];
    httpClientStub.get.resolves(new Response(JSON.stringify(foodCards)));
    await element.connectedCallback();
    expect(element.foodCards).to.have.length(1);
  });

  it('should handle errors when fetching food cards', async () => {
    httpClientStub.get.rejects(new Error('Failed to fetch'));
    await element.loadFoodCards();
    expect(element.foodCards).to.be.empty;
  });

  it('should add a new food card', async () => {
    const newFoodCard = { id: '2', name: 'Banana', calories: 105, description: 'A ripe banana', quantity: 1 };
    httpClientStub.post.resolves(new Response(JSON.stringify(newFoodCard)));
    const form = new FormData();
    form.append('name', 'Banana');
    form.append('description', 'A ripe banana');
    form.append('calories', '105');
    form.append('quantity', '1');
    await element.addFoodCard({
      preventDefault: () => {},
      target: {
        elements: {
          name: { value: 'Banana' },
          description: { value: 'A ripe banana' },
          calories: { value: '105' },
          quantity: { value: '1' }
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(element.foodCards).to.have.length(1);
  });

  it('should delete a food card', async () => {
    const foodCards = [{ id: '1', name: 'Apple', calories: 95, description: 'A red apple', quantity: 1 }];
    element.foodCards = foodCards;
    httpClientStub.delete.resolves(new Response());
    await element.deleteFoodCard('1');
    expect(element.foodCards).to.be.empty;
  });

  it('should handle errors when deleting a food card', async () => {
    const foodCards = [{ id: '1', name: 'Apple', calories: 95, description: 'A red apple', quantity: 1 }];
    element.foodCards = foodCards;
    httpClientStub.delete.rejects(new Error('Failed to delete'));
    await element.deleteFoodCard('1');
    expect(element.foodCards).to.have.length(1);
  });

  it('should update a food card quantity', async () => {
    const foodCard = { id: '1', name: 'Apple', calories: 95, description: 'A red apple', quantity: 1 };
    element.foodCards = [foodCard];
    const updatedFoodCard = { ...foodCard, quantity: 2 };
    httpClientStub.put.resolves(new Response(JSON.stringify(updatedFoodCard)));
    await element.updateFoodCard('1', 2);
    expect(element.foodCards[0].quantity).to.equal(2);
  });

  it('should set total calories', async () => {
    const inputElement = element.shadowRoot?.querySelector<HTMLInputElement>('.input_calories');
    if (inputElement) {
      inputElement.value = '2000';
      inputElement.dispatchEvent(new Event('input'));
    }
    element.submitTotalCalories();
    expect(element.totalCalories).to.equal(2000);
  });

  it('should reset total calories', () => {
    element.totalCalories = 2000;
    element.resetTotalCalories();
    expect(element.totalCalories).to.equal(0);
  });

  it('should calculate remaining calories correctly', () => {
    element.totalCalories = 2000;
    element.foodCards = [{ id: '1', name: 'Apple', calories: 95, description: 'A red apple', quantity: 2 }];
    const remainingCalories = element.getRemainingCalories();
    expect(remainingCalories).to.equal(1810);
  });
});
