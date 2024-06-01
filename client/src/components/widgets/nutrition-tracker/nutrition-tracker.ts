import { LitElement, html, nothing } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { HttpClient, httpClientContext } from '../../../http-client';
import componentStyle from './nutrition-tracker.css?inline';

interface Food {
  id: string;
  name: string;
  calories: number;
  image: string; // Base64-kodierte Bildinformation
}

@customElement('nutrition-tracker')
export class NutritionTracker extends LitElement {
  static styles = [componentStyle];

  @consume({ context: httpClientContext })
  httpClient!: HttpClient;

  @state() foodCards: Food[] = [];
  @property({ type: Number }) totalCalories = 0;
  @state() isModalOpen: boolean = false;
  @state() imageData: string | ArrayBuffer | null = null;

  @query('input[type="file"]') fileInput!: HTMLInputElement;
  @query('.feld') totalCaloriesInput!: HTMLInputElement;

  constructor() {
    super();
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.loadFoodCards();
  }

  async loadFoodCards() {
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
        id: food.id.toString() // Konvertiere die ID zu einem String
      }));
    } catch (error) {
      console.error(error);
    }
  }

  async deleteFoodCard(id: string) {
    try {
      const response = await fetch(`http://localhost:3000/food-cards/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete food');
      }
      this.foodCards = this.foodCards.filter(food => food.id !== id);
      this.requestUpdate(); // Sicherstellen, dass die Ansicht aktualisiert wird
    } catch (error) {
      console.error(error);
    }
  }

  submitTotalCalories() {
    const inputValue = this.totalCaloriesInput.value;
    this.totalCalories = parseInt(inputValue, 10);
    this.requestUpdate();
  }

  getRemainingCalories() {
    const consumedCalories = this.foodCards.reduce((sum, card) => sum + card.calories, 0);
    return this.totalCalories - consumedCalories;
  }

  render() {
    return html`
      <main class="main-content">
        <div class="main-section">
          <h1>Willkommen bei Ihrem Ernährungstracker!</h1>
          <div class="mid-section">
            ${this.totalCalories !== 0
              ? html`
                  <div class="total-calories">
                    <p>Gesamter Kalorienbedarf: ${this.totalCalories} kcal</p>
                    <p>Verbleibende Kalorien: ${this.getRemainingCalories()} kcal</p>
                    <button @click=${this.resetTotalCalories}>Zurücksetzen</button>
                  </div>
                `
              : html`
                  <div class="row">
                    <input
                      type="number"
                      class="feld"
                      placeholder="Gesamter Kalorienbedarf eingeben"
                      .value=${this.totalCalories}
                    />
                    <button class="link-button" @click=${this.submitTotalCalories}>Eingabe</button>
                  </div>
                `}
            <div class="food-list">
              ${this.foodCards.map(
                card =>
                  html`<food-card
                    .food=${card}
                    @delete-food=${(e: CustomEvent) => this.deleteFoodCard(e.detail)}
                  ></food-card>`
              )}
            </div>
            <div class="plus-button" @click=${this.openModal}><strong>+</strong></div>
            ${this.isModalOpen
              ? html`
                  <div class="modal-overlay" @click=${this.closeModal}>
                    <div class="modal-content" @click=${(e: Event) => e.stopPropagation()}>
                      <button @click=${this.closeModal} class="close-button"><strong>x</strong></button>
                      <h3>Neue Mahlzeit hinzufügen</h3>
                      <form @submit=${this.addFoodCard}>
                        <input type="text" name="name" placeholder="Name" required />
                        <input type="textarea" name="description" placeholder="Beschreibung" required />
                        <input type="number" name="calories" placeholder="Kalorien" required />
                        <input type="file" name="image" @change=${this.handleFileChange} />
                        <button type="submit">Hinzufügen</button>
                      </form>
                    </div>
                  </div>
                `
              : nothing}
          </div>
        </div>
      </main>
    `;
  }

  resetTotalCalories() {
    this.totalCalories = 0;
  }

  private async addFoodCard(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const foodCardData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      calories: parseInt(formData.get('calories') as string),
      image: this.imageData
    };

    try {
      const response = await this.httpClient.post('http://localhost:3000/food-cards', foodCardData);
      console.log('Response:', response);
      this.closeModal();
      await this.loadFoodCards();
    } catch (error) {
      console.error('Fehler beim hinzufügen der Food-card: ', error);
    }
  }

  private openModal(): void {
    this.isModalOpen = true;
  }

  private closeModal(): void {
    this.isModalOpen = false;
  }

  private handleFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imageData = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }
}
