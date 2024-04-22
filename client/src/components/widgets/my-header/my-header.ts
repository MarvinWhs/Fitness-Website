//Autor: Marvin Wiechers
import {LitElement, css, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import componentStyle from './my-header.css?inline';

@customElement('my-header')
class MyHeader extends LitElement {
  static styles = [componentStyle] ;
  render() {
    return html`
      <header>
      <div class= "collapse navbar-collapse  auto-responsive isScrollTop"  id="myNavbar">
      
        <div class="row" >
        
              <ul class= "nav navbar-nav">
                <li data-page><a href="/fitness-home">Home</a></li>
                <li data-page><a href="/trainings-sessions">Trainingseinheiten</a></li>
                <li data-page><a href="/nutrition-tracker">Ernährungstracker</a></li>
                <li data-page><a href="/kalendar">Kalendar</a></li>
                <li data-page><a href="/login">Login</a></li>
              </ul>
            </div>
          </div>
      </header>
    `;
  }
}