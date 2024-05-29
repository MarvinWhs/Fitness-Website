import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import componentStyle from './food-card.css?inline';

interface Food {
  id: string;
  name: string;
  calories: number;
}

@customElement('food-card')
export class FoodCard extends LitElement {
  static styles = [componentStyle];

  @state()
  foodCards: Food[] = []; // Array von Lebensmitteln

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchFoodCards(); // Fetch Food Cards when the component is added to the DOM
  }

  async fetchFoodCards() {
    try {
      const response = await fetch('http://localhost:3000/food-cards', {
        method: 'GET'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch food cards');
      }
      const responseData = await response.json();
      this.foodCards = responseData.map((food: any) => ({
        ...food,
        id: food.id.toString()
      }));
    } catch (error) {
      console.error(error);
    }
  }

  async deleteFood(foodId: string) {
    try {
      const response = await fetch(`http://localhost:3000/food-cards/${foodId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete food');
      }
      this.foodCards = this.foodCards.filter(food => food.id !== foodId);
      this.requestUpdate(); // Sicherstellen, dass die Ansicht aktualisiert wird
    } catch (error) {
      console.error(error);
    }
  }

  renderFoodCard(food: Food) {
    return html`
      <div class="food-card">
        <h2>${food.name}</h2>
        <p>Kalorien: ${food.calories}</p>
        <button @click=${() => this.deleteFood(food.id)}>Löschen</button>
      </div>
    `;
  }

  render() {
    return html`
      <main class="main-content">
        <div class="main-section">
          <h1>Willkommen bei Ihrem Ernährungstracker!</h1>
          <div class="mid-section">${this.foodCards.map(food => this.renderFoodCard(food))}</div>
        </div>
      </main>
    `;
  }
}
