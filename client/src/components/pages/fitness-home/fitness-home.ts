/* Autor: Marvin Wiechers */
import { consume } from '@lit/context';
import { LitElement, html, nothing } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { HttpClient, httpClientContext } from '../../../http-client';

@customElement('fitness-home')
export class HomeComponent extends LitElement {

  @consume({ context: httpClientContext })
  httpClient!: HttpClient;
  
  render(){
    return html`
      
      <body>
      
      </body>
    `;
  }
}
