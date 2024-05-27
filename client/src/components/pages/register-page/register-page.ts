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
  confirmPassword: string;

  // Validierungsnachrichten
  usernameErrorMessage: string;
  emailErrorMessage: string;
  passwordErrorMessage: string;
  confirmPasswordErrorMessage: string;

  constructor() {
    super();
    this.username = '';
    this.password = '';
    this.email = '';
    this.confirmPassword = '';
    this.usernameErrorMessage = '';
    this.emailErrorMessage = '';
    this.passwordErrorMessage = '';
    this.confirmPasswordErrorMessage = '';
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
    } else if (target.name === 'confirmPassword') {
      this.confirmPassword = target.value;
      if (this.confirmPassword === this.password) {
        this.confirmPasswordErrorMessage = '';
      } else {
        this.confirmPasswordErrorMessage = 'Passwörter stimmen nicht überein';
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

    if (
      this.usernameErrorMessage ||
      this.passwordErrorMessage ||
      this.emailErrorMessage ||
      this.confirmPasswordErrorMessage
    ) {
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
    if (
      !this.usernameErrorMessage &&
      !this.passwordErrorMessage &&
      !this.emailErrorMessage &&
      !this.confirmPasswordErrorMessage
    ) {
      const response = await fetch('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: this.username, password: this.password, email: this.email })
      });
      if (response.ok) {
        console.log('Registrierung erfolgreich');
        // Weiterleitung zur Anmeldeseite oder Startseite
        const router = new Router(this, [{ path: '/', render: () => html`<fitness-home></fitness-home>` }]);
        router.push('/');
      } else {
        console.error('Registrierung fehlgeschlagen');
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
            Passwort bestätigen:
            <input type="password" name="confirmPassword" @input="${this.handleInput}" />
            ${this.confirmPasswordErrorMessage
              ? html`<div class="error-message">${this.confirmPasswordErrorMessage}</div>`
              : ''}
          </label>
          <label>
            E-Mail:
            <input type="email" name="email" @input="${this.handleInput}" />
            ${this.emailErrorMessage ? html`<div class="error-message">${this.emailErrorMessage}</div>` : ''}
          </label>
          <button type="submit">Registrieren</button>
        </form>
      </div>
    `;
  }
}
