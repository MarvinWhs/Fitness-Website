//Autor: Marvin Wiechers
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import componentStyle from './my-header.css?inline';

@customElement('my-header')
class MyHeader extends LitElement {
  static styles = [componentStyle];

  /* Autor Niklas Lobo */
  @property({ type: Boolean })
  condition = false; // Ist dieser Person eingeloggt oder nicht

  /* Autor Niklas Lobo */
  checkAuthStatus() {
    const token = document.cookie.split('; ').find(row => row.startsWith('jwt-token='));
    if (token) {
      this.condition = true;
    } else {
      this.condition = false;
    }
  }

  /* Autor Niklas Lobo */
  handleLogout() {
    // Token löschen
    document.cookie = 'jwt-token=; Max-Age=0; path=/';
    this.condition = false;
    // Optionale: Weiterleitung zur Startseite oder Login-Seite
    window.location.href = '/login-page';
  }

  render() {
    return html`
      <header>
        <div class="collapse navbar-collapse  auto-responsive isScrollTop" id="myNavbar">
          <div class="row">
            <ul class="nav navbar-nav">
              <li data-page><a href="/fitness-home">Home</a></li>
              <li data-page><a href="/trainings-sessions">Trainingseinheiten</a></li>
              <li data-page><a href="/nutrition-tracker">Ernährungstracker</a></li>
              <li data-page><a href="/kalendar">Kalendar</a></li>
              ${this.condition
                ? html`
                    <li data-page><a href="/profile">Profil</a></li>
                    <li data-page><button @click="${this.handleLogout}">Logout</button></li>
                  `
                : html`
                    <li data-page><a href="/login-page">Anmelden</a></li>
                    <li data-page><a href="/register-page">Registrieren</a></li>
                  `}
            </ul>
          </div>
        </div>
      </header>
    `;
  }
}
