/* Autor: Niklas Lobo */

import express from 'express';
import { authService } from '../Routes/services/auth.service.js';
import { GenericDAO } from '../models/generic.dao.js';
import { Notes } from '../models/notes.js';
import { MongoGenericDAO } from '../models/mongo-generic.dao.js';
import { cryptoService } from './services/crypto.service.js';
import { csrfService } from './services/csrf.service.js';

const router = express.Router();

router.get('/notes', authService.authenticationMiddleware, async (req, res) => {
  try {
    const noteDAO: MongoGenericDAO<Notes> = req.app.locals.noteDAO;
    const userId = res.locals.user.id; // Get the user ID from the authenticated user
    const notes = await noteDAO.findAll({ userId }); // Filter notes by user ID
    res.status(200).send(
      notes.map(note => {
        return {
          id: note.id,
          date: cryptoService.decrypt(note.date),
          content: cryptoService.decrypt(note.content),
          name: cryptoService.decrypt(note.name)
        };
      })
    );
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

router.post('/notes', authService.authenticationMiddleware, csrfService.validateToken, async (req, res) => {
  try {
    const noteDAO: GenericDAO<Notes> = req.app.locals.noteDAO;
    const note = await noteDAO.create({
      userId: res.locals.user.id,
      date: cryptoService.encrypt(req.body.date),
      content: cryptoService.encrypt(req.body.content),
      name: cryptoService.encrypt(req.body.name)
    });
    res.status(201).json({
      ...note,
      id: note.id,
      date: cryptoService.decrypt(note.date),
      content: cryptoService.decrypt(note.content),
      name: cryptoService.decrypt(note.name)
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

router.delete('/notes/:id', authService.authenticationMiddleware, csrfService.validateToken, async (req, res) => {
  try {
    const noteDAO: GenericDAO<Notes> = req.app.locals.noteDAO;
    const id = req.params.id;
    const note = await noteDAO.findOne({ id });
    if (!note) {
      res.status(404).send();
      return;
    }
    if (res.locals.user.id !== note.userId) {
      res.status(401).send();
      return;
    }
    const success = await noteDAO.delete(id);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).send();
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

router.put('/notes/:id', authService.authenticationMiddleware, csrfService.validateToken, async (req, res) => {
  try {
    const noteDAO: GenericDAO<Notes> = req.app.locals.noteDAO;
    const id = req.params.id;
    const note = await noteDAO.findOne({ id });
    if (!note) {
      res.status(404).send();
      return;
    }
    if (res.locals.user.id !== note.userId) {
      res.status(401).send();
      return;
    }
    const updatedNote = {
      ...note,
      date: cryptoService.encrypt(req.body.date),
      content: cryptoService.encrypt(req.body.content),
      name: cryptoService.encrypt(req.body.name)
    };
    const success = await noteDAO.update(updatedNote);
    if (success) {
      res.status(200).json({
        ...updatedNote,
        id: updatedNote.id,
        date: cryptoService.decrypt(updatedNote.date),
        content: cryptoService.decrypt(updatedNote.content),
        name: cryptoService.decrypt(updatedNote.name)
      });
    } else {
      res.status(404).send();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

export default router;
