import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import componentStyle from './dark-mode.css?inline';

@customElement('dark-mode')
export class DarkMode extends LitElement {
  static styles = [componentStyle];

  constructor() {
    super();
    this.checkDarkMode(); // Überprüfen des aktuellen Dark-Mode-Status beim Laden des Widgets
  }

  connectedCallback() {
    super.connectedCallback();
    this.checkDarkMode(); // Überprüfen des aktuellen Dark-Mode-Status beim Hinzufügen des Widgets zum DOM
  }

  checkDarkMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark-mode', isDarkMode); // Verwende toggle, um die Klasse entsprechend hinzuzufügen oder zu entfernen
  }

  toggleDarkMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    localStorage.setItem('darkMode', isDarkMode ? 'false' : 'true'); // Ändere den Status umgekehrt
    this.checkDarkMode(); // Aktualisiere den Dark-Mode-Status
  }

  render() {
    return html`
      <button @click=${this.toggleDarkMode}>
        ${localStorage.getItem('darkMode') === 'true' ? 'Light Mode' : 'Dark Mode'}
      </button>
    `;
  }
}
