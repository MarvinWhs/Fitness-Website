//Autor Marvin Wiechers

import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import componentStyle from './my-footer.css?inline';

@customElement('my-footer')
class MyFooter extends LitElement {
  static styles = [componentStyle];

  render() {
    return html`
      <footer>
        <div class="footer-container">
          <div class="footer-column">
            <h3>Themen</h3>
            <a href="/fitness-home">Home</a>
            <a href="/calendar">Kalendar</a>
            <a href="/trainings-sessions">Trainingseinheiten</a>
            <a href="/nutrition-tracker">Ernährungstracker</a>
            <a href="/register-page">Registrieren</a>
            <a href="/login-page">Anmelden</a>
          </div>
          <div class="footer-column">
            <h3>Über uns</h3>
            <a href="/Impressum">Impressum</a>
            <a href="/Datenschutz">Datenschutz</a>
            <a href="/AGB">AGB</a>
          </div>
        </div>
        <p>Copyright 2024 | All in One Fitness | Made by Marvin, Lucas, Niklas</p>
      </footer>
    `;
  }
}
