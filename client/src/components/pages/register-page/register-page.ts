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
  confirmPassword: string;
  email: string;

  // Validierungsnachrichten
  usernameErrorMessage: string;
  emailErrorMessage: string;
  passwordErrorMessage: string;
  confirmPasswordErrorMessage: string;

  constructor() {
    super();
    this.username = '';
    this.password = '';
    this.confirmPassword = '';
    this.email = '';
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

    this.updateErrorMessages();
    await this.requestUpdate();
  }

  updateErrorMessages() {
    this.shadowRoot?.querySelectorAll('.error-message').forEach(element => {
      element.classList.toggle('active', !!element.textContent);
    });
  }

  async handleSubmit(e: Event) {
    e.preventDefault();
    // Check if there are any error messages
    const hasErrors =
      this.usernameErrorMessage ||
      this.passwordErrorMessage ||
      this.emailErrorMessage ||
      this.confirmPasswordErrorMessage;

    if (!hasErrors) {
      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: this.username,
          password: this.password,
          passwordCheck: this.confirmPassword,
          email: this.email
        })
      });
      if (response.ok) {
        console.log('Registrierung erfolgreich');
        // Clear the input fields after successful registration
        this.username = '';
        this.password = '';
        this.confirmPassword = '';
        this.email = '';
        // Update the component to reflect cleared input fields
        await this.requestUpdate();

        // Forward to the main page
        const router = new Router(this, [{ path: '/fitness-home', render: () => html`<fitness-home></fitness-home>` }]);
        router.push('/fitness-home');
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
            <input type="text" name="username" .value="${this.username}" @input="${this.handleInput}" />
            ${this.usernameErrorMessage ? html`<div class="error-message">${this.usernameErrorMessage}</div>` : ''}
          </label>
          <label>
            Passwort:
            <input type="password" name="password" .value="${this.password}" @input="${this.handleInput}" />
            ${this.passwordErrorMessage ? html`<div class="error-message">${this.passwordErrorMessage}</div>` : ''}
          </label>
          <label>
            Passwort bestätigen:
            <input
              type="password"
              name="confirmPassword"
              .value="${this.confirmPassword}"
              @input="${this.handleInput}"
            />
            ${this.confirmPasswordErrorMessage
              ? html`<div class="error-message">${this.confirmPasswordErrorMessage}</div>`
              : ''}
          </label>
          <label>
            E-Mail:
            <input type="email" name="email" .value="${this.email}" @input="${this.handleInput}" />
            ${this.emailErrorMessage ? html`<div class="error-message">${this.emailErrorMessage}</div>` : ''}
          </label>
          <button type="submit">Registrieren</button>
        </form>
      </div>
    `;
  }
}