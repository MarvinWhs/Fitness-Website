//Autor: Marvin Wiechers
import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import componentStyle from './my-header.css?inline';

@customElement('my-header')
class MyHeader extends LitElement {
  static styles = [componentStyle] ;

  @property()
  condition= true; //Ist dieser Person eingeloggt oder nicht

  render() {
    return html`
      <header>
      <div class= "collapse navbar-collapse  auto-responsive isScrollTop"  id="myNavbar">
      
        <div class="row" >
        
              <ul class= "nav navbar-nav">
                <li data-page><a href="/fitness-home">Home</a></li>
                <li data-page><a href="/exercises">Trainingseinheiten</a></li>
                <li data-page><a href="/nutrition-tracker">Ernährungstracker</a></li>
                <li data-page><a href="/kalendar">Kalendar</a></li>
                ${this.condition
                  ? html`<li data-page><a href="/profile">Profil</a></li>`
                  : html`<li data-page><a href="/login">Anmelden</a></li>
                  <li data-page><a href="/register">Registrieren</a></li>`
                }
                
              </ul>
            </div>
          </div>
      </header>
    `;
  }
}