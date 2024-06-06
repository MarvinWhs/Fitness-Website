import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import componentStyle from './my-header.css?inline';
import { consume } from '@lit/context';
import { authContext, AuthState } from '../../pages/login-page/auth-context';
import { Router } from '../../../router.js';
import { HttpClient, httpClientContext } from '../../../http-client.js';
import { routerContext } from '../../../router.js';

@customElement('my-header')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class MyHeader extends LitElement {
  static styles = [componentStyle];

  @property({ type: Boolean })
  sidebarOpen = false;

  /* Autor Niklas Lobo */
  @consume({ context: authContext, subscribe: true })
  authState!: AuthState;

  @consume({ context: httpClientContext })
  httpClient!: HttpClient;

  @consume({ context: routerContext, subscribe: true })
  router!: Router;

  /* Autor Niklas Lobo */
  isLoggedIn(): boolean {
    return this.authState.isAuthenticated;
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  handleLogout() {
    localStorage.removeItem('authToken');
    this.logout();
    this.authState.isAuthenticated = false;
    this.authState.user = null;
    this.requestUpdate();
    window.location.pathname = '/fitness-home';
  }

  async logout() {
    try {
      console.log('Logout');
      const response = await this.httpClient.delete('http://localhost:3000/logout');
      console.log('Logout erfolgt durch server');
      if (response.ok) {
        this.dispatchEvent(new CustomEvent('logout'));
      } else {
        console.error('Fehler bei der Abmeldung');
      }
    } catch (error) {
      console.error('Fehler bei der Abmeldung:', error);
    }
  }

  firstUpdated() {
    document.addEventListener('click', this.handleOutsideClick.bind(this));
    this.addEventListener('user-login', () => this.requestUpdate());
  }
  disconnectedCallback() {
    document.removeEventListener('click', this.handleOutsideClick.bind(this));
    this.removeEventListener('user-login', () => this.requestUpdate());
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
              <li data-page><a href="/tracker-home">Ernährungstracker</a></li>
              <li data-page><a href="/calendar-page">Kalendar</a></li>
              ${this.authState.isAuthenticated
                ? html` <li><button @click="${this.handleLogout}">Ausloggen</button></li>`
                : html`<li data-page><a href="/login-page">Anmelden</a></li>
                    <li data-page><a href="/register-page">Registrieren</a></li>`}
              <li><dark-mode></dark-mode></li>
            </ul>
          </div>
        </div>
        <div class="sidebar ${this.sidebarOpen ? 'open' : ''}">
          <a href="javascript:void(0)" class="closebtn" @click="${this.toggleSidebar}">&times;</a>
          <ul class="sidebar-nav" @click="${this.closeSidebar}">
            <li data-page><a href="/fitness-home">Home</a></li>
            <li data-page><a href="/exercises">Trainingseinheiten</a></li>
            <li data-page><a href="/tracker-home">Ernährungstracker</a></li>
            <li data-page><a href="/calendar-page">Kalendar</a></li>
            ${this.authState.isAuthenticated
              ? html` <li><button @click="${this.handleLogout}">Ausloggen</button></li>`
              : html`<li data-page><a href="/login-page">Anmelden</a></li>
                  <li data-page><a href="/register-page">Registrieren</a></li>`}
            <li><dark-mode></dark-mode></li>
          </ul>
        </div>
        <div class="overlay ${this.sidebarOpen ? 'active' : ''}" @click="${this.closeSidebar}"></div>
      </header>
    `;
  }
}
