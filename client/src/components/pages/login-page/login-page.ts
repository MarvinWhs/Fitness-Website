/* Autor Niklas Lobo */

import { html, LitElement } from 'lit';
import { Router } from '../../../router';
import componentStyle from './login-page.css?inline';
import { customElement } from 'lit/decorators.js';
import { userToken } from '../../widgets/login-page/user-token';

@customElement('login-page')
export class LoginPage extends LitElement {
  static styles = [componentStyle];

  username: string;
  password: string;

  constructor() {
    super();
    this.username = '';
    this.password = '';
  }

  handleInput(e: InputEvent) {
    const target = e.target as HTMLInputElement;
    if (target.name === 'username') {
      this.username = target.value;
    } else if (target.name === 'password') {
      this.password = target.value;
    }
  }

  handleSubmit(e: Event) {
    e.preventDefault();
    fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: this.username,
        password: this.password
      })
    })
      .then(response => {
        if (response.ok) {
          // Erfolgreicher Login
          return response.json().then(data => {
            userToken.createAndSetToken({ id: data.userId });
            const router = new Router(this, [{ path: '/', render: () => html`<fitness-home></fitness-home>` }]);
            router.push('/');
          });
        } else {
          // Error handling, wie falscher Username, Passwort, E-Mail
          return response.json().then(data => {
            console.error(data.message);
          });
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
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
        </form>
      </div>
    `;
  }
}
