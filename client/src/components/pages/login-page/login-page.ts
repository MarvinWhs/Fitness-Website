/* Autor Niklas Lobo */

import { html, LitElement } from 'lit';
import componentStyle from './login-page.css?inline';
import { customElement } from 'lit/decorators.js';

@customElement('login-page')
export class LoginPage extends LitElement {
  static styles = [componentStyle];

  username: string;
  password: string;

  usernameErrorMessage: string;
  passwordErrorMessage: string;
  generalErrorMessage: string;

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
    // Check if there are any error messages
    const hasErrors = this.usernameErrorMessage || this.passwordErrorMessage;

    if (!hasErrors) {
      try {
        const response = await fetch('http://localhost:3000/login', {
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
          const result = await response.json();
          localStorage.setItem('authToken', result.token); // Speichern des Tokens
          console.log('Login erfolgreich');
          // Clear the input fields after successful login
          this.username = '';
          this.password = '';
          this.generalErrorMessage = '';
          // Update the component to reflect cleared input fields
          await this.requestUpdate();
          window.location.href = '/fitness-home';
        } else {
          const result = await response.json();
          this.generalErrorMessage = result.message || 'Login fehlgeschlagen';
          console.error('Login fehlgeschlagen');
          await this.requestUpdate();
        }
      } catch (error) {
        this.generalErrorMessage = 'Fehler beim Anmelden';
        console.error('Fehler beim Anmelden', error);
        await this.requestUpdate();
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
