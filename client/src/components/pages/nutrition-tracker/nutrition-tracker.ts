import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import componentStyle from './nutrition-tracker.css?inline';

@customElement('nutrition-tracker')
export class Tracker extends LitElement {
  static styles = [componentStyle];

  @state()
  private items: { name: string; calories: number }[] = [];

  @state()
  private name: string = '';

  @state()
  private calories: number = 0;

  @state()
  private totalCalories: number | null = null; // Use null to indicate totalCalories is not set

  private showInput: boolean = true;

  render() {
    return html`
      <h1>Ernährungstracker</h1>
      <p>
        Geben Sie zu Beginn ihren täglichen Kalorienbedarf ein. Anschließend können Sie die Lebensmittel hinzufügen, die
        Sie am Tag Essen. Als Ergebnis wird gezeigt ob Sie ihren Kalorienbedarf einhalten
      </p>
      <div class="container" ?calories-negative="${this.totalCalories !== null && this.totalCalories < 0}">
        ${this.showInput
          ? html`
              <input type="number" placeholder="Tagesbedarf" />
              <button @click="${this.setTotalCalories}">Set total Calories</button>
            `
          : html`
              <div class="total-calories">${this.totalCalories}</div>
              <button @click="${this.resetTotalCalories}">Zurücksetzen</button>
            `}
        <ul>
          ${this.items.map(
            (item, index) => html`
              <li class="item">
                <span>${item.name} - ${item.calories} Kalorien</span>
                <button @click="${() => this.removeItem(index)}">Entfernen</button>
              </li>
            `
          )}
        </ul>
        <input type="text" placeholder="Produkt" .value="${this.name}" @input="${this.updateName}" />
        <input type="number" placeholder="Calories" .value="${this.calories}" @input="${this.updateCalories}" />
        <button @click="${this.addItem}">Produkt hinzufügen</button>
      </div>
    `;
  }

  updateName(event: Event) {
    this.name = (event.target as HTMLInputElement).value;
  }

  updateCalories(event: Event) {
    if (this.calories >= 0) {
      this.calories = parseInt((event.target as HTMLInputElement).value);
    }
  }

  setTotalCalories() {
    const inputElement = this.shadowRoot?.querySelector('input[type="number"]') as HTMLInputElement;
    const inputVal = parseInt(inputElement.value);

    if (!isNaN(inputVal) && inputVal >= 0) {
      this.totalCalories = inputVal;
      this.showInput = false;
    } else {
      // Handle invalid input or other error cases
      // Zum Beispiel: Zeige eine Fehlermeldung an oder setze totalCalories auf null
      this.totalCalories = null;
      this.showInput = true;
    }
  }

  resetTotalCalories() {
    this.totalCalories = null;
    this.showInput = true;
    this.items = [];
  }

  addItem() {
    if (this.name && this.calories) {
      // Add the logic to set totalCalories here
      if (this.totalCalories !== null) {
        this.totalCalories -= this.calories;
      }
      this.items = [...this.items, { name: this.name, calories: this.calories }];
      this.name = '';
      this.calories = 0;
    }
    // Handle case when calories exceed totalCalories
  }

  removeItem(index: number) {
    // Add the calories back to totalCalories when removing an item
    if (this.totalCalories !== null) {
      this.totalCalories += this.items[index].calories;
    }
    this.items = this.items.filter((_, i) => i !== index);
  }
}
