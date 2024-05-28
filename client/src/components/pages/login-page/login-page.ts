/* Autor Niklas Lobo */

import { html, LitElement } from 'lit';
import { Router } from '../../../router';
import componentStyle from './login-page.css?inline';
import { customElement } from 'lit/decorators.js';

@customElement('login-page')
export class LoginPage extends LitElement {
  static styles = [componentStyle];

  username: string;
  password: string;
  errorMessage: string;

  constructor() {
    super();
    this.username = '';
    this.password = '';
    this.errorMessage = '';
  }

  handleInput(e: InputEvent) {
    const target = e.target as HTMLInputElement;
    if (target.name === 'username') {
      this.username = target.value;
    } else if (target.name === 'password') {
      this.password = target.value;
    }
  }

  async handleSubmit(e: Event) {
    e.preventDefault();
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: this.username,
          password: this.password
        })
      });

      if (response.ok) {
        // Erfolgreicher Login
        const router = new Router(this, [{ path: '/', render: () => html`<fitness-home></fitness-home>` }]);
        router.push('/');
      } else {
        // Error handling
        const data = await response.json();
        this.errorMessage = data.message || 'Fehler bei der Anmeldung';
      }
    } catch (error) {
      if (error instanceof Error) {
        this.errorMessage = 'Fehler: ' + error.message;
      } else {
        this.errorMessage = 'Unbekannter Fehler';
      }
    }
  }

  render() {
    return html`
      <div class="login-container">
        <form @submit="${this.handleSubmit}">
          <label>
            Benutzer:
            <input type="text" name="username" @input="${this.handleInput}" />
          </label>
          <label>
            Passwort:
            <input type="password" name="password" @input="${this.handleInput}" />
          </label>
          <button type="submit">Anmelden</button>
          ${this.errorMessage ? html`<div class="error-message">${this.errorMessage}</div>` : ''}
        </form>
      </div>
    `;
  }
}
