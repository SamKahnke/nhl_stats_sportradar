import express from 'express';
import { Pool } from 'pg';
import { InitializeDBTables } from './services/initializeDBTables';
import { RunPipeline } from './services/RunPipeline';

const app = express();
const config = require('config');
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

// Listen on port
app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});

// Initialize tables if none exist
InitializeDBTables().then(() => {
  // Open the pipeline
  RunPipeline();
});




