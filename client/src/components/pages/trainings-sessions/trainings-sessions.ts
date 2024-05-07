/* Autor: Marvin Wiechers */

import { LitElement, html, nothing } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { HttpClient, httpClientContext } from '../../../http-client.js';
import componentStyle from './trainings-sessions.css?inline';
//import '../../widgets/trainings-card/trainings-card.js';
// Wieso muss diese Zeile ausgeblendet sein?
@customElement('trainings-sessions')
export class TrainingsComponent extends LitElement {

    static styles = [componentStyle];

  @consume({ context: httpClientContext })
  httpClient!: HttpClient;

  render(){
    return html`
    <main class="main-content">
        <div class="two-column-row" id="first-row">
        <div class="image-area">
            <img src="./gymPerson.png">
        </div>
            <div class="two-column-row-content">
                <h1>Fitness-Übungen</h1>
                <p>
                In unserem Angebot finden Sie eine umfangreiche Auswahl an Fitnessübungen, die es Ihnen ermöglichen, Ihr Training individuell
                 auf die gewünschten Muskelgruppen abzustimmen. Entdecken Sie das perfekte Trainingsprogramm, das optimal auf Ihre Bedürfnisse
                  zugeschnitten ist, und gestalten Sie Ihre Trainingseinheiten effektiv und zielgerichtet.
                <p>
                Unser vielfältiges Angebot an Übungen stammt direkt aus unserer engagierten Community. Jedes Mitglied hat die Möglichkeit, eigene Übungen 
                beizutragen und somit das Spektrum stetig zu erweitern. Indem Sie im Laufe der Zeit Ihre eigenen Übungen und Trainingspläne hinzufügen, 
                tragen Sie wertvolles Wissen bei, von dem andere Mitglieder profitieren können. Ihre Erfahrungen bereichern die gesamte Gemeinschaft und 
                fördern einen aktiven Austausch unter allen Beteiligten.
                </p>
            <div class="link-button" id="adding" >
                <a href="/trainings-sessions">Jetzt Übungen hinzufügen</a>
            </div>
        </div>
        </div>
        <div>
            <div class="mid-text">
                <h2>Alle Einheiten</h2>
                <p> Hier sind alle Übungen aufgelistest. Suchen Sie sich die für sich am ansprechendsten aus oder filtern sie ganz einfach nach den 
                    gewünschten Kriterien. 
                </p>
            </div>
        </div>
        <trainings-card></trainings-card>
  </div>
 
  </main>
`
  }
}