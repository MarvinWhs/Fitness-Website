/* Autor: Niklas Lobo */

import { expect } from 'chai';
import { fixture, html } from '@open-wc/testing-helpers';
import sinon, { SinonSpy, SinonStub } from 'sinon';
import { CountdownWidget } from './countdown-widget';
import './countdown-widget';

describe('CountdownWidget', () => {
  let countdownWidget: CountdownWidget | null = null;
  let startTimerStub: SinonStub | null = null;
  let togglePopupSpy: SinonSpy | null = null;

  beforeEach(async () => {
    countdownWidget = await fixture<CountdownWidget>(html`<countdown-widget></countdown-widget>`);
    startTimerStub = sinon.stub(countdownWidget, 'startTimer'); // Stub startTimer method
    togglePopupSpy = sinon.spy(countdownWidget, 'togglePopup');
  });

  it('should start the timer when start button is clicked', async () => {
    const startButton = countdownWidget?.shadowRoot?.querySelector('button');
    if (startButton) {
      startButton.click();
      await countdownWidget?.updateComplete;
      expect(startTimerStub?.calledOnce).to.be.true;
    } else {
      throw new Error('Start button not found');
    }
  });

  it('should toggle the popup when togglePopup is called', async () => {
    countdownWidget?.togglePopup();
    await countdownWidget?.updateComplete;
    expect(togglePopupSpy?.calledOnce).to.be.true;
  });

  afterEach(() => {
    startTimerStub?.restore();
    togglePopupSpy?.restore();
  });
});
