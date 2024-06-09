import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import componentStyle from './food-card.css?inline';

interface Food {
  id: string;
  name: string;
  calories: number;
  description: string;
  quantity: number;
}

@customElement('food-card')
export class FoodCard extends LitElement {
  static styles = [componentStyle];

  @property({ type: Object })
  food!: Food;

  updateQuantity(change: number) {
    const newQuantity = this.food.quantity + change;
    if (newQuantity >= 0 && newQuantity <= 99) {
      this.food.quantity = newQuantity;
      this.dispatchEvent(new CustomEvent('update-food', { detail: { id: this.food.id, quantity: newQuantity } }));
    }
    if (newQuantity === 0) {
      this.dispatchEvent(new CustomEvent('delete-food', { detail: this.food.id }));
    }
  }

  render() {
    return html`
      <div class="food-card">
        <div class="food-info">
          <h2>${this.food.name}</h2>
          <p>Kalorien: ${this.food.calories}</p>
        </div>
        <div class="controls">
          <button @click=${() => this.updateQuantity(-1)}>-</button>
          <span class="quantity">${this.food.quantity}</span>
          <button @click=${() => this.updateQuantity(1)}>+</button>
        </div>
        <button
          class="delete-button"
          @click=${() => this.dispatchEvent(new CustomEvent('delete-food', { detail: this.food.id }))}
        >
          X
        </button>
        <div class="description">
          <p>Beschreibung: ${this.food.description}</p>
        </div>
      </div>
    `;
  }
}
