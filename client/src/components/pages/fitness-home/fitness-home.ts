/* Autor: Marvin Wiechers */
import { consume } from '@lit/context';
import { LitElement, css, html, nothing } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { HttpClient, httpClientContext } from '../../../http-client';
import componentStyle from './fitness-home.css?inline';

@customElement('fitness-home')
export class HomeComponent extends LitElement {
  static styles = [componentStyle];

  @consume({ context: httpClientContext })
  httpClient!: HttpClient;
  
  render(){
    return html`
      
<body>
    <main class="main-content">
        <div class="two-column-row" id="first-row">
            <div class="two-column-row-content">
                <h1>Fitness mit Verstand</h1>
                <p>
                   Willkommen bei All in One Fitness! Hier findest du alles, was du für ein gesundes Leben brauchst. 
                    Ob Muskelaufbau, Abnehmen oder einfach nur fit bleiben - wir helfen dir dabei, deine Ziele zu erreichen. 
                    Mit unseren Trainingsplänen und Ernährungstipps bist du bestens gerüstet, um fit und gesund zu bleiben.
             </p>
             <p>
                 Unsere Trainingspläne sind speziell auf deine Bedürfnisse zugeschnitten und helfen dir dabei, deine Ziele zu erreichen. 
                 Egal ob du Anfänger oder Profi bist, bei uns findest du das passende Programm für dich. 
                 Mit unseren Trainingseinheiten kannst du deine Leistung steigern und dich rundum wohlfühlen. Dabei kannst du deinen Traumkörper erreichen
                 und wirst von unseren Trainern unterstützt.
                </p>
            <div class="link-button" id="trainings" >
                <a href="/trainings-sessions">Jetzt starten</a>
            </div>
            </div>
        <div class="image-area">
            <img src="./liegestütze.png">
        </div>
  </div>
   <div class="mid-section">
            <div class="mid-text">
                <h2>Unser Angebot</h2>
                <p>
                    Um immer auf dem neuesten Stand zu bleiben, bieten wir dir regelmäßig neue Trainingspläne und Ernährungstipps. 
                    Deine bisherigen Erfolge kannst du in unserem Ernährungstracker und Kalendar festhalten. Plane deine Trainingseinheiten und Mahlzeiten im Voraus und behalte so den Überblick über deine Fortschritte.
                </p>
            </div>
        <div class="two-column-row">

            <div class="two-column-row-content">
                <h1>Kalendar</h1>
                <p>
                    Jeder kennt das Problem, dass man einfach nicht welche Trainingseinheiten du in letzter Zeit gemacht hast. Mit dem Kalendar
                    hast du immer den Überblick über deine Trainingserfolge und kannst dich so immer motivieren. Diese Visualisierung deiner Erfolge 
                    hilft dir dabei, deine Ziele zu erreichen.
                </p>
                <p>Entdecke jetzt unseren Kalendar!</p>
                <div class="link-button">
                    <a href="/kalendar" id="calendar">Zum Kalendar</a>
                </div>
            </div>

            <div class="two-column-row-content">
                <h1>Ernährungstracker</h1>
                <p>
                    Du weißt schon wieder nicht wieviel du noch essen darfst? Mit unserem Ernährungstracker hast du immer den Überblick über deine
                    Mahlzeiten. Plane deine Mahlzeiten so, dass es für dich am besten passt und behalte so den Überblick über deine Kalorienzufuhr.
                    Dabei ist es egal, ob du abnehmen oder Muskeln aufbauen möchtest.
                </p>
                <p>
                    Hier geht es zu unserem Ernährungstracker!
                </p>
                <div class="link-button">
                    <a href="/nutrition-tracker" id="nutrition">Zum Ernährungstracker</a>
                </div>
            </div>
        </div>
    </div>
    <div>
        <p></p>
    </div>
    </main>
</body>

    `;
  }
}
