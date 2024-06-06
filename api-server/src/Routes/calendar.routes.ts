/* Autor Niklas Lobo */

import express from 'express';
import { authService } from '../Routes/services/auth.service.js';
import { GenericDAO } from '../models/generic.dao.js';
import { Notes } from '../models/notes.js';
import { MongoGenericDAO } from '../models/mongo-generic.dao.js';

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
          date: note.date,
          content: note.content,
          name: note.name
        };
      })
    );
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

router.post('/notes', authService.authenticationMiddleware, async (req, res) => {
  try {
    const noteDAO: GenericDAO<Notes> = req.app.locals.noteDAO;
    const note = await noteDAO.create({
      userId: res.locals.user.id,
      date: req.body.date,
      content: req.body.content,
      name: req.body.name
    });
    res.status(201).json({
      ...note,
      id: note.id,
      date: note.date,
      content: note.content,
      name: note.name
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

router.delete('/notes/:id', authService.authenticationMiddleware, async (req, res) => {
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

router.put('/notes/:id', authService.authenticationMiddleware, async (req, res) => {
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
    const updatedNote = { ...note, ...req.body }; // Merge the existing note with the updated fields
    const success = await noteDAO.update(updatedNote);
    if (success) {
      res.status(200).json(updatedNote);
    } else {
      res.status(404).send();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

export default router;
