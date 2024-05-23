/* Autor Niklas Lobo */

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authService } from './services/auth.service'; // Die Authentifizierungsservice-Datei

const router = express.Router();
const SECRET = 'your_secret_key';

router.post('/register', async (req, res) => {
  const { username, password, email } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = { username, password: hashedPassword, email };

  // Speichern des Benutzers in der Datenbank
  const userDAO = req.app.locals.userDAO;
  try {
    await userDAO.insertOne(user);
    res.status(201).send({ message: 'Benutzer wurde erfolgreich registriert' });
  } catch (error) {
    res.status(500).send({ message: 'Fehler beim Registrieren' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const userDAO = req.app.locals.userDAO;
  try {
    const user = await userDAO.findOne({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ username: user.username }, SECRET, { expiresIn: '1h' });
      res.cookie('jwt-token', token, { httpOnly: true });
      res.status(200).send({ message: 'Erfolgreich angemeldet' });
    } else {
      res.status(401).send({ message: 'Falsche Eingabe' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Fehler beim anmelden' });
  }
});

export default router;
