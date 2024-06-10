/* Autor Niklas Lobo */

import { html, LitElement } from 'lit';
import componentStyle from './register-page.css?inline';
import { customElement } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { HttpClient, httpClientContext } from '../../../http-client.js';
import { Router } from '../../../router.js';
import { routerContext } from '../../../router.js';
import { authContext, AuthState } from '../login-page/auth-context.js';

@customElement('register-page')
export class RegisterPage extends LitElement {
  static styles = [componentStyle];

  @consume({ context: httpClientContext })
  httpClient!: HttpClient;

  @consume({ context: routerContext, subscribe: true })
  router!: Router;

  @consume({ context: authContext, subscribe: true })
  authState!: AuthState;

  username: string;
  password: string;
  confirmPassword: string;
  email: string;

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
        this.usernameErrorMessage =
          'Der Benutzername muss zwischen 6 und 20 Zeichen lang sein und mindestens einen Buchstaben enthalten';
      }
    } else if (target.name === 'password') {
      this.password = target.value;
      const passwordRegex: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{7,}$/;
      if (passwordRegex.test(this.password)) {
        this.passwordErrorMessage = '';
      } else {
        this.passwordErrorMessage =
          'Das Passwort muss mindestens 7 Zeichen lang sein und mindestens einen Großbuchstaben, einen Kleinbuchstaben, eine Zahl und ein Sonderzeichen enthalten';
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
        this.emailErrorMessage = 'Bitte geben Sie eine gültige E-Mail-Adresse an';
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
    const hasErrors =
      this.usernameErrorMessage ||
      this.passwordErrorMessage ||
      this.emailErrorMessage ||
      this.confirmPasswordErrorMessage;

    const userData = {
      username: this.username,
      password: this.password,
      passwordCheck: this.confirmPassword,
      email: this.email
    };

    if (!hasErrors) {
      const response = await this.httpClient.post('https://localhost:3000/register', userData);
      if (response.ok) {
        const result = await response.json();
        localStorage.setItem('authToken', result.token);
        console.log('Login erfolgreich');
        this.authState.isAuthenticated = true;
        console.log('AuthState:', this.authState);
        this.updateComplete.then(() => {
          this.requestUpdate();
        });
        this.router.goto('/fitness-home');
        this.dispatchEvent(new CustomEvent('user-login', { bubbles: true, composed: true }));
        window.location.pathname = '/fitness-home';
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
