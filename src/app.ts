import express from 'express';
import { Pool } from 'pg';
import { runEngine } from './services/runEngine';

const app = express();

export const root = 'https://statsapi.web.nhl.com/api/v1';
const port = 3000;

// Database
export const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  database: 'nhl_stats',
  password: 'password',
  port: 5000
});

const connectToDB = async () => {
  try {
    await pool.connect();
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
