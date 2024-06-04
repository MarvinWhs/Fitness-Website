import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import componentStyle from './trainings-card.css?inline';
import { Notificator } from '../notificator/notificator.js';

interface Exercise {
  id: string; // Normale ID als string
  createdAt: number;
  name: string;
  description: string;
  duration: number;
  difficulty: string;
  image: string; // Base64-kodierte Bildinformation
}

@customElement('trainings-card')
export class TrainingsCard extends LitElement {
  @state()
  exercises: Exercise[] = []; // Array von Übungen

  @state()
  searchTerm: string = '';

  @state()
  difficultyFilter: string = '';

  constructor() {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  static styles = [componentStyle];

  async connectedCallback() {
    super.connectedCallback();
    await this.fetchExercises();
  }

  async fetchExercises() {
    try {
      const response = await fetch('http://localhost:3000/exercises', {
        method: 'GET'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch exercises');
      }
      const responseData = await response.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.exercises = responseData.map((exercise: any) => ({
        ...exercise,
        id: exercise.id.toString() // Konvertiere die ID zu einem String
      }));
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

  async deleteExercise(exerciseId: string) {
    try {
      const response = await fetch(`http://localhost:3000/exercises/${exerciseId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        if (response.status === 404) {
          Notificator.showNotification('Übung nicht gefunden', 'fehler');
          throw new Error('Exercise not found');
        }
        if (response.status === 401) {
          Notificator.showNotification('Sie können nur Übungen löschen, welche sie selber erstellt haben!', 'fehler');
          throw new Error('User not authorized to delete exercise');
        } else {
          Notificator.showNotification('Fehler beim Löschen der Übung', 'fehler');
          throw new Error('Failed to delete exercise');
        }
      }
      this.exercises = this.exercises.filter(exercise => exercise.id !== exerciseId);
      this.requestUpdate();
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    const filteredExercises = this.exercises.filter(
      exercise =>
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
                <button
                  @click="${() => this.deleteExercise(exercise.id)}"
                  class="delete-exercise"
                  title="Übung löschen"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="red" viewBox="0 0 24 24">
                    <path d="M3 6v18h18V6H3zm16 2v14H5V8h14zM1 4h22v2H1V4zm5 0h2v2H6V4zm4 0h2v2h-2V4zm4 0h2v2h-2V4z" />
                  </svg>
                </button>
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
            </div>
          `
        )}
      </div>
    `;
  }
}
