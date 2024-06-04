import { LitElement, html, nothing } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import componentStyle from './nutrition-tracker.css?inline';

interface Food {
  id: string;
  name: string;
  calories: number;
  image: string; // Base64-kodierte Bildinformation
  description: string; // Beschreibung der Mahlzeit
}

@customElement('nutrition-tracker')
export class NutritionTracker extends LitElement {
  static styles = [componentStyle];

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
      const response = await fetch('http://localhost:3000/food-cards', {
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
      this.checkCalories();
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
      image: this.imageData as string
    };

    try {
      const response = await fetch('http://localhost:3000/food-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(foodCardData)
      });
      if (!response.ok) {
        throw new Error('Failed to add food');
      }
      this.closeModal();
      await this.loadFoodCards();
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Food-card: ', error);
    }
  }

  submitTotalCalories() {
    const inputValue = this.totalCaloriesInput.value;
    this.totalCalories = parseInt(inputValue, 10);
    this.requestUpdate();
    this.checkCalories();
  }

  getRemainingCalories() {
    const consumedCalories = this.foodCards.reduce((sum, card) => sum + Number(card.calories), 0);
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

  handleFileChange(event: Event) {
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
                card => html`
                  <food-card
                    .food=${card}
                    @delete-food=${(e: CustomEvent) => this.deleteFoodCard(e.detail)}
                  ></food-card>
                `
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
                        <textarea name="description" placeholder="Beschreibung" required></textarea>
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
        <pop-up></pop-up>
      </main>
    `;
  }
}
