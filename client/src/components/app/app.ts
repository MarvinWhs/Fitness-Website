/* Autor: Marvin Wiechers */

import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { provide } from '@lit/context';
import componentStyle from './app.css?inline';
import { HttpClient, httpClientContext } from '../../http-client.js';
import { Router } from '../../router.js';
const APP_TITLE = 'All in One Fitness';

@customElement('app-root')
export class AppComponent extends LitElement {
  static styles = [componentStyle];

  @provide({ context: httpClientContext })
  httpClient = new HttpClient();
  router = new Router(
    this,
    [
      { path: '/', render: () => html`<fitness-home></fitness-home>` },
      { path: '/trainings-sessions', render: () => html`<trainings-sessions></trainings-sessions>` },
      { path: '/nutrition-tracker', render: () => html`<nutrition-tracker></nutrition-tracker>` },
    ],
    {
      fallback: { render: () => html`<fitness-home></fitness-home>` }
    }
  );

  constructor() {
    super();
    this.httpClient.init(`${location.protocol}//${location.hostname}:3000/`);
  }

  render() {
    return html`
      <header>
        <a href="/trainings-sessions">Trainingseinheiten</a>
        <a href="/nutrition-tracker">Ernährungstracker</a>
      </header>
      <main>${this.router.outlet()}</main>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-root': AppComponent;
  }
}
