import { expect } from 'chai';
import { html, fixture, fixtureCleanup } from '@open-wc/testing-helpers';
import sinon from 'sinon';
import './trainings-sessions';
import { TrainingsComponent } from './trainings-sessions';
import { describe, beforeEach, afterEach, it, before, after } from 'node:test';

describe('TrainingsComponent', () => {
  let element: TrainingsComponent;
  let httpClient: unknown;

  beforeEach(async () => {
    element = await fixture<TrainingsComponent>(html`<trainings-sessions></trainings-sessions>`);
    httpClient = {
      post: sinon.stub().resolves({ status: 200 })
    };
    (element as any).httpClient = httpClient;
  });

  afterEach(() => {
    fixtureCleanup();
  });

  it('should render correctly', () => {
    const mainContent = element.shadowRoot!.querySelector('.main-content');
    expect(mainContent).to.not.be.null;
  });

  it('should open modal on button click', async () => {
    const button = element.shadowRoot!.querySelector('.link-button') as HTMLButtonElement;
    button.click();
    await element.updateComplete;

    const modal = element.shadowRoot!.querySelector('#addExerciseModal') as HTMLElement;
    expect(modal.style.display).to.equal('flex');
    expect(element.isModalOpen).to.be.true;
  });

  it('should close modal on close button click', async () => {
    const button = element.shadowRoot!.querySelector('.link-button') as HTMLButtonElement;
    button.click();
    await element.updateComplete;

    const closeButton = element.shadowRoot!.querySelector('.close-button') as HTMLButtonElement;
    closeButton.click();
    await element.updateComplete;

    const modal = element.shadowRoot!.querySelector('#addExerciseModal') as HTMLElement;
    expect(modal.style.display).to.equal('none');
    expect(element.isModalOpen).to.be.false;
  });

  it('should handle file upload', async () => {
    const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
    const input = element.shadowRoot!.querySelector('input[type="file"]') as HTMLInputElement;

    const event = new Event('change');
    Object.defineProperty(input, 'files', { value: [file] });
    input.dispatchEvent(event);

    await element.updateComplete;

    expect(element.imageData).to.not.be.null;
  });

  it('should remove uploaded image', async () => {
    element.imageData = 'data:image/png;base64,dummycontent';
    await element.updateComplete;

    const removeButton = element.shadowRoot!.querySelector('.delete-image') as HTMLButtonElement;
    removeButton.click();

    await element.updateComplete;

    expect(element.imageData).to.be.null;
    expect(element.fileInput.value).to.equal('');
  });

  it('should add exercise', async () => {
    const spyCloseModal = sinon.spy(element as any, 'closeModal'); // as any workaround for private method

    element.imageData = 'data:image/png;base64,dummycontent';
    const button = element.shadowRoot!.querySelector('.link-button') as HTMLButtonElement;
    button.click();
    await element.updateComplete;

    const form = element.shadowRoot!.querySelector('form') as HTMLFormElement;
    const nameInput = form.querySelector('input[name="name"]') as HTMLInputElement;
    const descriptionInput = form.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
    const durationInput = form.querySelector('input[name="duration"]') as HTMLInputElement;
    const difficultySelect = form.querySelector('select[name="difficulty"]') as HTMLSelectElement;

    nameInput.value = 'Test Exercise';
    descriptionInput.value = 'This is a test exercise';
    durationInput.value = '30';
    difficultySelect.value = 'Medium';

    const submitEvent = new Event('submit', {
      bubbles: true,
      cancelable: true
    });
    form.dispatchEvent(submitEvent);

    await element.updateComplete;

    expect(httpClient.post.calledOnce).to.be.true;
    expect(httpClient.post.firstCall.args[0]).to.equal('http://localhost:3000/exercises');
    expect(httpClient.post.firstCall.args[1]).to.deep.include({
      name: 'Test Exercise',
      description: 'This is a test exercise',
      duration: 30,
      difficulty: 'Medium',
      image: element.imageData
    });

    expect(spyCloseModal.calledOnce).to.be.true;

    spyCloseModal.restore();
  });

  it('should handle error during add exercise', async () => {
    httpClient.post.rejects(new Error('Failed to add exercise'));
    const consoleErrorSpy = sinon.spy(console, 'error');

    element.imageData = 'data:image/png;base64,dummycontent';
    const button = element.shadowRoot!.querySelector('.link-button') as HTMLButtonElement;
    button.click();
    await element.updateComplete;

    const form = element.shadowRoot!.querySelector('form') as HTMLFormElement;
    const nameInput = form.querySelector('input[name="name"]') as HTMLInputElement;
    const descriptionInput = form.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
    const durationInput = form.querySelector('input[name="duration"]') as HTMLInputElement;
    const difficultySelect = form.querySelector('select[name="difficulty"]') as HTMLSelectElement;

    nameInput.value = 'Test Exercise';
    descriptionInput.value = 'This is a test exercise';
    durationInput.value = '30';
    difficultySelect.value = 'Medium';

    const submitEvent = new Event('submit', {
      bubbles: true,
      cancelable: true
    });
    form.dispatchEvent(submitEvent);

    await element.updateComplete;

    expect(httpClient.post.calledOnce).to.be.true;
    expect(consoleErrorSpy.calledWith('Fehler beim Senden der Daten:', sinon.match.any)).to.be.true;

    consoleErrorSpy.restore();
  });

  let mockFileReader: sinon.SinonStub;

  before(() => {
    mockFileReader = sinon.stub(window, 'FileReader').callsFake(function (this: FileReader) {
      this.readAsDataURL = function () {
        const event = { target: this } as ProgressEvent<FileReader>;
        this.onload!(event);
      };
      this.onerror = null;
      return this;
    });
  });

  after(() => {
    mockFileReader.restore();
  });

  it('should scale image if needed', async () => {
    const largeFile = new File([new ArrayBuffer(2 * 1024 * 1024)], 'large.png', { type: 'image/png' });

    const mockFileReader = sinon.stub(window, 'FileReader').callsFake(function (this: FileReader) {
      this.readAsDataURL = function () {
        const event = { target: this } as ProgressEvent<FileReader>;
        console.log('Mock FileReader readAsDataURL called');
        this.onload!(event);
      };
      return this;
    });

    const imgStub = sinon.stub(window, 'Image').callsFake(() => {
      const img = new Image();
      img.onload = function () {
        console.log('Mock Image onload called');
        (img as HTMLImageElement).width = 4000;
        (img as HTMLImageElement).height = 3000;
        img.onload = null; // remove handler after first call
      };
      return img;
    });

    const input = element.shadowRoot!.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [largeFile] });

    const event = new Event('change');
    input.dispatchEvent(event);

    await element.updateComplete;

    expect(element.imageData).to.not.be.null;

    mockFileReader.restore();
    imgStub.restore();
  });

  it('should handle error during image scaling', async () => {
    const largeFile = new File([new ArrayBuffer(2 * 1024 * 1024)], 'large.png', { type: 'image/png' });

    mockFileReader.restore();
    mockFileReader = sinon.stub(window, 'FileReader').callsFake(function (this: FileReader) {
      this.readAsDataURL = function () {
        const event = { target: this, type: 'error' } as ProgressEvent<FileReader>;
        this.onerror!(event);
      };
      return this;
    });

    const input = element.shadowRoot!.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [largeFile] });

    const event = new Event('change');
    input.dispatchEvent(event);

    try {
      await element.updateComplete;
    } catch (error) {
      expect((error as Error).message).to.equal('FileReader error');
    }
  });
});
