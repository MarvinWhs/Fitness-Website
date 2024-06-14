/* Autor: Niklas Lobo */

import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { consume } from '@lit/context';
import componentStyle from './login-page.css?inline';
import { HttpClient, httpClientContext } from '../../../http-client.js';
import { Router } from '../../../router.js';
import { routerContext } from '../../../router.js';
import { authContext } from './auth-context.js';
import { Notificator } from '../../widgets/notificator/notificator';

@customElement('login-page')
export class LoginPage extends LitElement {
  static styles = [componentStyle];

  @consume({ context: httpClientContext })
  httpClient!: HttpClient;

  @consume({ context: routerContext, subscribe: true })
  router!: Router | undefined;

  @consume({ context: authContext, subscribe: true })
  authState!: { isAuthenticated: boolean } | undefined;

  username: string = '';
  password: string = '';
  usernameErrorMessage: string = '';
  passwordErrorMessage: string = '';
  generalErrorMessage: string = '';

  constructor() {
    super();
    this.username = '';
    this.password = '';
    this.usernameErrorMessage = '';
    this.passwordErrorMessage = '';
    this.generalErrorMessage = '';
  }

  handleInput(e: InputEvent) {
    const target = e.target as HTMLInputElement;
    if (target.name === 'username') {
      this.username = target.value;
      this.usernameErrorMessage = this.username ? '' : 'Benutzername darf nicht leer sein';
    } else if (target.name === 'password') {
      this.password = target.value;
      this.passwordErrorMessage = this.password ? '' : 'Passwort darf nicht leer sein';
    }
    this.updateErrorMessages();
  }

  updateErrorMessages() {
    this.shadowRoot?.querySelectorAll('.error-message').forEach(element => {
      element.classList.toggle('active', !!element.textContent);
    });
  }

  async handleSubmit(e: Event) {
    e.preventDefault();
    const hasErrors = this.usernameErrorMessage || this.passwordErrorMessage;
    const userData = {
      username: this.username,
      password: this.password
    };
    if (!hasErrors) {
      try {
        const response = await this.httpClient.post('/login', userData);
        if (response && response.ok) {
          localStorage.setItem('authToken', 'true');
          console.log('Login erfolgreich');
          Notificator.showNotification('Login erfolgreich', 'erfolg');
          if (this.authState) {
            this.authState.isAuthenticated = true;
          }
          if (this.router) {
            this.router.goto('/fitness-home');
          }
          this.dispatchEvent(new CustomEvent('user-login', { bubbles: true, composed: true }));
          window.location.pathname = '/fitness-home';
        } else {
          const result = await response.json();
          this.generalErrorMessage = result.message || 'Login fehlgeschlagen';
          Notificator.showNotification('Login erfolgreich', 'erfolg');
        }
      } catch (error) {
        this.generalErrorMessage = 'Fehler beim Anmelden';
        Notificator.showNotification('Fehler beim Anmelden', 'fehler');
        console.error('Fehler beim Anmelden', error);
      }
    }
  }

  render() {
    return html`
      <div class="login-container">
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
          ${this.generalErrorMessage ? html`<div class="error-message">${this.generalErrorMessage}</div>` : ''}
          <button type="submit">Einloggen</button>
        </form>
      </div>
    `;
  }
}
