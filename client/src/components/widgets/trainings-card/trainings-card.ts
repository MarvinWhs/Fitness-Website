import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import componentStyle from './trainings-card.css?inline';

interface Exercise {
  id: number;
  createdAt: number;
  name: string;
  description: string;
  duration: number;
  difficulty: string;
  image: string;  // Base64-kodierte Bildinformation
}

@customElement('trainings-card')
class TrainingsCard extends LitElement {
  @state()
  exercises: Exercise[] = [];  // Array von Übungen

  @state()
  searchTerm: string = '';

  @state()
  difficultyFilter: string = '';

  constructor() {
    super();
  }

  static styles = [componentStyle];

  async connectedCallback() {
    super.connectedCallback();
    try {
      const response = await fetch('http://localhost:3000/exercises', {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch exercises');
      }
      const responseData = await response.json();
      this.exercises = responseData;  // Annahme, dass die Daten direkt verwendbar sind
    } catch (error) {
      console.error(error);
    }
  }

  handleSearchInput(e: InputEvent) {
    const input = e.target as HTMLInputElement;
    this.searchTerm = input.value.toLowerCase();
  }

  handleDifficultyChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    this.difficultyFilter = select.value;
  }

  render() {
  const filteredExercises = this.exercises.filter((exercise) =>
    exercise.name.toLowerCase().includes(this.searchTerm) &&
    (!this.difficultyFilter || exercise.difficulty === this.difficultyFilter)
  );
    return html`
  <div class="search-box-container">
    <input class="search-box" type="text" placeholder="Suche Übungen..." @input=${this.handleSearchInput} />
    <select class="difficulty-filter" @change=${this.handleDifficultyChange}>
      <option value="">Alle Schwierigkeitsgrade</option>
      <option value="Easy">Easy</option>
      <option value="Medium">Medium</option>
      <option value="Hard">Hard</option>
    </select>
  </div>
  <div class="exercises-container">
  ${filteredExercises.map(
    exercise => html`
      <div class="exercise-container-container">
        <div class="exercise">
        <div class="exercise-info">
          ${exercise.image ? html`<img src="${exercise.image}" alt="Bild von ${exercise.name}" />` : null}
        </div>
        <div class="exercise-details">
          <h3>${exercise.name}</h3>
          <p>Dauer: ${exercise.duration} Minuten</p>
          <p>Schwierigkeitsgrad: ${exercise.difficulty}</p>
        </div>
      </div>
      <div class="exercise-description">
            <p>${exercise.description}</p>
      </div>
      <div>
    `
  )}
</div>
`;

  }
}
