/* Autor: Niklas Lobo */

import express from 'express';
import bcrypt from 'bcrypt';
import { GenericDAO } from '../models/generic.dao.js';
import { User } from '../models/user.js';
import { authService } from './services/auth.service.js';
import { csrfService } from './services/csrf.service.js';
import { cryptoService } from './services/crypto.service.js';

const router = express.Router();

router.post('/register', csrfService.validateToken, async (req, res) => {
  const { username, password, passwordCheck, email } = req.body;

  if (password !== passwordCheck) {
    return res.status(400).send({ message: 'Passwörter stimmen nicht überein' });
  }

  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const existingUsers = await userDAO.findAll();
  const existingUser = existingUsers.find(user => cryptoService.decrypt(user.username) === username);
  const existingEmail = existingUsers.find(user => cryptoService.decrypt(user.email) === email);

  if (existingUser) {
    return res.status(400).send({ message: 'Benutzer existiert bereits' });
  }

  if (existingEmail) {
    return res.status(400).send({ message: 'Email existiert bereits' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const encryptedUsername = cryptoService.encrypt(username);
  const encryptedEmail = cryptoService.encrypt(email);
  const user = { username: encryptedUsername, password: hashedPassword, email: encryptedEmail } as User;

  try {
    await userDAO.create(user);
    res.status(201).send({ message: 'Benutzer wurde erfolgreich registriert' });
  } catch (error) {
    res.status(500).send({ message: 'Fehler beim Registrieren' });
  }
});

router.post('/login', csrfService.validateToken, async (req, res) => {
  const { username, password } = req.body;

  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  try {
    const users = await userDAO.findAll();
    const user = users.find(user => cryptoService.decrypt(user.username) === username);

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

router.delete('/logout', csrfService.validateToken, async (req, res) => {
  authService.removeToken(res);
  res.status(200).send({ message: 'Erfolgreich abgemeldet' });
});

export default router;
