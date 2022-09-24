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
}, 1000);

async function recordGames() {
    Promise.all(gamesToRecord.map(async (gameID) => {
        const game = await pool.query(`SELECT * FROM games WHERE game_pk = ${gameID}`);
        
        if (game.rows.length === 0) {
            // insert
            const stats = await axios.get(`${root}/game/${gameID}/feed/live/diffPatch?startTimecode=20210120_100000`);
            Object.keys(stats.data.liveData.boxscore.teams).map((team, index) => {
                return Object.keys(stats.data.liveData.boxscore.teams[team].players).map(async (player, index) => {
                    await pool.query(`INSERT INTO game_stats (
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
                        penalty_minutes) VALUES (
                            ${gameID},
                            "${player}",
                            ${stats.data.liveData.boxscore.teams[team].team.id},
                            "${stats.data.liveData.boxscore.teams[team].team.name || null}",
                            "${stats.data.liveData.boxscore.teams[team].players[player].person.fullName || null}",
                            ${stats.data.gameData.players[player].currentAge || null},
                            ${stats.data.liveData.boxscore.teams[team].players[player].jerseyNumber || null},
                            "${stats.data.liveData.boxscore.teams[team].players[player].position.name || null}",
                            ${stats.data.liveData.boxscore.teams[team].players[player].stats.skaterStats?.assists || 0},
                            ${stats.data.liveData.boxscore.teams[team].players[player].stats.skaterStats?.goals || 0},
                            ${stats.data.liveData.boxscore.teams[team].players[player].stats.skaterStats?.hits || 0},
                            ${stats.data.liveData.boxscore.teams[team].players[player].stats.skaterStats?.penaltyMinutes || 0}
                        )
                    `).catch((error) => {
                        console.log(error);
                        console.log(`${gameID},
                            "${player}",
                            ${stats.data.liveData.boxscore.teams[team].team.id},
                            "${stats.data.liveData.boxscore.teams[team].team.name || null}",
                            "${stats.data.liveData.boxscore.teams[team].players[player].person.fullName || null}",
                            ${stats.data.gameData.players[player].currentAge || null},
                            ${stats.data.liveData.boxscore.teams[team].players[player].jerseyNumber || null},
                            "${stats.data.liveData.boxscore.teams[team].players[player].position.name || null}",
                            ${stats.data.liveData.boxscore.teams[team].players[player].stats.skaterStats?.assists || 0},
                            ${stats.data.liveData.boxscore.teams[team].players[player].stats.skaterStats?.goals || 0},
                            ${stats.data.liveData.boxscore.teams[team].players[player].stats.skaterStats?.hits || 0},
                            ${stats.data.liveData.boxscore.teams[team].players[player].stats.skaterStats?.penaltyMinutes || 0}`);
                    });
                    await pool.query(`INSERT INTO games (
                            game_pk,
                            home_team_id,
                            away_team_id,
                            status
                        ) VALUES (
                            ${gameID},
                            ${stats.data.gameData.teams.home.id},
                            ${stats.data.gameData.teams.away.id},
                            ${stats.data.gameData.status.statusCode}
                        )
                    `);
                });
            });
        } else {
            // update
            // remove from list
        }
    }));
}

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});

checkForGames();
