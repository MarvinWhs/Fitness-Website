/*Autor: Marvin Wiechers*/
import express from 'express';
import { Exercise } from '../models/exercise';
import { GenericDAO } from '../models/generic.dao';
import { MongoGenericDAO } from '../models/mongo-generic.dao';
import { authService } from './services/auth.service.js';
import { cryptoService } from './services/crypto.service.js';
import { csrfService } from './services/csrf.service.js';

const router = express.Router();

router.get('/exercises', async (req, res) => {
  try {
    const exerciseDAO: MongoGenericDAO<Exercise> = req.app.locals.exerciseDAO;
    const exercises = await exerciseDAO.findAll();
    res.status(200).send(
      exercises.map(exercise => {
        return {
          id: exercise.id,
          name: cryptoService.decrypt(exercise.name),
          description: cryptoService.decrypt(exercise.description),
          duration: exercise.duration,
          difficulty: cryptoService.decrypt(exercise.difficulty),
          image: exercise.image
        };
      })
    );
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post('/exercises', authService.authenticationMiddleware, csrfService.validateToken, async (req, res) => {
  try {
    const exerciseDAO: GenericDAO<Exercise> = req.app.locals.exerciseDAO;
    const exercise = await exerciseDAO.create({
      userId: res.locals.user.id,
      name: cryptoService.encrypt(req.body.name),
      description: cryptoService.encrypt(req.body.description),
      duration: req.body.duration,
      difficulty: cryptoService.encrypt(req.body.difficulty),
      image: req.body.image
    });
    res.status(201).json({
      ...exercise,
      id: exercise.id,
      name: cryptoService.decrypt(exercise.name),
      description: cryptoService.decrypt(exercise.description),
      duration: exercise.duration,
      difficulty: cryptoService.decrypt(exercise.difficulty),
      image: exercise.image
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.delete('/exercises/:id', authService.authenticationMiddleware, csrfService.validateToken, async (req, res) => {
  try {
    const exerciseDAO: MongoGenericDAO<Exercise> = req.app.locals.exerciseDAO;
    const id = req.params.id;
    const exercise = await exerciseDAO.findOne({ id });
    if (!exercise) {
      res.status(404).send();
      return;
    }
    if (res.locals.user.id != exercise.userId) {
      res.status(401).send();
      return;
    }
    const success = await exerciseDAO.delete(id);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).send();
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

router.put('/exercises/:id', authService.authenticationMiddleware, csrfService.validateToken, async (req, res) => {
  try {
    const exerciseDAO: MongoGenericDAO<Exercise> = req.app.locals.exerciseDAO;
    const id = req.params.id;
    const exercise = await exerciseDAO.findOne({ id });
    if (!exercise) {
      res.status(404).send();
      return;
    }
    if (res.locals.user.id !== exercise.userId) {
      res.status(401).send();
      return;
    }
    const updatedExercise = {
      ...exercise,
      name: cryptoService.encrypt(req.body.name),
      description: cryptoService.encrypt(req.body.description),
      duration: req.body.duration,
      difficulty: cryptoService.encrypt(req.body.difficulty),
      image: req.body.image
    };
    const success = await exerciseDAO.update(updatedExercise);
    if (success) {
      res.status(200).json({
        ...updatedExercise,
        id: updatedExercise.id,
        name: cryptoService.decrypt(updatedExercise.name),
        description: cryptoService.decrypt(updatedExercise.description),
        duration: updatedExercise.duration,
        difficulty: cryptoService.decrypt(updatedExercise.difficulty),
        image: updatedExercise.image
      });
    } else {
      res.status(404).send();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router.post(
  '/exercises/test/:id',
  authService.authenticationMiddleware,
  csrfService.validateToken,
  async (req, res) => {
    const exerciseDAO: MongoGenericDAO<Exercise> = req.app.locals.exerciseDAO;
    const id = req.params.id;
    const exercise = await exerciseDAO.findOne({ id });
    if (!exercise) {
      res.status(404).send();
      return;
    }
    if (res.locals.user.id !== exercise.userId) {
      res.status(401).send();
      return;
    }
    res.status(200).send();
  }
);

export default router;
