import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import componentStyle from './tracker-home.css?inline';
import { consume } from '@lit/context';
import { HttpClient, httpClientContext } from '../../../http-client';

@customElement('tracker-home')
export class Tracker extends LitElement {
  static styles = [componentStyle];

  @consume({ context: httpClientContext })
  httpClient!: HttpClient;

  render() {
    return html`
      <div>
        <h1>Welcome to Tracker Home</h1>
        <p>This is a standard HTML page built with Lit.</p>
      </div>
    `;
  }
}
