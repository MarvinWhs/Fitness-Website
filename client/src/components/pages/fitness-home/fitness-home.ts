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
        <div class="content-area">
            <h1>Fitness mit Verstand</h1>
            <p>
                Willkommen bei All in One Fitness! Hier findest du alles, was du für ein gesundes Leben brauchst. 
                Ob Muskelaufbau, Abnehmen oder einfach nur fit bleiben - wir helfen dir dabei, deine Ziele zu erreichen. 
                Mit unseren Trainingsplänen und Ernährungstipps bist du bestens gerüstet, um fit und gesund zu bleiben.
            </p>
            <p>
                Unsere Trainingspläne sind speziell auf deine Bedürfnisse zugeschnitten und helfen dir dabei, deine Ziele zu erreichen. 
                Egal ob du Anfänger oder Profi bist, bei uns findest du das passende Programm für dich. 
                Mit unseren Ernährungstipps kannst du deine Leistung steigern und dich rundum wohlfühlen. 
                Wir zeigen dir, wie du dich gesund ernähren kannst und dabei trotzdem genießen darfst.
            </p>
        </div>
        <div class="image-area">
            <img src="./liegestütze.png">
        </div>
    </main>
</body>

    `;
  }
}
