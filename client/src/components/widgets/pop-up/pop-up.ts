/* Autor: Lucas Berlage */

import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import componentStyle from './pop-up.css?inline';

@customElement('pop-up')
export class PopUp extends LitElement {
  static styles = [componentStyle];

  @property({ type: String }) message: string = '';
  @state() isVisible: boolean = false;

  show(message: string) {
    this.message = message;
    this.isVisible = true;
  }

  hide() {
    this.isVisible = false;
  }

  render() {
    return this.isVisible
      ? html`
          <div class="overlay" @click=${this.hide}>
            <div class="popup" @click=${(e: Event) => e.stopPropagation()}>
              <p>${this.message}</p>
              <button @click=${this.hide} class="accept-button">Akzeptieren</button>
            </div>
          </div>
        `
      : null;
  }
}
