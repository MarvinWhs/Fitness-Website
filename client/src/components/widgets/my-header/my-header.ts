import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import componentStyle from './my-header.css?inline';

@customElement('my-header')
class MyHeader extends LitElement {
  static styles = [componentStyle];

  @property()
  condition = false; // Ist dieser Person eingeloggt oder nicht

  @property({ type: Boolean })
  sidebarOpen = false;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
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
                ? html`<li data-page><a href="/profile">Profil</a></li>`
                : html`<li data-page><a href="/login">Anmelden</a></li>
                    <li data-page><a href="/register">Registrieren</a></li>`}
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
              ? html`<li data-page><a href="/profile">Profil</a></li>`
              : html`<li data-page><a href="/login">Anmelden</a></li>
                  <li data-page><a href="/register">Registrieren</a></li>`}
          </ul>
        </div>
        <div class="overlay ${this.sidebarOpen ? 'active' : ''}" @click="${this.closeSidebar}"></div>
      </header>
    `;
  }
}
