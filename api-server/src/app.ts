/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from 'node:http';
import startDB from './db.js';

import config from '../config.json' assert { type: 'json' };
import exerciseRoute from './Routes/exercise.route.js';
import authRoutes from './Routes/auth.routes.js';
import foodRoutes from './Routes/food.routes.js';
import { corsService } from './Routes/services/cors.service.js';

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
  app.use(cors());
  app.use(exerciseRoute);
  app.use(foodRoutes);
  app.use(authRoutes);
  app.use(corsService.manageCors);

  app.use((req, res, next) => {
    res.set('Content-Security-Policy', `script-src 'self'; style-src 'self'; frame-ancestor 'none';`);
    res.set('Strict-Transport-Security', 'max-age=36288000; includeSubDomains');
    res.set('Cross-Origin-Ressource-Policy', 'same-origin');
    next();
  });
}

export async function start() {
  const app = express();

  configureApp(app);
  await startDB(app);

  startHttpServer(app, config.server.port);
}

async function startHttpServer(app: Express, port: number) {
  const httpServer = http.createServer(app);
  httpServer.listen(port, () => {
    app.locals.port = port;
    console.log(`Server running at http://localhost:${port}`);
  });
}

start();
