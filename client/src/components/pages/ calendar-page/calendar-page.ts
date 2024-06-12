/* Autor: Niklas Lobo */

import { LitElement, html, nothing } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { HttpClient, httpClientContext } from '../../../http-client.js';
import componentStyle from './calendar-page.css?inline';
import { Notificator } from '../../widgets/notificator/notificator.js';
import { Calendar, EventApi } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';

interface Note {
  id: string;
  date: string;
  name: string;
  content: string;
}

@customElement('calendar-page')
export class CalendarPageComponent extends LitElement {
  static styles = [componentStyle];

  @consume({ context: httpClientContext })
  httpClient!: HttpClient;

  @state() isModalOpen: boolean = false;
  @state() isEditModalOpen: boolean = false;
  @state() notes: Note[] = [];
  @state() selectedNote: Note | null = null;
  @query('input[type="file"]') fileInput!: HTMLInputElement;
  @query('#calendar') calendarElement!: HTMLElement;
  calendar!: Calendar;
  selectedDate: string | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.fetchNotes();
  }

  firstUpdated() {
    this.initializeCalendar();
  }

  private async fetchNotes(): Promise<void> {
    try {
      const response = await this.httpClient.get('/notes');
      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }
      this.notes = await response.json();
      this.updateCalendarEvents();
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  }

  private initializeCalendar() {
    const calendarEl = this.shadowRoot?.querySelector('#calendar') as HTMLElement;
    if (calendarEl) {
      this.calendar = new Calendar(calendarEl, {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        dateClick: this.handleDateClick.bind(this),
        eventClick: this.handleEventClick.bind(this),
        events: this.notes.map(note => ({
          id: note.id,
          title: note.name,
          start: note.date
        }))
      });
      this.calendar.render();
    }
  }

  private updateCalendarEvents() {
    if (this.calendar) {
      this.calendar.removeAllEvents();
      this.notes.forEach(note => {
        this.calendar.addEvent({
          id: note.id,
          title: note.name,
          start: note.date
        });
      });
    }
  }

  private handleDateClick(arg: DateClickArg) {
    this.selectedDate = arg.dateStr;
    this.updateCalendarEvents();
  }

  private handleEventClick(arg: { event: EventApi }) {
    const event = arg.event;
    const note = this.notes.find(note => note.id === event.id);
    if (note) {
      this.selectedNote = note;
      this.openEditModal();
    }
  }

  private openModal(): void {
    this.isModalOpen = true;
    const modal = this.shadowRoot!.getElementById('addNoteModal') as HTMLElement;
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  private closeModal(): void {
    this.isModalOpen = false;
    const modal = this.shadowRoot!.getElementById('addNoteModal') as HTMLElement;
    if (modal) {
      modal.style.display = 'none';
    }
  }

  private openEditModal(): void {
    this.isEditModalOpen = true;
    const modal = this.shadowRoot!.getElementById('editNoteModal') as HTMLElement;
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  private handleEditButtonClick(note: Note) {
    this.selectedNote = note;
    this.openEditModal();
  }

  private closeEditModal(): void {
    this.isEditModalOpen = false;
    this.selectedNote = null;
    const modal = this.shadowRoot!.getElementById('editNoteModal') as HTMLElement;
    if (modal) {
      modal.style.display = 'none';
    }
  }

  private async addNote(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const noteData = {
      date: formData.get('date') as string,
      content: formData.get('content') as string,
      name: formData.get('name') as string
    };

    try {
      const response = await this.httpClient.post('/notes', noteData);
      this.notes.push(await response.json());
      this.closeModal();
      this.updateCalendarEvents();
      Notificator.showNotification('Note successfully added', 'erfolg');
    } catch (error) {
      console.error('Error adding note:', error);
      Notificator.showNotification('Error adding note', 'fehler');
    }
  }

  private async editNote(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.selectedNote) return;
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const updatedNoteData = {
      ...this.selectedNote,
      date: formData.get('date') as string,
      content: formData.get('content') as string,
      name: formData.get('name') as string
    };

    try {
      const response = await this.httpClient.put(`/notes/${this.selectedNote.id}`, updatedNoteData);
      const updatedNote = await response.json();
      this.notes = this.notes.map(note => (note.id === updatedNote.id ? updatedNote : note));
      this.closeEditModal();
      Notificator.showNotification('Note successfully updated', 'erfolg');
    } catch (error) {
      console.error('Error updating note:', error);
      Notificator.showNotification('Error updating note', 'fehler');
    }
  }

  private async deleteNote(noteId: string): Promise<void> {
    try {
      await this.httpClient.delete(`/notes/${noteId}`);
      this.notes = this.notes.filter(note => note.id !== noteId);
      this.updateCalendarEvents();
      Notificator.showNotification('Note successfully deleted', 'erfolg');
    } catch (error) {
      console.error('Error deleting note:', error);
      Notificator.showNotification('Error deleting note', 'fehler');
    }
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  render() {
    return html`
      <main class="main-content">
        <div class="notes-header">
          <h1>Kalender Notizen</h1>
          <button class="link-button" id="addNoteButton" @click="${this.openModal}">Notiz hinzufügen</button>
        </div>
        <div id="calendar"></div>
        <div class="notes-list">
          ${this.notes.map(
            note => html`
              <div class="note-card">
                <div class="note-content">
                  <p><strong>Datum:</strong> ${note.date}</p>
                  <p><strong>Name:</strong> ${note.name}</p>
                  <p><strong>Inhalt:</strong> ${note.content}</p>
                </div>
                <button class="edit-button" @click="${() => this.handleEditButtonClick(note)}">Bearbeiten</button>
                <button class="delete-button" @click="${() => this.deleteNote(note.id)}">Löschen</button>
              </div>
            `
          )}
        </div>
        <div id="addNoteModal" class="modal">
          <div class="modal-content">
            <button @click="${this.closeModal}" class="close-button" aria-label="Close modal">&times;</button>
            <h3>Add New Note</h3>
            <form @submit="${this.addNote}">
              <input type="date" name="date" .value="${this.selectedDate ?? ''}" required />
              <input type="text" name="name" placeholder="Note name" required />
              <textarea name="content" placeholder="Note content" required></textarea>
              <button type="submit">Add Note</button>
            </form>
          </div>
        </div>
        <div id="editNoteModal" class="modal">
          <div class="modal-content">
            <button @click="${this.closeEditModal}" class="close-button" aria-label="Close modal">&times;</button>
            <h3>Edit Note</h3>
            ${this.selectedNote
              ? html`
                  <form @submit="${this.editNote}">
                    <input type="date" name="date" .value="${this.selectedNote.date}" required />
                    <input
                      type="text"
                      name="name"
                      placeholder="Note name"
                      .value="${this.selectedNote.name}"
                      required
                    />
                    <textarea name="content" placeholder="Note content" required>${this.selectedNote.content}</textarea>
                    <button type="submit">Update Note</button>
                  </form>
                `
              : nothing}
          </div>
        </div>
      </main>
    `;
  }
}
