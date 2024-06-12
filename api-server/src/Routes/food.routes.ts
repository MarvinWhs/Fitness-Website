/*Lucas Berlage*/
import express from 'express';
import { MongoGenericDAO } from '../models/mongo-generic.dao.js';
import { Food } from '../models/food.js';
import { authService } from './services/auth.service.js';
import { GenericDAO } from '../models/generic.dao.js';
import { cryptoService } from './services/crypto.service.js';
import { csrfService } from './services/csrf.service.js';

const router = express.Router();

router.get('/food-cards', authService.authenticationMiddleware, async (req, res) => {
  try {
    const foodDAO: MongoGenericDAO<Food> = req.app.locals.foodDAO;
    const userId = res.locals.user.id; // Holen Sie sich die userId aus den Abfrageparametern
    const foods = await foodDAO.findAll(); // Filtern nach userId
    const filteredFoods = foods.filter(food => food.userId === userId);
    res.status(200).send(
      filteredFoods.map(food => {
        return {
          id: food.id,
          name: cryptoService.decrypt(food.name),
          calories: food.calories,
          description: cryptoService.decrypt(food.description),
          quantity: food.quantity
        };
      })
    );
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

router.post('/food-cards', authService.authenticationMiddleware, csrfService.validateToken, async (req, res) => {
  try {
    const foodDAO: GenericDAO<Food> = req.app.locals.foodDAO;
    const food = await foodDAO.create({
      userId: res.locals.user.id,
      name: cryptoService.encrypt(req.body.name),
      description: cryptoService.encrypt(req.body.description),
      calories: req.body.calories,
      quantity: req.body.quantity
    });
    res.status(201).json({
      ...food,
      id: food.id,
      name: cryptoService.decrypt(food.name),
      description: cryptoService.decrypt(food.description),
      calories: food.calories,
      quantity: food.quantity
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

router.put('/food-cards/:id', authService.authenticationMiddleware, csrfService.validateToken, async (req, res) => {
  try {
    const foodDAO: MongoGenericDAO<Food> = req.app.locals.foodDAO;
    const id = req.params.id;
    const food = await foodDAO.findOne({ id });
    if (!food) {
      res.status(404).send();
      return;
    }
    if (res.locals.user.id !== food.userId) {
      res.status(401).send();
      return;
    }
    const updatedfood = { ...food, ...req.body };
    const success = await foodDAO.update(updatedfood);
    if (success) {
      res.status(200).json(updatedfood);
    } else {
      res.status(404).send();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

router.delete('/food-cards/:id', authService.authenticationMiddleware, csrfService.validateToken, async (req, res) => {
  try {
    const foodDAO: MongoGenericDAO<Food> = req.app.locals.foodDAO;
    const id = req.params.id;
    const food = await foodDAO.findOne({ id });
    if (!food) {
      res.status(404).send();
      return;
    }
    if (res.locals.user.id !== food.userId) {
      res.status(401).send();
      return;
    }
    const success = await foodDAO.delete(id);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).send();
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

export default router;
