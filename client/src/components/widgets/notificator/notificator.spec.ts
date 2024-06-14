/* Autor: Marvin Wiechers */

import { expect } from 'chai';
import { html, fixture, fixtureCleanup } from '@open-wc/testing-helpers';
import './notificator';
import { Notificator } from './notificator';

describe('Notificator Component', () => {
  afterEach(() => {
    fixtureCleanup();
  });

  it('should render, show notifications, and clear notifications automatically', async () => {
    const el = await fixture<Notificator>(html`<notification-widget></notification-widget>`);

    Notificator.showNotification('Ein Fehler ist aufgetreten', 'fehler');
    await el.updateComplete;
    const notification = el.shadowRoot?.querySelector('div');
    expect(notification?.textContent).to.equal('Ein Fehler ist aufgetreten');
    expect(notification?.className).to.equal('fehler');
  });
});
