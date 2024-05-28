import { expect } from 'chai';
import { html, fixture, fixtureCleanup } from '@open-wc/testing-helpers';
import sinon from 'sinon';
import './trainings-card';
import { TrainingsCard } from './trainings-card';
import { describe, beforeEach, afterEach, it } from 'node:test';

describe('TrainingsCard', () => {
  let element: TrainingsCard;

  beforeEach(async () => {
    element = await fixture<TrainingsCard>(html`<trainings-card></trainings-card>`);
  });

  afterEach(() => {
    fixtureCleanup();
  });

  it('should render correctly', () => {
    const searchBox = element.shadowRoot!.querySelector('.search-box');
    expect(searchBox).to.not.be.null;
  });

  it('should fetch exercises on connectedCallback', async () => {
    const fetchStub = sinon.stub(window, 'fetch').resolves(
      new Response(
        JSON.stringify([
          {
            id: '1',
            createdAt: Date.now(),
            name: 'Push Up',
            description: 'Do push ups',
            duration: 10,
            difficulty: 'Easy',
            image: ''
          }
        ])
      )
    );

    await element.connectedCallback();
    expect(fetchStub.calledOnce).to.be.true;
    expect(element.exercises.length).to.equal(1);
    fetchStub.restore();
  });

  it('should filter exercises based on search term', async () => {
    element.exercises = [
      {
        id: '1',
        createdAt: Date.now(),
        name: 'Push Up',
        description: 'Do push ups',
        duration: 10,
        difficulty: 'Easy',
        image: ''
      },
      {
        id: '2',
        createdAt: Date.now(),
        name: 'Pull Up',
        description: 'Do pull ups',
        duration: 15,
        difficulty: 'Medium',
        image: ''
      }
    ];

    const searchInput = element.shadowRoot!.querySelector('.search-box') as HTMLInputElement;
    searchInput.value = 'Push';
    searchInput.dispatchEvent(new Event('input'));
    await element.updateComplete;

    const filteredExercises = element.shadowRoot!.querySelectorAll('.exercise-container-container');
    expect(filteredExercises.length).to.equal(1);
  });

  it('should filter exercises based on difficulty', async () => {
    element.exercises = [
      {
        id: '1',
        createdAt: Date.now(),
        name: 'Push Up',
        description: 'Do push ups',
        duration: 10,
        difficulty: 'Easy',
        image: ''
      },
      {
        id: '2',
        createdAt: Date.now(),
        name: 'Pull Up',
        description: 'Do pull ups',
        duration: 15,
        difficulty: 'Medium',
        image: ''
      }
    ];

    const difficultySelect = element.shadowRoot!.querySelector('.difficulty-filter') as HTMLSelectElement;
    difficultySelect.value = 'Easy';
    difficultySelect.dispatchEvent(new Event('change'));
    await element.updateComplete;

    const filteredExercises = element.shadowRoot!.querySelectorAll('.exercise-container-container');
    expect(filteredExercises.length).to.equal(1);
  });

  it('should delete exercise', async () => {
    element.exercises = [
      {
        id: '1',
        createdAt: Date.now(),
        name: 'Push Up',
        description: 'Do push ups',
        duration: 10,
        difficulty: 'Easy',
        image: ''
      }
    ];

    const fetchStub = sinon.stub(window, 'fetch').resolves(new Response(null, { status: 200 }));

    await element.updateComplete;

    const deleteButton = element.shadowRoot!.querySelector('.delete-exercise') as HTMLButtonElement;
    deleteButton.click();

    await element.updateComplete;

    expect(element.exercises.length).to.equal(0);
    fetchStub.restore();
  });
});
