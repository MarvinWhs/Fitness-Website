import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import componentStyle from './trainings-card.css?inline';
import { Notificator } from '../notificator/notificator.js';
import { HttpClient, httpClientContext } from './../../../http-client.js';
import { consume } from '@lit/context';

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
  @consume({ context: httpClientContext })
  httpClient!: HttpClient;

  @state()
  exercises: Exercise[] = []; // Array von Übungen

  @state()
  searchTerm: string = '';

  @state()
  difficultyFilter: string = '';

  @state()
  isEditModalOpen: boolean = false;

  @state()
  editedExercise: Exercise | null = null;

  constructor() {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  static styles = [componentStyle];

  async connectedCallback() {
    super.connectedCallback();
    await this.fetchExercises();
    window.addEventListener('exercise-added', this.handleExerciseAdded.bind(this));
  }

  disconnectedCallback() {
    window.removeEventListener('exercise-added', this.handleExerciseAdded.bind(this));
    super.disconnectedCallback();
  }
  async handleExerciseAdded() {
    await this.fetchExercises();
  }

  async fetchExercises() {
    try {
      const response = await fetch('https://localhost:3000/exercises', {
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

  async openEditModal(exercise: Exercise) {
    this.editedExercise = { ...exercise };
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const response = await this.httpClient.post(
        `https://localhost:3000/exercises/test/${exercise.id}`,
        this.editedExercise
      );
      this.isEditModalOpen = true;
      await this.updateComplete;
      const modal = this.shadowRoot!.getElementById('editExerciseModal') as HTMLElement;
      if (modal) {
        modal.style.display = 'flex';
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      if (error.statusCode === 401) {
        Notificator.showNotification('Sie können nur Übungen bearbeiten, welche sie selber erstellt haben!', 'fehler');
      }
      if (error.statusCode === 404) {
        Notificator.showNotification('Sie müssen sich anmelden, um Übungen bearbeiten zu können!', 'fehler');
      } else {
        console.error('Unexpected error: ', error);
      }
    }
  }

  async closeEditModal() {
    this.editedExercise = null;
    this.isEditModalOpen = false;
    await this.updateComplete;
    const modal = this.shadowRoot!.getElementById('editExerciseModal') as HTMLElement;
    if (modal) {
      modal.style.display = 'none';
    }
  }
  async handleEditSubmit(e: Event) {
    e.preventDefault();
    if (this.editedExercise) {
      try {
        const response = await this.httpClient.put(
          `https://localhost:3000/exercises/${this.editedExercise.id}`,
          this.editedExercise
        );
        if (response.ok) {
          await this.closeEditModal();
          await this.fetchExercises();
          Notificator.showNotification('Übung erfolgreich aktualisiert', 'erfolg');
        } else {
          Notificator.showNotification('Fehler beim Aktualisieren der Übung', 'fehler');
        }
      } catch (error) {
        console.error('Fehler beim Aktualisieren der Übung:', error);
        Notificator.showNotification('Fehler beim Aktualisieren der Übung', 'fehler');
      }
    }
  }

  handleEditInput(e: InputEvent) {
    const input = e.target as HTMLInputElement;
    if (this.editedExercise) {
      this.editedExercise = { ...this.editedExercise, [input.name]: input.value };
    }
  }

  async deleteExercise(exerciseId: string) {
    try {
      const response = await this.httpClient.delete(`https://localhost:3000/exercises/${exerciseId}`);
      if (!response.ok) {
        if (response.status === 404) {
          Notificator.showNotification('Sie müssen sich anmelden, um Übungen löschen zu können!', 'fehler');
          throw new Error('User not logged in');
        }
        if (response.status === 401) {
          Notificator.showNotification('Sie können nur Übungen löschen, welche sie selber erstellt haben!', 'fehler');
          throw new Error('User not authorized to delete exercise');
        } else {
          Notificator.showNotification('Fehler beim Löschen der Übung', 'fehler');
          throw new Error('Failed to delete exercise');
        }
      }
      Notificator.showNotification('Übung erfolgreich gelöscht', 'erfolg');
      this.exercises = this.exercises.filter(exercise => exercise.id !== exerciseId);
      this.requestUpdate();
    } catch (error) {
      //console.error(error);
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
                <div class="exercise-buttons">
                  <button
                    @click="${() => this.deleteExercise(exercise.id)}"
                    class="delete-exercise"
                    title="Übung löschen"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="red" viewBox="0 0 24 24">
                      <path
                        d="M3 6v18h18V6H3zm16 2v14H5V8h14zM1 4h22v2H1V4zm5 0h2v2H6V4zm4 0h2v2h-2V4zm4 0h2v2h-2V4z"
                      />
                    </svg>
                  </button>
                  <button @click="${() => this.openEditModal(exercise)}" class="edit-exercise" title="Übung bearbeiten">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="blue" viewBox="0 0 24 24">
                      <path
                        d="M3 17.25V21h3.75l11.086-11.086-3.75-3.75L3 17.25zm14.75-14.75c.292-.292.767-.292 1.059 0l2.121 2.121c.292.292.292.767 0 1.059l-1.879 1.879-3.75-3.75L17.75 2.5z"
                      />
                    </svg>
                  </button>
                </div>
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
      ${this.isEditModalOpen && this.editedExercise
        ? html`
            <div id="editExerciseModal" class="modal">
              <div class="modal-content">
                <button @click="${this.closeEditModal}" class="close-button" aria-label="Close modal">&times;</button>
                <h3>Übung bearbeiten</h3>
                <form @submit="${this.handleEditSubmit}">
                  <input
                    type="text"
                    name="name"
                    placeholder="Name der Übung"
                    .value="${this.editedExercise.name}"
                    @input="${this.handleEditInput}"
                    required
                  />
                  <textarea
                    name="description"
                    placeholder="Beschreibung der Übung"
                    @input="${this.handleEditInput}"
                    required
                  >
${this.editedExercise.description}</textarea
                  >
                  <input
                    type="number"
                    name="duration"
                    placeholder="Dauer in Minuten"
                    .value="${this.editedExercise.duration.toString()}"
                    @input="${this.handleEditInput}"
                    required
                  />
                  <select name="difficulty" @change="${this.handleEditInput}" required>
                    <option value="Easy" ?selected="${this.editedExercise.difficulty === 'Easy'}">Easy</option>
                    <option value="Medium" ?selected="${this.editedExercise.difficulty === 'Medium'}">Medium</option>
                    <option value="Hard" ?selected="${this.editedExercise.difficulty === 'Hard'}">Hard</option>
                  </select>
                  <button type="submit">Ändern</button>
                </form>
              </div>
            </div>
          `
        : null}
    `;
  }
}
