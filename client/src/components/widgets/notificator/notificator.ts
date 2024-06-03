import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import componentStyle from './notificator.css?inline';

@customElement('notification-widget')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class Notificator extends LitElement {
  static styles = componentStyle;

  @property() content = '';
  @property() type: 'fehler' | 'info' | 'erfolg' = 'info';

  render() {
    return html`${this.content ? html`<div class="${this.type}">${this.content}</div>` : nothing}`;
  }

  // Singleton Instanz
  // eslint-disable-next-line @typescript-eslint/member-ordering
  static instance: Notificator | null = null;

  connectedCallback() {
    super.connectedCallback();
    Notificator.instance = this;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    Notificator.instance = null;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  static showNotification(content: string, type: 'fehler' | 'info' | 'erfolg' = 'info') {
    if (Notificator.instance) {
      Notificator.instance.content = content;
      Notificator.instance.type = type;
      Notificator.instance.requestUpdate(); // Aktualisierung der Komponente anfordern
      setTimeout(() => Notificator.instance?.clearNotification(), 5000);
    }
  }

  clearNotification() {
    this.content = '';
    this.type = 'info';
    this.requestUpdate(); // Aktualisierung der Komponente anfordern
  }
}
