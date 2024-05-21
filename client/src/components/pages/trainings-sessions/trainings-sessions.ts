/* Autor: Marvin Wiechers */
import { LitElement, html, nothing } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { HttpClient, httpClientContext } from '../../../http-client.js';
import componentStyle from './trainings-sessions.css?inline';

@customElement('trainings-sessions')
export class TrainingsComponent extends LitElement {
  static styles = [componentStyle];

  @consume({ context: httpClientContext })
  httpClient!: HttpClient;

  @state() imageData: string | ArrayBuffer | null = null;

  @query('input[type="file"]') fileInput!: HTMLInputElement;

  @state() isModalOpen: boolean = false;

  private openModal(): void {
    this.isModalOpen = true;
    const modal = this.shadowRoot!.getElementById('addExerciseModal') as HTMLElement;
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  private closeModal(): void {
    this.isModalOpen = false;
    const modal = this.shadowRoot!.getElementById('addExerciseModal') as HTMLElement;
    if (modal) {
      modal.style.display = 'none';
    }
  }

  private preventLink(event: Event): void {
    event.preventDefault();
    if (!this.isModalOpen) {
      this.openModal();
    }
  }

  private handleDragOver(event: DragEvent): void {
    event.preventDefault(); // Dies ist entscheidend, um zu ermöglichen, dass das Drop-Event gefeuert wird.
    event.dataTransfer!.dropEffect = 'copy'; // Visuelles Feedback, dass die Datei kopiert wird.
  }

  private handleDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer!.files && event.dataTransfer!.files[0]) {
      this.processFile(event.dataTransfer!.files[0]);
    }
  }

  private removeImage(): void {
    this.imageData = null;
    this.requestUpdate();
  }

  private async addExercise(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const exerciseData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      duration: parseInt(formData.get('duration') as string),
      difficulty: formData.get('difficulty') as string,
      image: this.imageData
    };

    try {
      const response = await this.httpClient.post('http://localhost:3000/exercises', exerciseData);
      console.log('Server Response:', response);
      this.closeModal();
      window.location.reload();
    } catch (error) {
      console.error('Fehler beim Senden der Daten:', error);
    }
  }
  private async scaleImageIfNeeded(file: File): Promise<File> {
    if (file.size < 1024 * 1024) {
      return file;
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const img = new Image();
        img.onload = () => {
          let canvas = document.createElement('canvas');
          let ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Berechnen des Skalierungsfaktors
          const scaleFactor = Math.sqrt((1024 * 1024) / file.size);
          canvas.width = img.width * scaleFactor;
          canvas.height = img.height * scaleFactor;

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          ctx.canvas.toBlob(
            blob => {
              if (!blob) {
                reject(new Error('Canvas to Blob conversion failed'));
                return;
              }
              const resizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(resizedFile);
            },
            'image/jpeg',
            0.7
          );
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error('FileReader error'));
      reader.readAsDataURL(file);
    });
  }

  private handleFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      console.error('No file selected');
      return;
    }
    const file = input.files[0];

    this.scaleImageIfNeeded(file)
      .then(scaledFile => {
        this.processFile(scaledFile);
      })
      .catch(error => {
        console.error('Error scaling image:', error);
      });
  }
  private processFile(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.imageData = reader.result as string;
      this.requestUpdate();
    };
    reader.onerror = () => {
      console.error('Error reading file');
    };
    reader.readAsDataURL(file);
  }

  render() {
    return html`
    <main class="main-content">
        <div class="two-column-row" id="first-row">
        <div class="image-area">
            <img src="./gymPerson.png">
        </div>
            <div class="two-column-row-content">
                <h1>Fitness-Übungen</h1>
                <p>In unserem Angebot finden Sie eine umfangreiche Auswahl an Fitnessübungen, die es Ihnen ermöglichen, Ihr Training individuell auf die gewünschten Muskelgruppen abzustimmen. Entdecken Sie das perfekte Trainingsprogramm, das optimal auf Ihre Bedürfnisse zugeschnitten ist, und gestalten Sie Ihre Trainingseinheiten effektiv und zielgerichtet.</p>
                <p>Unser vielfältiges Angebot an Übungen stammt direkt aus unserer engagierten Community. Jedes Mitglied hat die Möglichkeit, eigene Übungen beizutragen und somit das Spektrum stetig zu erweitern. Indem Sie im Laufe der Zeit Ihre eigenen Übungen und Trainingspläne hinzufügen, tragen Sie wertvolles Wissen bei, von dem andere Mitglieder profitieren können. Ihre Erfahrungen bereichern die gesamte Gemeinschaft und fördern einen aktiven Austausch unter allen Beteiligten.</p>
                <div >
                    <button class="link-button" id="adding" href="#" @click="${this.preventLink}">
                        Jetzt Übungen hinzufügen
                </button>
                </div>
                <!-- Modal für das Hinzufügen einer Übung -->
                <div id="addExerciseModal" class="modal">
        <div class="modal-content">
          <button @click="${this.closeModal}" class="close-button" aria-label="Close modal">&times;</button>
          <h3>Neue Übung hinzufügen</h3>
          <form @submit="${this.addExercise}">
            <input type="text" placeholder="Name der Übung" name="name" required>
            <textarea placeholder="Beschreibung der Übung" name="description" required></textarea>
            <input type="number" placeholder="Dauer in Minuten" name="duration" min="1" required>
            <select name="difficulty" required>
              <option value="">Schwierigkeitsgrad wählen</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            <div class="drop-area" @click="${() => this.fileInput.click()}" @dragover="${this.handleDragOver}" @drop="${this.handleDrop}">
      <p>Ziehe ein Bild hierher oder <strong>klicke, um ein Bild auszuwählen</strong>.</p>
      <input type="file" name="image" accept="image/*" @change="${this.handleFileUpload}" hidden>
      ${
        this.imageData
          ? html` <div class="image-preview">
              <img src="${this.imageData}" alt="Vorschau" class="preview" />
              <button @click="${this.removeImage}" class="delete-image" id="remImg" title="Bild löschen">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="red" viewBox="0 0 24 24">
                  <path d="M3 6v18h18V6H3zm16 2v14H5V8h14zM1 4h22v2H1V4zm5 0h2v2H6V4zm4 0h2v2h-2V4zm4 0h2v2h-2V4z" />
                </svg>
              </button>
            </div>`
          : nothing
      }
    </div>
            <button type="submit">Hinzufügen</button>
          </form>
        </div>
      </div>
            </div>
        </div>
        <div>
            <div class="mid-text">
                <h2>Alle Einheiten</h2>
                <p> Hier sind alle Übungen aufgelistest. Suchen Sie sich die für sich am ansprechendsten aus oder filtern sie ganz einfach nach den 
                    gewünschten Kriterien. 
                </p>
            </div>
        </div>
        <div class="two-column-row">
        <trainings-card></trainings-card>
  </div>
  </div>
 
  </main>
`;
  }
}
