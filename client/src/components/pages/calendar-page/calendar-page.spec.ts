/* Autor: Niklas Lobo */

import { CalendarPageComponent } from './calendar-page';
import { expect } from 'chai';
import sinon, { SinonFakeServer } from 'sinon';
import { HttpClient } from '../../../http-client';

describe('CalendarPageComponent', () => {
  let component: CalendarPageComponent;
  let httpClient: HttpClient;
  let getStub: sinon.SinonStub;

  beforeEach(() => {
    httpClient = new HttpClient();
    component = new CalendarPageComponent();
    component.httpClient = httpClient;
    getStub = sinon.stub(httpClient, 'get');
  });

  afterEach(() => {
    getStub.restore();
  });

  it('should fetch notes', async () => {
    const mockNotes = [
      { id: '1', date: '2022-01-01', name: 'Note 1', content: 'Content 1' },
      { id: '2', date: '2022-01-02', name: 'Note 2', content: 'Content 2' }
    ];
    getStub.returns(Promise.resolve({ ok: true, json: () => Promise.resolve(mockNotes) }));

    await component.fetchNotes();

    expect(component.notes).to.deep.equal(mockNotes);
    sinon.assert.calledWith(getStub, '/notes');
  });

  it('should handle error when fetching notes', async () => {
    const consoleErrorStub = sinon.stub(console, 'error');
    getStub.returns(Promise.resolve({ ok: false }));

    await component.fetchNotes();

    sinon.assert.calledWith(consoleErrorStub, 'Error fetching notes:', new Error('Failed to fetch notes'));
    consoleErrorStub.restore();
  });
});

describe('CalendarPageComponent', () => {
  let component: CalendarPageComponent;
  let server: SinonFakeServer;

  beforeEach(() => {
    component = new CalendarPageComponent();
    server = sinon.fakeServer.create();
  });

  afterEach(() => {
    server.restore();
  });

  it('should add a note', async () => {
    const initialNotesLength = component.notes.length;

    const formData = new FormData();
    formData.append('date', '2024-06-12');
    formData.append('name', 'Test Note');
    formData.append('content', 'Sample content');

    server.respondWith('POST', '/notes', [
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify({ id: '1', ...formDataToObject(formData) })
    ]);

    const addNoteEvent = new Event('submit', { bubbles: true });
    const addNotePromise = component.addNote(addNoteEvent as Event);

    server.respond();

    await addNotePromise;
    expect(component.notes.length).to.equal(initialNotesLength + 1);
  });

  it('should edit a note', async () => {
    const noteToUpdate = { id: '1', date: '2024-06-12', name: 'Test Note', content: 'Sample content' };
    component.selectedNote = noteToUpdate;

    const updatedContent = 'Updated content';

    const formData = new FormData();
    formData.append('date', noteToUpdate.date);
    formData.append('name', noteToUpdate.name);
    formData.append('content', updatedContent);

    server.respondWith('PUT', `/notes/${noteToUpdate.id}`, [
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify({ ...noteToUpdate, content: updatedContent })
    ]);

    const editNoteEvent = new Event('submit', { bubbles: true });
    const editNotePromise = component.editNote(editNoteEvent as Event);

    server.respond();

    await editNotePromise;
    expect(component.notes.find(note => note.id === noteToUpdate.id)?.content).to.equal(updatedContent);
  });

  it('should delete a note', async () => {
    const noteToDelete = { id: '1', date: '2024-06-12', name: 'Test Note', content: 'Sample content' };
    component.notes = [noteToDelete];

    server.respondWith('DELETE', `/notes/${noteToDelete.id}`, [200, { 'Content-Type': 'application/json' }, '']);

    const deleteNotePromise = component.deleteNote(noteToDelete.id);

    server.respond();

    await deleteNotePromise;
    expect(component.notes.length).to.equal(0);
  });

  function formDataToObject(formData: FormData): { [key: string]: string } {
    const obj: { [key: string]: string } = {};
    formData.forEach((value, key) => {
      obj[key] = value as string;
    });
    return obj;
  }
});
