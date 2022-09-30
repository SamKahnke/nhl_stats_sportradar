import express from 'express';
import { Pool, QueryResult } from 'pg';
import { InitializeDBTables } from './services/InitializeDBTables';
import { RunPipeline } from './services/RunPipeline';
import { Game, Stat } from './services/types';

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
  } catch (error) {
    console.log('Error connecting to database:', error);
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

app.get(['/', '/readme'], (req, res) => {
  res.redirect('https://github.com/SamKahnke/nhl_stats_sportradar/blob/master/README.md');
});

app.get('/games', (req, res) => {
  const data: Game[] = [];
  
  const params: string = buildParams([
    { column: 'home_team_id', value: req.query.homeTeamID },
    { column: 'away_team_id', value: req.query.awayTeamID }
  ]);

  const query = `SELECT
      game_pk,
      home_team_id,
      away_team_id,
      status,
      status_name
    FROM games
    ${params}`;

  db.query(query, (error, result) => {
    result.rows.map((row) => {
      data.push({
        gamePK: row.game_pk,
        homeTeamID: row.home_team_id,
        awayTeamID: row.away_team_id,
        status: row.status,
        statusName: row.status_name
      });
    });
    if (error) {
      console.log('Error executing query:', error);
    }
    res.json(data);
  });
});

app.get('/games/:gamePK', (req, res) => {
  const data: Game[] = [];
  const query = `SELECT
      game_pk,
      home_team_id,
      away_team_id,
      status,
      status_name
    FROM games
    WHERE game_pk = ${req.params.gamePK}`;

  db.query(query, (error, result) => {
    result.rows.map((row) => {
      data.push({
        gamePK: row.game_pk,
        homeTeamID: row.home_team_id,
        awayTeamID: row.away_team_id,
        status: row.status,
        statusName: row.status_name
      });
    });
    if (error) {
      console.log('Error executing query:', error);
    }
    res.json(data);
  });
});

app.get('/stats', (req, res) => {
  const data: Stat[] = [];

  const params: string = buildParams([
    { column: 'game_pk', value: req.query.gamePK },
    { column: 'player_id', value: req.query.playerID },
    { column: 'team_id', value: req.query.teamID }
  ]);

  const query = `SELECT
      game_pk,
      player_id,
      team_id,
      team_name,
      name,
      age,
      number,
      position,
      assists,
      goals,
      hits,
      penalty_minutes
    FROM stats
    ${params}`;

  db.query(query, (error, result) => {
    result.rows.map((row) => {
      data.push({
        gamePK: row.game_pk,
        playerID: row.player_id,
        teamID: row.team_id,
        teamName: row.team_name,
        name: row.name,
        age: row.age,
        number: row.number,
        position: row.position,
        assists: row.assists,
        goals: row.goals,
        hits: row.hits,
        penaltyMinutes: row.penalty_minutes
      });
    });
    if (error) {
      console.log('Error executing query:', error);
    }
    res.json(data);
  });
});

app.get('*', function (req, res) {
  res.send('Invalid url. Please see documentation <a target="_blank" href="https://github.com/SamKahnke/nhl_stats_sportradar/blob/master/README.md">here</a>.');
})

export function buildParams(params: { column: string, value: any }[]) {
  let statement: string = '';
  params.map((param) => {
    if (param.value) {
      if (statement) {
        statement = statement + ' AND ';
      } else {
        statement = 'WHERE '
      }
      statement = statement + `${param.column} = ${typeof(param.value) === 'string' ? `'${param.value}'` : param.value}`;
    }
  });

  return statement;
}



