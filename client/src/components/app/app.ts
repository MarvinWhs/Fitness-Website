/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import componentStyle from './app.css?inline';

const APP_TITLE = 'MyApp';

@customElement('app-root')
export class AppComponent extends LitElement {
  static styles = [componentStyle];

  @state() title = APP_TITLE;

  render() {
    return html`<h1>${this.title}</h1>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-root': AppComponent;
  }
}
