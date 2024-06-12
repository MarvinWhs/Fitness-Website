import { expect } from 'chai';
import { html, fixture, fixtureCleanup } from '@open-wc/testing-helpers';
import sinon from 'sinon';
import './nutrition-tracker';
import { NutritionTracker } from './nutrition-tracker';
import { HttpClient } from '../../../http-client'; // Import des neuen HTTP-Clients

describe('NutritionTracker', () => {
  let element: NutritionTracker;
  let httpClient: HttpClient; // Verwendung des neuen HTTP-Clients
  let httpClientStub: sinon.SinonStub;

  beforeEach(async () => {
    element = await fixture<NutritionTracker>(html`<nutrition-tracker></nutrition-tracker>`);
    httpClient = new HttpClient(); // Initialisierung des neuen HTTP-Clients
    httpClient.init('https://localhost:3000'); // Setzen der Basis-URL für den HTTP-Client

    // Stub für die HTTP-Methoden
    sinon.stub(httpClient, 'get').resolves(new Response(JSON.stringify([]), { status: 200 }));
    httpClientStub = sinon.stub(httpClient, 'post').resolves(new Response(null, { status: 200 }));
    sinon.stub(httpClient, 'delete').resolves(new Response(null, { status: 200 }));
    sinon.stub(httpClient, 'put').resolves(new Response(null, { status: 200 }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (element as any).httpClient = httpClient; // Zuweisung des HTTP-Clients zur Komponente
  });

  afterEach(() => {
    fixtureCleanup();
    sinon.restore(); // Wiederherstellung des ursprünglichen HTTP-Clients und andere Stubs
  });

  it('should render correctly', () => {
    const mainContent = element.shadowRoot!.querySelector('.main-content');
    expect(mainContent).to.not.be.null;
  });

  it('should open modal on button click', async () => {
    const button = element.shadowRoot!.querySelector('.plus-button') as HTMLButtonElement;
    button.click();
    await element.updateComplete;

    const modal = element.shadowRoot!.querySelector('.modal-overlay') as HTMLElement;
    expect(modal).to.not.be.null;
    expect(element.isModalOpen).to.be.true;
  });

  it('should close modal on close button click', async () => {
    element.isModalOpen = true;
    await element.updateComplete;

    const closeButton = element.shadowRoot!.querySelector('.close-button') as HTMLButtonElement;
    closeButton.click();
    await element.updateComplete;

    const modal = element.shadowRoot!.querySelector('.modal-overlay') as HTMLElement;
    expect(modal).to.be.null;
    expect(element.isModalOpen).to.be.false;
  });

  it('should add food card', async () => {
    element.isModalOpen = true;
    await element.updateComplete;

    const form = element.shadowRoot!.querySelector('form') as HTMLFormElement;
    const nameInput = form.querySelector('input[name="name"]') as HTMLInputElement;
    const descriptionInput = form.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
    const caloriesInput = form.querySelector('input[name="calories"]') as HTMLInputElement;
    const quantityInput = form.querySelector('input[name="quantity"]') as HTMLInputElement;

    nameInput.value = 'Test Food';
    descriptionInput.value = 'This is a test food';
    caloriesInput.value = '100';
    quantityInput.value = '1';

    const submitEvent = new Event('submit', {
      bubbles: true,
      cancelable: true
    });
    form.dispatchEvent(submitEvent);

    await element.updateComplete;

    expect(httpClientStub.calledOnce).to.be.true;
    expect(httpClientStub.firstCall.args[0]).to.equal('https://localhost:3000/food-cards');
    expect(httpClientStub.firstCall.args[1]).to.deep.include({
      name: 'Test Food',
      description: 'This is a test food',
      calories: 100,
      quantity: 1
    });

    expect(element.isModalOpen).to.be.false;
  });

  it('should handle error during add food card', async () => {
    httpClientStub.rejects(new Error('Failed to add food card'));
    const consoleErrorSpy = sinon.spy(console, 'error');

    element.isModalOpen = true;
    await element.updateComplete;

    const form = element.shadowRoot!.querySelector('form') as HTMLFormElement;
    const nameInput = form.querySelector('input[name="name"]') as HTMLInputElement;
    const descriptionInput = form.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
    const caloriesInput = form.querySelector('input[name="calories"]') as HTMLInputElement;
    const quantityInput = form.querySelector('input[name="quantity"]') as HTMLInputElement;

    nameInput.value = 'Test Food';
    descriptionInput.value = 'This is a test food';
    caloriesInput.value = '100';
    quantityInput.value = '1';

    const submitEvent = new Event('submit', {
      bubbles: true,
      cancelable: true
    });
    form.dispatchEvent(submitEvent);

    await element.updateComplete;

    expect(httpClientStub.calledOnce).to.be.true;
    expect(consoleErrorSpy.calledWith('Fehler beim Hinzufügen der Food-card:', sinon.match.any)).to.be.true;

    consoleErrorSpy.restore();
  });

  it('should delete food card', async () => {
    element.foodCards = [
      { id: '1', name: 'Test Food', calories: 100, description: 'Test', quantity: 1, createdAt: '' }
    ];
    await element.updateComplete;

    const foodCard = element.shadowRoot!.querySelector('food-card') as HTMLElement;
    const deleteEvent = new CustomEvent('delete-food', { detail: '1' });
    foodCard.dispatchEvent(deleteEvent);

    await element.updateComplete;

    expect(element.foodCards.length).to.equal(0);
  });

  it('should update food card quantity', async () => {
    element.foodCards = [
      { id: '1', name: 'Test Food', calories: 100, description: 'Test', quantity: 1, createdAt: '' }
    ];
    await element.updateComplete;

    const foodCard = element.shadowRoot!.querySelector('food-card') as HTMLElement;
    const updateEvent = new CustomEvent('update-food', { detail: { id: '1', quantity: 2 } });
    foodCard.dispatchEvent(updateEvent);

    await element.updateComplete;

    expect(element.foodCards[0].quantity).to.equal(2);
  });

  it('should submit total calories', async () => {
    const input = element.shadowRoot!.querySelector('.input_calories') as HTMLInputElement;
    input.value = '2000';
    const button = element.shadowRoot!.querySelector('.submitCalories') as HTMLButtonElement;
    button.click();

    await element.updateComplete;

    expect(element.totalCalories).to.equal(2000);
  });

  it('should reset total calories', async () => {
    element.totalCalories = 2000;
    await element.updateComplete;

    const button = element.shadowRoot!.querySelector('.reset') as HTMLButtonElement;
    button.click();

    await element.updateComplete;

    expect(element.totalCalories).to.equal(0);
  });

  it('should calculate remaining calories', async () => {
    element.totalCalories = 2000;
    element.foodCards = [
      { id: '1', name: 'Food 1', calories: 500, description: 'Test', quantity: 1, createdAt: '' },
      { id: '2', name: 'Food 2', calories: 300, description: 'Test', quantity: 2, createdAt: '' }
    ];

    await element.updateComplete;

    const remainingCalories = element.getRemainingCalories();
    expect(remainingCalories).to.equal(900);
  });

  it('should open pop-up when calories exceed limit', async () => {
    const popUp = element.shadowRoot!.querySelector('pop-up') as HTMLElement & { show: sinon.SinonSpy };
    sinon.spy(popUp, 'show');

    element.totalCalories = 1000;
    element.foodCards = [
      { id: '1', name: 'Food 1', calories: 500, description: 'Test', quantity: 1, createdAt: '' },
      { id: '2', name: 'Food 2', calories: 600, description: 'Test', quantity: 1, createdAt: '' }
    ];

    await element.updateComplete;

    element.checkCalories();

    expect(popUp.show.calledOnce).to.be.true;
    expect(popUp.show.firstCall.args[0]).to.equal('Kalorienüberschreitung um 100 kcal!');
  });
});
