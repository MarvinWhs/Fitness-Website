import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('trainings-card')
class TrainingsCard extends LitElement {
  @state()
  exercises = [];

  constructor() {
    super();
    this.exercises = [];
  }

  static styles = css`
    .exercise {
      border: 1px solid #ddd;
      padding: 16px;
      margin: 8px 0;
      border-radius: 8px;
    }

    .exercise h3 {
      margin: 0 0 8px 0;
    }

    .exercise p {
      margin: 4px 0;
    }
  `;

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
      this.exercises = responseData;
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    return html`
       <div>
        ${this.exercises.map(
          (exercise) => html`
            <div class="exercise">
              <h3>${/* eslint-disable-next-line */ exercise["name"]}</h3>
              <p>${/* eslint-disable-next-line */ exercise["description"]}</p>
              <p>Dauer: ${/* eslint-disable-next-line */ exercise["duration"]} Minuten</p>
              <p>Schwierigkeitsgrad: ${/* eslint-disable-next-line */ exercise["difficulty"]}</p>
            </div>
          `
        )}
      </div>
    `;
  }
}
