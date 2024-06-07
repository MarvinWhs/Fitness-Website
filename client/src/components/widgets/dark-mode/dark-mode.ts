import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import componentStyle from './dark-mode.css?inline';

@customElement('dark-mode')
export class DarkMode extends LitElement {
  static styles = [componentStyle];

  @state() isDarkMode: boolean = false;

  @property({ type: String, reflect: true })
  theme: string = 'light';

  constructor() {
    super();
    this.theme = 'light'; // Standard-Thema ist 'light'
  }

  connectedCallback() {
    super.connectedCallback();
    this.updateTheme();
  }

  // Methode zum Wechseln des Themas
  changeDarkMode() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.updateTheme();
  }

  // Methode zum Anwenden des Themas
  updateTheme() {
    if (this.theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  // Render-Methode
  render() {
    return html`
      <button @click=${this.changeDarkMode} id="dark-mode-button">${this.theme === 'light' ? '☀️' : '🌙'}</button>
    `;
  }
}
