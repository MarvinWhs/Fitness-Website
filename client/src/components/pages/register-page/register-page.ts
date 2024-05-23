/* Autor Niklas Lobo */

import { html, LitElement } from 'lit';
import { Router } from '../../../router';
import componentStyle from './register-page.css?inline';
import { customElement } from 'lit/decorators.js';

@customElement('register-page')
export class RegisterPage extends LitElement {
  static styles = [componentStyle];

  username: string;
  password: string;
  email: string;

  // Validierungsnachrichten
  usernameErrorMessage: string;
  emailErrorMessage: string;
  passwordErrorMessage: string;

  constructor() {
    super();
    this.username = '';
    this.password = '';
    this.email = '';
    this.usernameErrorMessage = '';
    this.emailErrorMessage = '';
    this.passwordErrorMessage = '';
  }

  async handleInput(e: InputEvent) {
    const target = e.target as HTMLInputElement;
    if (target.name === 'username') {
      this.username = target.value;
      const usernameRegex = /^(?=.*[a-zA-Z])[a-zA-Z\d]{6,20}$/;
      if (usernameRegex.test(this.username)) {
        this.usernameErrorMessage = '';
      } else {
        this.usernameErrorMessage = 'Ungültiger Benutzername';
      }
    } else if (target.name === 'password') {
      this.password = target.value;
      const passwordRegex: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{7,}$/;
      if (passwordRegex.test(this.password)) {
        this.passwordErrorMessage = '';
      } else {
        this.passwordErrorMessage = 'Ungültiges Passwort';
      }
    } else if (target.name === 'email') {
      this.email = target.value;
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (emailRegex.test(this.email)) {
        this.emailErrorMessage = '';
      } else {
        this.emailErrorMessage = 'Ungültige E-Mail';
      }
    }

    if (this.usernameErrorMessage || this.passwordErrorMessage || this.emailErrorMessage) {
      this.shadowRoot?.querySelectorAll('.error-message').forEach(element => {
        element.classList.add('active');
      });
    } else {
      this.shadowRoot?.querySelectorAll('.error-message').forEach(element => {
        element.classList.remove('active');
      });
    }

    await this.requestUpdate();
  }

  async handleSubmit(e: Event) {
    e.preventDefault();
    if (!this.usernameErrorMessage && !this.passwordErrorMessage && !this.emailErrorMessage) {
      const response = await fetch('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: this.username, password: this.password, email: this.email })
      });
      if (response.ok) {
        console.log('Registration successful');
        // Weiterleitung zur Anmeldeseite oder Startseite
        const router = new Router(this, [{ path: '/', render: () => html`<fitness-home></fitness-home>` }]);
        router.push('/');
      } else {
        console.error('Registration failed');
      }
    }
  }

  render() {
    return html`
      <div class="register-container">
        <form @submit="${this.handleSubmit}">
          <label>
            Benutzer:
            <input type="text" name="username" @input="${this.handleInput}" />
            ${this.usernameErrorMessage ? html`<div class="error-message">${this.usernameErrorMessage}</div>` : ''}
          </label>
          <label>
            Passwort:
            <input type="password" name="password" @input="${this.handleInput}" />
            ${this.passwordErrorMessage ? html`<div class="error-message">${this.passwordErrorMessage}</div>` : ''}
          </label>
          <label>
            Email:
            <input type="email" name="email" @input="${this.handleInput}" />
            ${this.emailErrorMessage ? html`<div class="error-message">${this.emailErrorMessage}</div>` : ''}
          </label>
          <button type="submit">Registrieren</button>
        </form>
      </div>
    `;
  }
}
