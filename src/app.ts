import express from 'express';
import { Pool } from 'pg';
import { runEngine } from './services/runEngine';
const config = require('config');

const app = express();
const port = config.get('host.port');

// Database
export const db = new Pool({
  host: config.get('database.host'),
  user: config.get('database.user'),
  database: config.get('database.database'),
  password: config.get('database.password'),
  port: config.get('database.port')
});

const connectToDB = async () => {
  try {
    await db.connect();
  } catch (err) {
    console.log(err);
  }
};

connectToDB();

// Open the pipeline
runEngine();

// Listen on port
app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
