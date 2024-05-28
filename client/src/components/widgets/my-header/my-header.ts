import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import componentStyle from './my-header.css?inline';
import { Router } from '../../../router';

@customElement('my-header')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class MyHeader extends LitElement {
  static styles = [componentStyle];

  @property()
  condition = false; // Ist dieser Person eingeloggt oder nicht

  @property({ type: Boolean })
  sidebarOpen = false;

  constructor() {
    super();
    // Überprüfe beim Erstellen der Komponente, ob der Benutzer eingeloggt ist
    this.condition = this.isLoggedIn();
  }

  // Methode zur Überprüfung, ob der Benutzer eingeloggt ist
  isLoggedIn(): boolean {
    // Überprüfe, ob ein Token im localStorage vorhanden ist
    const token = localStorage.getItem('authToken');
    return !!token; // Wenn ein Token vorhanden ist, ist der Benutzer eingeloggt
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  handleLogout() {
    // Entferne das Token aus dem localStorage
    localStorage.removeItem('authToken');

    // Weiterleitung zur Login-Seite
    window.location.href = '/fitness-home';
  }

  firstUpdated() {
    document.addEventListener('click', this.handleOutsideClick.bind(this));
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.handleOutsideClick.bind(this));
    super.disconnectedCallback();
  }

  handleOutsideClick(event: MouseEvent) {
    const sidebar = this.shadowRoot?.querySelector('.sidebar') as HTMLElement;
    const menuIcon = this.shadowRoot?.querySelector('.menu-icon') as HTMLElement;
    const target = event.composedPath()[0] as HTMLElement;

    if (this.sidebarOpen && sidebar && menuIcon && !sidebar.contains(target) && !menuIcon.contains(target)) {
      this.closeSidebar();
    }
  }

  render() {
    return html`
      <header>
        <div class="menu-icon" @click="${this.toggleSidebar}">&#9776;</div>
        <div class="collapse navbar-collapse auto-responsive isScrollTop" id="myNavbar">
          <div class="row">
            <ul class="nav navbar-nav">
              <li data-page><a href="/fitness-home">Home</a></li>
              <li data-page><a href="/exercises">Trainingseinheiten</a></li>
              <li data-page><a href="/nutrition-tracker">Ernährungstracker</a></li>
              <li data-page><a href="/kalendar">Kalendar</a></li>
              ${this.condition
                ? html`<li data-page><a href="/profile">Profil</a></li>
                    <li><button @click="${this.handleLogout}">Logout</button></li>`
                : html`<li data-page><a href="/login-page">Anmelden</a></li>
                    <li data-page><a href="/register-page">Registrieren</a></li>`}
            </ul>
          </div>
        </div>
        <div class="sidebar ${this.sidebarOpen ? 'open' : ''}">
          <a href="javascript:void(0)" class="closebtn" @click="${this.toggleSidebar}">&times;</a>
          <ul class="sidebar-nav" @click="${this.closeSidebar}">
            <li data-page><a href="/fitness-home">Home</a></li>
            <li data-page><a href="/exercises">Trainingseinheiten</a></li>
            <li data-page><a href="/nutrition-tracker">Ernährungstracker</a></li>
            <li data-page><a href="/kalendar">Kalendar</a></li>
            ${this.condition
              ? html`<li data-page><a href="/profile">Profil</a></li>
                  <li><button @click="${this.handleLogout}">Logout</button></li>`
              : html`<li data-page><a href="/login-page">Anmelden</a></li>
                  <li data-page><a href="/register-page">Registrieren</a></li>`}
          </ul>
        </div>
        <div class="overlay ${this.sidebarOpen ? 'active' : ''}" @click="${this.closeSidebar}"></div>
      </header>
    `;
  }
}
