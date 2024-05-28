/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import mongodb from 'mongodb';
import pg from 'pg';
import { Express } from 'express';

import config from '../config.json' assert { type: 'json' };
import { PsqlGenericDAO } from './models/psql-generic.dao.js';
import { Exercise } from './models/exercise';
import { InMemoryGenericDAO } from './models/in-memory-generic.dao.js';
import { MongoGenericDAO } from './models/mongo-generic.dao.js';
import { User } from './models/user'; // Importiere User

const { MongoClient } = mongodb;
const { Client } = pg;

export default async function startDB(app: Express) {
  switch (config.db.use) {
    case 'mongodb':
      await startMongoDB(app);
      break;
    case 'psql':
      await startPsql(app);
      break;
    default:
      startInMemoryDB(app);
  }
  return async () => Promise.resolve();
}

async function startInMemoryDB(app: Express) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const client = await connectToPsql();
  // TODO: DAOs erstellen und in app.locals ablegen
  app.locals.exerciseDAO = new InMemoryGenericDAO<Exercise>();
  app.locals.userDAO = new InMemoryGenericDAO<User>(); // Initialisiere UserDAO
}

async function startMongoDB(app: Express) {
  const db = (await connectToMongoDB()).db(config.db.connect.database);
  // TODO: DAOs erstellen und in app.locals ablegen
  app.locals.exerciseDAO = new MongoGenericDAO<Exercise>(db, 'exercises');
  app.locals.userDAO = new MongoGenericDAO<User>(db, 'users'); // Initialisiere MongoGenericDAO für Benutzer
}

async function connectToMongoDB() {
  const url = `mongodb://${config.db.connect.host}:${config.db.connect.port.mongodb}`;
  const client = new MongoClient(url, {
    auth: { username: config.db.connect.user, password: config.db.connect.password },
    authSource: config.db.connect.database
  });
  try {
    await client.connect();
  } catch (err) {
    console.log('Could not connect to MongoDB: ', err);
    process.exit(1);
  }
  return client;
}

async function startPsql(app: Express) {
  const client = await connectToPsql();
  // TODO: DAOs erstellen und in app.locals ablegen
  app.locals.exerciseDAO = new PsqlGenericDAO<Exercise>(client!, 'exercises');
  app.locals.userDAO = new PsqlGenericDAO<User>(client!, 'users'); // Initialisiere UserDAO
}

async function connectToPsql() {
  const client = new Client({
    user: config.db.connect.user,
    host: config.db.connect.host,
    database: config.db.connect.database,
    password: config.db.connect.password,
    port: config.db.connect.port.psql
  });

  try {
    await client.connect();
    return client;
  } catch (err) {
    console.log('Could not connect to PostgreSQL: ', err);
    process.exit(1);
  }
}
