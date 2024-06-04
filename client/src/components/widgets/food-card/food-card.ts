import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import componentStyle from './food-card.css?inline';

interface Food {
  id: string;
  name: string;
  calories: number;
  image: string;
  description: string;
}

@customElement('food-card')
export class FoodCard extends LitElement {
  static styles = [componentStyle];

  @property({ type: Object })
  food!: Food;

  render() {
    return html`
      <div class="food-card">
        <h2>${this.food.name}</h2>
        <p>Kalorien: ${this.food.calories}</p>
        ${this.food.image ? html`<img src="${this.food.image}" alt="Bild von ${this.food.name}" />` : null}
        <p>Beschreibung: ${this.food.description}</p>
        <button @click=${() => this.dispatchEvent(new CustomEvent('delete-food', { detail: this.food.id }))}>
          Löschen
        </button>
      </div>
    `;
  }
}
