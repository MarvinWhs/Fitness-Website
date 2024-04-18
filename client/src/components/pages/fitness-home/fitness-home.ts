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
            <div class="link-button" >
                <a href="/trainings-sessions">Jetzt starten</a>
            </div>
            </div>
        <div class="image-area">
            <img src="./liegestütze.png">
        </div>
  </div>
   <div  style="background-color: rgba(0, 0, 0, 0.1)">
            <div class="mid-text">
                <h2>Unser Angebot</h2>
                <p>
                    Um immer auf dem neuesten Stand zu bleiben, bieten wir dir regelmäßig neue Trainingspläne und Ernährungstipps. 
                    Deine bisherigen Erfolge kannst du in unserem Ernährungstracker und Kalendar festhalten. Plane deine Trainingseinheiten und Mahlzeiten im Voraus und behalte so den Überblick über deine Fortschritte.
                </p>
            </div>
        <div class="two-column-row">

            <div class="two-column-row-content">
                <h1>Unsere Philosophie</h1>
                <p>
                    Bei All in One Fitness steht der Mensch im Mittelpunkt. 
                    Wir möchten dir dabei helfen, ein gesundes und glückliches Leben zu führen. 
                    Deshalb bieten wir dir nicht nur ein umfangreiches Trainingsprogramm, sondern auch wertvolle Tipps für eine gesunde Ernährung. 
                    Wir möchten, dass du dich rundum wohlfühlst und deine Ziele erreichst. 
                    Deshalb unterstützen wir dich auf dem Weg zu einem gesunden und fitten Leben.
                </p>
            </div>

            <div class="two-column-row-content">
                <h1>Unsere Angebote</h1>
                <p>
                    Bei All in One Fitness findest du alles, was du für ein gesundes Leben brauchst. 
                    Egal ob du Muskeln aufbauen, abnehmen oder einfach nur fit bleiben möchtest - wir haben das passende Angebot für dich. 
                    Unsere Trainingspläne sind speziell auf deine Bedürfnisse zugeschnitten und helfen dir dabei, deine Ziele zu erreichen. 
                    Mit unseren Ernährungstipps kannst du deine Leistung steigern und dich rundum wohlfühlen. 
                    Wir zeigen dir, wie du dich gesund ernähren kannst und dabei trotzdem genießen darfst.
                </p>
            </div>
        </div>
    </div>
    </main>
</body>

    `;
  }
}
