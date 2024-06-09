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
  @query('pop-up') popUp!: HTMLElement & { show: (message: string) => void };

  constructor() {
    super();
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.loadFoodCards();
  }

  async loadFoodCards() {
    try {
      const response = await fetch('https://localhost:3000/food-cards', {
        method: 'GET'
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch food cards: ${response.status} ${response.statusText} - ${errorText}`);
      }
      const responseData = await response.json();
      this.foodCards = responseData.map((food: any) => ({
        ...food,
        id: food.id.toString()
      }));
      this.requestUpdate();
    } catch (error) {
      console.error('Error fetching food cards:', error);
      throw error;
    }
  }

  async deleteFoodCard(id: string) {
    try {
      const response = await this.httpClient.delete(`https://localhost:3000/food-cards/${id}`);
      console.log('response in card' + response.status);
      if (!response.ok) {
        if (response.status === 404) {
          Notificator.showNotification('Sie müssen sich anmelden, um Essen löschen zu können!', 'fehler');
          throw new Error('User not logged in');
        }
        if (response.status === 401) {
          Notificator.showNotification('Sie können nur Essen löschen, welche sie selber erstellt haben!', 'fehler');
          throw new Error('User not authorized to delete exercise');
        } else {
          Notificator.showNotification('Fehler beim Löschen', 'fehler');
          throw new Error('Failed to delete exercise');
        }
      }
      Notificator.showNotification('Übung erfolgreich gelöscht', 'erfolg');
      this.foodCards = this.foodCards.filter(foodCards => foodCards.id !== id);
      this.requestUpdate();
    } catch (error) {
      console.error(error);
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
      const response = await this.httpClient.post('https://localhost:3000/food-cards', foodCardData);

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
        const response = await this.httpClient.put(`https://localhost:3000/food-cards/${id}`, updatedFoodCard);

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
    console.log(test);

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
                    <button @click=${this.resetTotalCalories}>Zurücksetzen</button>
                  </div>
                  <div class="plus-button" @click=${this.openModal}><strong>+</strong></div>
                `
              : html`
                  <div class="row">
                    <input
                      type="number"
                      class="feld"
                      min="1"
                      placeholder="Gesamter Kalorienbedarf eingeben"
                      .value=${this.totalCalories}
                    />
                    <button class="link-button" @click=${this.submitTotalCalories}>Eingabe</button>
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
