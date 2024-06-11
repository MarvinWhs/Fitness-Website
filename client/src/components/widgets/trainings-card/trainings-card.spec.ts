/* Autor: Marvin Wiechers */
import { expect } from 'chai';
import { html, fixture, fixtureCleanup } from '@open-wc/testing-helpers';
import sinon from 'sinon';
import './trainings-card';
import { TrainingsCard } from './trainings-card';
import { HttpClient } from './../../../http-client.js';

describe('TrainingsCard', () => {
  let element: TrainingsCard;
  let httpClientStub: sinon.SinonStubbedInstance<HttpClient>;

  beforeEach(async () => {
    httpClientStub = sinon.createStubInstance(HttpClient);
    element = await fixture<TrainingsCard>(html`<trainings-card></trainings-card>`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (element as any).httpClient = httpClientStub;
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

  it('should open edit modal, edit exercise, and close edit modal', async () => {
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

    httpClientStub.post.resolves(new Response(null, { status: 200 }));

    await element.updateComplete;

    const editButton = element.shadowRoot!.querySelector('.edit-exercise') as HTMLButtonElement;
    editButton.click();
    await element.updateComplete;

    expect(element.isEditModalOpen).to.be.true;
    await element.updateComplete;
    const modal = element.shadowRoot!.getElementById('editExerciseModal');
    expect(modal).to.not.be.null;
    if (modal) {
      expect(modal.style.display).to.equal('flex');
    }

    const nameInput = element.shadowRoot!.querySelector('input[name="name"]') as HTMLInputElement;
    expect(nameInput).to.not.be.null;
    if (nameInput) {
      nameInput.value = 'Updated Push Up';
      nameInput.dispatchEvent(new Event('input'));
    }

    const form = element.shadowRoot!.querySelector('form') as HTMLFormElement;
    expect(form).to.not.be.null;
    if (form) {
      httpClientStub.put.resolves(new Response(null, { status: 200 }));
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(submitEvent);
    }

    await element.updateComplete;

    expect(httpClientStub.put.calledOnce).to.be.true;
    expect(httpClientStub.put.args[0][0]).to.equal(`https://localhost:3000/exercises/1`);

    await element.updateComplete;

    expect(element.isEditModalOpen).to.be.false;
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

    httpClientStub.delete.resolves(new Response(null, { status: 200 }));

    await element.updateComplete;

    const deleteButton = element.shadowRoot!.querySelector('.delete-exercise') as HTMLButtonElement;
    deleteButton.click();

    await element.updateComplete;

    expect(httpClientStub.delete.calledOnce).to.be.true;
    expect(element.exercises.length).to.equal(0);
  });

  it('should not delete exercise if not authorized', async () => {
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

    httpClientStub.delete.resolves(new Response(null, { status: 401 }));

    await element.updateComplete;

    const deleteButton = element.shadowRoot!.querySelector('.delete-exercise') as HTMLButtonElement;
    deleteButton.click();

    await element.updateComplete;

    expect(httpClientStub.delete.calledOnce).to.be.true;
    expect(element.exercises.length).to.equal(1);
  });
});
