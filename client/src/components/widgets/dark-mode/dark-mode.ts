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
    this.theme = localStorage.getItem('theme') || 'light';
  }

  firstUpdated() {
    this.initTheme();
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', this.theme);
    this.initTheme();
  }

  initTheme() {
    document.documentElement.setAttribute('theme', this.theme);
  }

  render() {
    return html`
      <input type="checkbox" @change=${this.toggleTheme} ?checked=${this.theme === 'dark'} />
      <div class="slider"></div>
      <div class="icon">${this.theme === 'dark' ? html`<img src="./moon.png" />` : html`<img src="./sun.png" />`}</div>
    `;
  }
}
