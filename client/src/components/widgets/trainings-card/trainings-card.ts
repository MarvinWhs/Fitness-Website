import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators';
import { repeat } from 'lit/directives/repeat.js';
import {Exercise} from '../../../../../api-server/src/models/exercise.js';

@customElement('trainings-card')
class Trainingscard extends LitElement {

@property()
list = []; // hier muss die Liste der Übungen rein bzw aus der Datenbank geladen werden


  render() {
    return html`

        <div>
            <h1>Übungen</h1>
            ${repeat(this.list, (exercise: Exercise) => html`
            <div>
                <h3>${exercise.name}</h3>
                <p>${exercise.description}</p>
                
            </div>
            `)}
        
        </div>
      <
    `;
  }
}
customElements.define('trainings-card', Trainingscard);
