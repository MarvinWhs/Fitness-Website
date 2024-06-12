/* Autor: Niklas Lobo */

import { expect } from 'chai';
import { fixture, html } from '@open-wc/testing-helpers';
import sinon, { SinonSpy } from 'sinon';
import { CountdownWidget } from './countdown-widget';
import './countdown-widget';

describe('CountdownWidget', () => {
  let countdownWidget: CountdownWidget | null = null;
  let togglePopupSpy: SinonSpy | null = null;

  beforeEach(async () => {
    countdownWidget = await fixture<CountdownWidget>(html`<countdown-widget></countdown-widget>`);
    togglePopupSpy = sinon.spy(countdownWidget, 'togglePopup');
  });

  it('should toggle the popup when togglePopup is called', async () => {
    countdownWidget?.togglePopup();
    await countdownWidget?.updateComplete;
    expect(togglePopupSpy?.calledOnce).to.be.true;
  });

  afterEach(() => {
    if (countdownWidget?.open) {
      countdownWidget?.togglePopup();
    }
    togglePopupSpy?.restore();
  });
});
