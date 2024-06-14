/* Autor: Niklas Lobo */

import { expect } from 'chai';
import { fixture, html, fixtureCleanup } from '@open-wc/testing-helpers';
import sinon from 'sinon';
import './login-page';
import { LoginPage } from './login-page';
import { HttpClient } from '../../../http-client';

describe('LoginPage', () => {
  let element: LoginPage;
  let httpClient: HttpClient;
  let httpClientStub: sinon.SinonStub;

  beforeEach(async () => {
    element = await fixture<LoginPage>(html`<login-page></login-page>`);
    httpClient = new HttpClient();
    httpClientStub = sinon.stub(httpClient, 'post').resolves(new Response(null, { status: 200 }));
    element.httpClient = httpClient;
    await element.updateComplete;
  });

  afterEach(() => {
    fixtureCleanup();
    httpClientStub.restore();
  });

  it('should render login form correctly', async () => {
    const form = element.shadowRoot!.querySelector('form');
    expect(form).to.exist;
    if (form) {
      expect(form.querySelector('input[name="username"]')).to.exist;
      expect(form.querySelector('input[name="password"]')).to.exist;
      expect(form.querySelector('button[type="submit"]')).to.exist;
    }
  });

  it('should handle successful login', async () => {
    const form = element.shadowRoot!.querySelector('form') as HTMLFormElement;
    expect(form).to.exist;
    if (form) {
      const button = form.querySelector('button[type="submit"]');
      expect(button).to.exist;

      element.username = 'testuser';
      element.password = 'password';

      button!.dispatchEvent(new MouseEvent('click'));

      expect(element.authState?.isAuthenticated).to.be.true;
    }
  });

  it('should handle logout', async () => {
    const form = element.shadowRoot!.querySelector('form') as HTMLFormElement;
    expect(form).to.exist;
    if (form) {
      const button = form.querySelector('button[type="submit"]');
      expect(button).to.exist;

      element.username = 'testuser';
      element.password = 'password';

      button!.dispatchEvent(new MouseEvent('click'));

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(element.authState?.isAuthenticated).to.be.true;

      element.dispatchEvent(new CustomEvent('logout-request', { bubbles: true, composed: true }));

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(element.authState?.isAuthenticated).to.be.false;
    }
  });
});
