/* Autor Niklas Lobo */

import express from 'express';
import bcrypt from 'bcrypt';
import { GenericDAO } from '../models/generic.dao.js';
import { User } from '../models/user.js';
import { authService } from './services/auth.service.js';
import { csrfService } from './services/csrf.service.js';

const router = express.Router();

// Register route with password confirmation and user existence check
router.post('/register', csrfService.manageCsrf, async (req, res) => {
  const { username, password, passwordCheck, email } = req.body;

  if (password !== passwordCheck) {
    return res.status(400).send({ message: 'Passwörter stimmen nicht überein' });
  }

  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const existingUser = await userDAO.findOne({ username });
  const existingEmail = await userDAO.findOne({ email });

  if (existingUser) {
    return res.status(400).send({ message: 'Benutzer existiert bereits' });
  }

  if (existingEmail) {
    return res.status(400).send({ message: 'Email existiert bereits' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { username, password: hashedPassword, email } as User;

  try {
    await userDAO.create(user);
    res.status(201).send({ message: 'Benutzer wurde erfolgreich registriert' });
  } catch (error) {
    res.status(500).send({ message: 'Fehler beim Registrieren' });
  }
});

// Login route
router.post('/login', csrfService.manageCsrf, async (req, res) => {
  const { username, password } = req.body;

  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  try {
    const user = await userDAO.findOne({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
      authService.createAndSetToken({ id: user.id }, res);
      res.status(200).send({ message: 'Erfolgreich angemeldet' });
    } else {
      res.status(401).send({ message: 'Falsche Eingabe' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Fehler beim Anmelden' });
  }
});

// Logout route
router.delete('/logout', (req, res) => {
  authService.removeToken(res);
  res.status(200).send({ message: 'Erfolgreich abgemeldet' });
});

export default router;
