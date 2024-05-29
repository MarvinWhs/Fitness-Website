/*Lucas Berlage*/
import express from 'express';
import { MongoGenericDAO } from '../models/mongo-generic.dao.js';
import { Food } from '../models/food.js';
import { authService } from './services/auth.service.js';
import { GenericDAO } from '../models/generic.dao.js';

const router = express.Router();

router.get('/foods', async (req, res) => {
  try {
    const foodDAO: MongoGenericDAO<Food> = req.app.locals.foodDAO;
    const foods = await foodDAO.findAll();
    res.status(200).send(
      foods.map(food => {
        return {
          id: food.id,
          name: food.name,
          description: food.description,
          calories: food.calories
        };
      })
    );
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post('/foods', authService.authenticationMiddleware, async (req, res) => {
  try {
    const foodDAO: GenericDAO<Food> = req.app.locals.foodDAO;
    const food = await foodDAO.create({
      userId: res.locals.user.id,
      name: req.body.name,
      description: req.body.description,
      calories: req.body.calories
    });
    res.status(201).json({
      ...food,
      id: food.id,
      name: food.name,
      description: food.description,
      calories: food.calories
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

router.delete('/foods/:id', authService.authenticationMiddleware, async (req, res) => {
  try {
    const foodDAO: MongoGenericDAO<Food> = req.app.locals.foodDAO;
    const id = req.params.id;
    const food = await foodDAO.findOne({ id });
    if (!food) {
      res.status(404).send('Food not found');
      return;
    }
    await foodDAO.delete(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).send(err);
  }
});
