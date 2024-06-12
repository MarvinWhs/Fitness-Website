import { LitElement, html, nothing } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import componentStyle from './nutrition-tracker.css?inline';
import { HttpClient, httpClientContext } from '../../../http-client.js';
import { consume } from '@lit/context';
import { Notificator } from '../notificator/notificator.js';

interface Food {
  id: string;
  name: string;
  calories: number;
  description: string;
  quantity: number;
  createdAt: string;
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
  @query('.input_calories') totalCaloriesInput!: HTMLInputElement;
  @query('pop-up') popUp!: HTMLElement & { show: (message: string) => void };

  constructor() {
    super();
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.loadFoodCards();
  }

  async loadFoodCards(): Promise<void> {
    try {
      const response = await this.httpClient.get(`/food-cards`);
      if (!response) {
        throw new Error(`Failed to fetch food cards`);
      }
      this.foodCards = await response.json();
      this.requestUpdate();
    } catch (error) {
      console.error('Error fetching food cards:', error);
    }
  }

  async deleteFoodCard(id: string): Promise<void> {
    try {
      await this.httpClient.delete(`/food-cards/${id}`);
      this.foodCards = this.foodCards.filter(foodCards => foodCards.id !== id);
      this.requestUpdate();
      Notificator.showNotification('Note successfully deleted', 'erfolg');
    } catch (error) {
      console.error('Error deleting note:', error);
      Notificator.showNotification('Error deleting note', 'fehler');
    }
  }

  async addFoodCard(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const foodCardData = {
      id: '',
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      calories: parseInt(formData.get('calories') as string),
      quantity: parseInt(formData.get('quantity') as string)
    };

    try {
      const response = await this.httpClient.post('/food-cards', foodCardData);

      if (!response.ok) {
        throw new Error('Failed to add food');
      }
      this.closeModal();
      await this.loadFoodCards();
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Food-card: ', error);
    }
  }

  async updateFoodCard(id: string, quantity: number): Promise<void> {
    try {
      const foodCard = this.foodCards.find(food => food.id === id);
      if (foodCard) {
        const updatedFoodCard = { ...foodCard, quantity };
        const response = await this.httpClient.put(`/food-cards/${id}`, updatedFoodCard);

        if (!response.ok) {
          throw new Error('Failed to update food card');
        }

        this.foodCards = this.foodCards.map(food => (food.id === id ? updatedFoodCard : food));
        this.requestUpdate();
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Food-card:', error);
    }
  }

  submitTotalCalories() {
    const inputValue = this.totalCaloriesInput.value;
    const test = parseInt(inputValue, 10);
    Notificator.showNotification('Gesamtkalorien erfolgreich gesetzt: ' + test, 'erfolg');

    if (test > 0) {
      this.totalCalories = parseInt(inputValue, 10);
      this.requestUpdate();
      this.checkCalories();
    } else {
      this.openPopUp('Bitte geben Sie einen gültigen Wert ein!');
    }
  }

  getRemainingCalories() {
    const consumedCalories = this.foodCards.reduce((sum, card) => sum + Number(card.calories * card.quantity), 0);
    console.log('consumedCalories', consumedCalories);
    console.log('totalCalories', this.totalCalories);
    return this.totalCalories - consumedCalories;
  }

  checkCalories() {
    const remainingCalories = this.getRemainingCalories();
    if (remainingCalories < 0) {
      this.openPopUp(`Kalorienüberschreitung um ${Math.abs(remainingCalories)} kcal!`);
    }
  }

  openPopUp(message: string) {
    this.popUp.show(message);
  }

  resetTotalCalories() {
    this.totalCalories = 0;
    Notificator.showNotification('Gesamtkalorien erfolgreich zurückgesetzt', 'erfolg');
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  render() {
    return html`
      <main class="main-content">
        <h1>Willkommen bei Ihrem Ernährungstracker!</h1>
        
          ${
            this.totalCalories !== 0
              ? html`
                  <div class="total-calories">
                    <p>Gesamter Kalorienbedarf: ${this.totalCalories} kcal</p>
                    <p>Verbleibende Kalorien: ${this.getRemainingCalories()} kcal</p>
                    <button class="reset" @click=${this.resetTotalCalories}>Zurücksetzen</button>
                  </div>
                  <div class="plus-button" @click=${this.openModal}><strong>+</strong></div>
                `
              : html`
                  <div class="row">
                    <input
                      type="number"
                      class="input_calories"
                      min="1"
                      placeholder="Gesamter Kalorienbedarf eingeben"
                      .value=${this.totalCalories}
                    />
                    <button class="submitCalories" @click=${this.submitTotalCalories}><strong>Eingabe</strong></button>
                    <div class="plus-button" @click=${this.openModal}><strong>+</strong></div>
                  </div>
                `
          }
          <div class="food-list">
            ${this.foodCards.map(
              card => html`
                <food-card
                  .food=${card}
                  @delete-food=${(e: CustomEvent) => this.deleteFoodCard(e.detail)}
                  @update-food=${(e: CustomEvent) => this.updateFoodCard(e.detail.id, e.detail.quantity)}
                ></food-card>
              `
            )}
          </div>
          ${
            this.isModalOpen
              ? html`
                  <div class="modal-overlay" @click=${this.closeModal}>
                    <div class="modal-content" @click=${(e: Event) => e.stopPropagation()}>
                      <button @click=${this.closeModal} class="close-button"><strong>x</strong></button>
                      <h3>Neue Mahlzeit hinzufügen</h3>
                      <form @submit=${this.addFoodCard}>
                        <input type="text" name="name" placeholder="Name" required />
                        <textarea name="description" placeholder="Beschreibung" required></textarea>
                        <input type="number" name="calories" min="1" placeholder="Kalorien" required />
                        <input type="number" name="quantity" min="1" max="99" placeholder="Anzahl" required />
                        <button type="submit">Hinzufügen</button>
                      </form>
                    </div>
                  </div>
                `
              : nothing
          }
        </div>

        <pop-up></pop-up>
      </main>
    `;
  }
}
