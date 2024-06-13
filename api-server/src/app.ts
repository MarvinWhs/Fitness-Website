/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import https from 'node:https';
import fs from 'node:fs';
import startDB from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { Request, Response } from 'express';

//assert { type: 'json' }
import config from '../config.json';
import exerciseRoute from './Routes/exercise.route.js';
import authRoutes from './Routes/auth.routes.js';
import foodRoutes from './Routes/food.routes.js';
import calendarRoutes from './Routes/calendar.routes.js';
import { corsService } from './Routes/services/cors.service.js';
import { csrfService } from './Routes/services/csrf.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*Autor: Marvin Wiechers*/

function configureApp(app: Express) {
  app.use(express.json({ limit: '5mb' }));
  app.use(
    express.urlencoded({
      limit: '5mb',
      extended: true,
      parameterLimit: 5000
    })
  );
  app.use(cookieParser());
  app.use(corsService.manageCors);
  app.use(exerciseRoute);
  app.use(foodRoutes);
  app.use(authRoutes);
  app.use(calendarRoutes);

  app.use((req, res, next) => {
    res.set('Content-Security-Policy', `script-src 'self'; style-src 'self'; frame-ancestor 'none';`);
    res.set('Strict-Transport-Security', 'max-age=36288000; includeSubDomains; preload');
    res.set('Cross-Origin-Resource-Policy', 'same-origin');
    res.set('X-Frame-Options', 'SAMEORIGIN');
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-XSS-Protection', '1; mode=block');
    res.set('Referrer-Policy', 'same-origin');
    next();
  });
  app.get('/csrf-token', (req: Request, res: Response) => csrfService.getCsrfToken(req, res));
}

export async function start() {
  const app = express();

  configureApp(app);
  await startDB(app);

  startHttpsServer(app, config.server.port);
}

/* Autor: Lucas Berlage */
async function startHttpsServer(app: Express, port: number) {
  const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, './certs/server.key.pem')),
    cert: fs.readFileSync(path.join(__dirname, './certs/server.cert.pem')),
    ca: fs.readFileSync(path.join(__dirname, './certs/intermediate-ca.cert.pem'))
  };

  const httpsServer = https.createServer(httpsOptions, app);
  httpsServer.listen(port, () => {
    app.locals.port = port;
    console.log(`Server running at https://localhost:${port}`);
  });
}

start();
