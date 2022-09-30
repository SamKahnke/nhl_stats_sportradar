import express from 'express';
import { Pool, QueryResult } from 'pg';
import { InitializeDBTables } from './services/InitializeDBTables';
import { RunPipeline } from './services/RunPipeline';
import { Game } from './services/types';

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

app.get(`/games`, async (req, res, next) => {
  const rawData = await db.query(
    `SELECT
      game_pk,
      home_team_id,
      away_team_id,
      status,
      status_name
    FROM games`
  );

  const data: Game[] = rawData.rows.map((row) => {
    return {
      gamePK: row.game_pk,
      homeTeamID: row.home_team_id,
      awayTeamID: row.away_team_id,
      status: row.status,
      statusName: row.status_name
    }
  })

  res.json(data);
});




