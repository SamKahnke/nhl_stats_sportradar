import express from 'express';
import postgresql from 'pg';

const { Pool } = postgresql;
const axios = require('axios');
const app = express();

const root = 'https://statsapi.web.nhl.com/api/v1';
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Database
const pool = new Pool({
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


// Functions
let gamesToRecord = [];
async function checkForGames() {
    // database search to get list of existing ids
    const completedGamesInDatabase = [];
    try {
        const response = await axios.get(`${root}/schedule/?season=20212022`);
        for (let date of response.data.dates) {
            for (let game of date.games) {
                if (game.status.statusCode >= 3
                    && !gamesToRecord.includes[game.gamePk]
                    && !completedGamesInDatabase.includes[game.gamePk]
                    && gamesToRecord.length <= 10)
                {
                    gamesToRecord.push(game.gamePk);
                }
            }
        };
        console.log(gamesToRecord.length);
    } catch (error) {
        console.error(error);
    }
}

setInterval(() => {
    console.log(gamesToRecord.length);
    if (gamesToRecord.length > 0) {
        recordGames();
    }
}, 10000);

async function recordGames() {
    Promise.all(gamesToRecord.map(async (gameID) => {
        const game = await pool.query(`SELECT * FROM games WHERE game_pk = ${gameID}`);
        const response = await axios.get(`${root}/game/${gameID}/content`);
        if (game.rows.length > 0) {
            console.log(game.rows[0]);
        }
        if (response && response.data) {
            console.log(response.data.link);
            console.log(new Date());
        }
    }));
}

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});

checkForGames();

