import { LitElement, html, css, CSSResult, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

interface Exercise {
  id: number;
  name: string;
  description: string;
}

@customElement('training-list')
export class TrainingList extends LitElement {
  static styles: CSSResult = css`
    .exercise {
      margin-bottom: 10px;
    }
  `;

  @property({ type: Array })
  exercises: Exercise[] = [];

  constructor() {
    super();
    this.loadExercises();
  }

  loadExercises(): void {
    fetch('https://localhost:3000/exercises')
      .then(response => response.json())
      .then((data: Exercise[]) => {
        this.exercises = [...this.exercises, ...data];
      })
      .catch(error => console.error('Fehler beim Laden der Übungen:', error));
  }

  render(): TemplateResult {
    return html`
    <h1>Test</h1>
      <ul>
        ${this.exercises.map((exercise: Exercise) => html`
          <li class="exercise">
            <h3>${exercise.name}</h3>
            <p>${exercise.description}</p>
          </li>
        `)}
      </ul>
      <button @click="${this.loadExercises}">Mehr Übungen laden</button>
    `;
  }
}
