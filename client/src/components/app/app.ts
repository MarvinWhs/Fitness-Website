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
      {path : '/', render: () =>  html`<fitness-home></fitness-home>`},
      { path: '/fitness-home', render: () => html`<fitness-home></fitness-home>` },
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
    <!DOCTYPE html>
    <html lang="de">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${APP_TITLE}</title>
        <link rel="stylesheet" href="app.css">
      <header>
      
      <div class= "collapse navbar-collapse  auto-responsive isScrollTop"  id="myNavbar">
      
        <div class="row" style="overflow: visible">
        <div class= "logo">
                <img class=logo src="logo.png" width=100 height=100 href="./home">
              </div>
              <ul class= "nav navbar-nav">
                <li data-page><a href="/fitness-home">Home</a></li>
                <li data-page><a href="/trainings-sessions">Trainingseinheiten</a></li>
                <li data-page><a href="/nutrition-tracker">Ernährungstracker</a></li>
                <li data-page><a href="/login">Login</a></li>
              </ul>
            </div>
          </div>
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
