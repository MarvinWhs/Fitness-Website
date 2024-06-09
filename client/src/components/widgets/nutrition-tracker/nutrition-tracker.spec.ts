import { expect } from 'chai';
import { html, fixture, fixtureCleanup } from '@open-wc/testing-helpers';
import sinon from 'sinon';
import './nutrition-tracker';
import { NutritionTracker } from './nutrition-tracker';

describe('NutritionTracker', () => {
  let element: NutritionTracker;

  beforeEach(async () => {
    element = await fixture<NutritionTracker>(html`<nutrition-tracker></nutrition-tracker>`);
  });

  afterEach(() => {
    fixtureCleanup();
  });

  it('should render correctly', () => {
    const mainContent = element.shadowRoot!.querySelector('.main-content');
    expect(mainContent).to.not.be.null;
  });

  it('should fetch food cards on connectedCallback', async () => {
    const fetchStub = sinon.stub(window, 'fetch').resolves(
      new Response(
        JSON.stringify([
          {
            id: '1',
            name: 'Apple',
            calories: 52,
            description: 'A juicy apple',
            quantity: 1
          }
        ])
      )
    );

    await element.connectedCallback();
    expect(fetchStub.calledOnce).to.be.true;
    expect(element.foodCards.length).to.equal(1);
    fetchStub.restore();
  });

  it('should add food card', async () => {
    const postStub = sinon.stub(window, 'fetch').resolves(
      new Response(
        JSON.stringify({
          id: '2',
          name: 'Banana',
          calories: 89,
          description: 'A ripe banana',
          quantity: 1
        })
      )
    );

    const formData = new FormData();
    formData.append('name', 'Banana');
    formData.append('description', 'A ripe banana');
    formData.append('calories', '89');

    await element.addFoodCard({ target: { elements: formData } });

    expect(postStub.calledOnce).to.be.true;
    expect(element.foodCards.length).to.equal(2);
    postStub.restore();
  });

  it('should delete food card', async () => {
    element.foodCards = [
      {
        id: '1',
        name: 'Apple',
        calories: 52,
        description: 'A juicy apple',
        quantity: 1
      }
    ];

    const deleteStub = sinon.stub(window, 'fetch').resolves(new Response(null, { status: 200 }));

    await element.deleteFoodCard('1');
    expect(deleteStub.calledOnce).to.be.true;
    expect(element.foodCards.length).to.equal(0);
    deleteStub.restore();
  });

  it('should calculate remaining calories correctly', () => {
    element.foodCards = [
      {
        id: '1',
        name: 'Apple',
        calories: 52,
        description: 'A juicy apple',
        quantity: 1
      },
      {
        id: '2',
        name: 'Banana',
        calories: 89,
        description: 'A ripe banana',
        quantity: 1
      }
    ];

    element.totalCalories = 200;
    const remainingCalories = element.getRemainingCalories();
    expect(remainingCalories).to.equal(59);
  });

  it('should open and close modal', async () => {
    element.openModal();
    await element.updateComplete;
    expect(element.isModalOpen).to.be.true;

    element.closeModal();
    await element.updateComplete;
    expect(element.isModalOpen).to.be.false;
  });

  it('should show notification when exceeding calories', async () => {
    const openPopUpStub = sinon.stub(element, 'openPopUp');
    element.totalCalories = 100;

    element.foodCards = [
      {
        id: '1',
        name: 'Apple',
        calories: 52,
        description: 'A juicy apple',
        quantity: 1
      },
      {
        id: '2',
        name: 'Banana',
        calories: 89,
        description: 'A ripe banana',
        quantity: 1
      }
    ];

    await element.checkCalories();
    expect(openPopUpStub.calledOnce).to.be.true;
    openPopUpStub.restore();
  });
});
