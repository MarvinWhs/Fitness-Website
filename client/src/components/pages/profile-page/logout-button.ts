import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('logout-button')
export class LogoutButton extends LitElement {
  render() {
    return html`<button @click="${this.logout}">Logout</button>`;
  }

  logout(event: Event) {
    event.preventDefault();

    fetch('/logout', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })
      .then(response => {
        if (response.ok) {
          // Dispatch custom event for logout
          this.dispatchEvent(new CustomEvent('logout'));
        } else {
          console.error('Fehler bei der Abmeldung');
        }
      })
      .catch(error => {
        console.error('Fehler bei der Abmeldung:', error);
      });
  }
}
