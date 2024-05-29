import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import componentStyle from './tracker-home.css?inline';
import { consume } from '@lit/context';
import { HttpClient, httpClientContext } from '../../../http-client';

@customElement('tracker-home')
export class Tracker extends LitElement {
  static styles = [componentStyle];

  @consume({ context: httpClientContext })
  httpClient!: HttpClient;

  render() {
    return html`
      <div class="trackerHome">
        <h1>Willkommen bei Ihrem persönlichen Ernährungstracker!</h1>
        <div class="StartText">
          <h2>Verfolgen Sie Ihren Kalorienbedarf und Ihre Ernährung mühelos</h2>
          <p>
            Unser Ernährungstracker ist Ihr verlässlicher Begleiter, um Ihre tägliche Kalorienzufuhr und Ihr
            Essverhalten im Blick zu behalten. Egal, ob Sie abnehmen, Muskeln aufbauen oder einfach gesünder leben
            möchten – unser Tool hilft Ihnen dabei, Ihre Ernährungsziele zu erreichen.
          </p>
          <div class="Erklärung">
            <h2>So funktioniert's:</h2>
            <ul>
              <li>
                <strong>Kalorienbedarf eingeben: </strong>Geben Sie Ihren täglichen Kalorienbedarf ein, basierend auf
                Ihrem Alter, Geschlecht, Gewicht, Größe und Aktivitätslevel. Unser Tracker berechnet automatisch Ihren
                individuellen Kalorienbedarf.
              </li>
              <li>
                <strong>Lebensmittel hinzufügen: </strong> Erfassen Sie die Lebensmittel und Getränke, die Sie im Laufe
                des Tages zu sich nehmen. Geben Sie einfach die Menge und Art der Lebensmittel ein, und unser Tracker
                zieht die entsprechenden Kalorien von Ihrem Gesamtbedarf ab.
              </li>
              <li>
                <strong>Übersicht behalten: </strong> Sehen Sie auf einen Blick, wie viele Kalorien Sie bereits
                konsumiert haben und wie viele Ihnen noch zur Verfügung stehen. Unser übersichtliches Dashboard zeigt
                Ihnen Ihre Fortschritte und hilft Ihnen, bewusste Ernährungsentscheidungen zu treffen.
              </li>
            </ul>
          </div>
        </div>
        <div class="main-content">
          <nutrition-tracker></nutrition-tracker>
        </div>
      </div>
    `;
  }
}
