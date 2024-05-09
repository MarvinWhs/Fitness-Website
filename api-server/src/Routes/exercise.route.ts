import express from 'express';
import { Exercise } from '../models/exercise';
import { GenericDAO } from '../models/generic.dao';
import { MongoGenericDAO } from '../models/mongo-generic.dao';

const router = express.Router();

router.get('/exercises', async (req, res) => {
  try {
    const exerciseDAO: MongoGenericDAO<Exercise> = req.app.locals.exerciseDAO;
    const exercises = await exerciseDAO.findAll();
    res.status(200).send(
      exercises.map((exercise) => {
        return {
          id: exercise.id,
          name: exercise.name,
          description: exercise.description,
          duration: exercise.duration,
          difficulty: exercise.difficulty,
            image: exercise.image,
        };
        
      })
    );
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post('/exercises', (req, res) => {
  try {
    const exerciseDAO: GenericDAO<Exercise> = req.app.locals.exerciseDAO;
    const exercise = exerciseDAO.create(req.body);
    res.status(201).send(exercise);
  } catch (err) {
    res.status(500).send(err);
  }
});

export default router;
