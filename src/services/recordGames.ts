import axios from "axios";
import { pool, root } from "../app";
import { isGameComplete } from "../utils/utils";

export async function recordGames(gamesQueue, completeRecordedGames) {
    Promise.all(gamesQueue.map(async (gamePK) => {
        const game = await pool.query(`SELECT * FROM games WHERE game_pk = ${gamePK}`);
        const stats = await axios.get(`${root}/game/${gamePK}/feed/live/diffPatch?startTimecode=20220101_000000`);
        const gameData = stats.data.gameData;
        const boxscoreData = stats.data.liveData.boxscore;

        if (game.rows.length === 0) {
            // Insert game
            await pool.query(`INSERT INTO games (
                    game_pk,
                    home_team_id,
                    away_team_id,
                    status,
                    status_name
                ) VALUES (
                    ${gamePK},
                    ${gameData.teams.home.id},
                    ${gameData.teams.away.id},
                    ${gameData.status.statusCode},
                    '${gameData.status.detailedState}'
                )
            `);
            // Insert game_stats for each player
            Object.keys(boxscoreData.teams).map((team, index) => {
                return Object.keys(boxscoreData.teams[team].players).map(async (player, index) => {
                    const INSERT_game_stats = `INSERT INTO game_stats (
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
                            ${gamePK},
                            '${player.replace("'","''")}',
                            ${boxscoreData.teams[team].team.id},
                            ${`'${boxscoreData.teams[team].team.name.replace("'","''")}'` || null},
                            ${`'${boxscoreData.teams[team].players[player].person.fullName.replace("'","''")}'` || null},
                            ${gameData.players[player].currentAge || null},
                            ${boxscoreData.teams[team].players[player].jerseyNumber || null},
                            ${`'${boxscoreData.teams[team].players[player].position.name.replace("'","''")}'` || null},
                            ${boxscoreData.teams[team].players[player].stats.skaterStats?.assists || 0},
                            ${boxscoreData.teams[team].players[player].stats.skaterStats?.goals || 0},
                            ${boxscoreData.teams[team].players[player].stats.skaterStats?.hits || 0},
                            ${boxscoreData.teams[team].players[player].stats.skaterStats?.penaltyMinutes || 0}
                    )`;
                    await pool.query(INSERT_game_stats).catch((error) => {
                        console.log(error);
                        console.log('Error with query:', INSERT_game_stats);
                    });
                });
            });
            // Remove completed games from queue
            if (isGameComplete(stats.data.gameData.status.statusCode)) {
                gamesQueue.splice(gamesQueue.indexOf(gamePK), 1);
            }
        } else {
            // Update game_stats for each player
            Object.keys(stats.data.liveData.boxscore.teams).map((team, index) => {
                return Object.keys(stats.data.liveData.boxscore.teams[team].players).map(async (player, index) => {
                    const UPDATE_game_stats = `UPDATE game_stats SET
                        player_id = '${player.replace("'","''")}',
                        team_id = ${boxscoreData.teams[team].team.id},
                        team_name = ${`'${boxscoreData.teams[team].team.name.replace("'","''")}'` || null},
                        name = ${`'${boxscoreData.teams[team].players[player].person.fullName.replace("'","''")}'` || null},
                        age = ${gameData.players[player].currentAge || null},
                        number = ${boxscoreData.teams[team].players[player].jerseyNumber || null},
                        position = ${`'${boxscoreData.teams[team].players[player].position.name.replace("'","''")}'` || null},
                        assists = ${boxscoreData.teams[team].players[player].stats.skaterStats?.assists || 0},
                        goals = ${boxscoreData.teams[team].players[player].stats.skaterStats?.goals || 0},
                        hits = ${boxscoreData.teams[team].players[player].stats.skaterStats?.hits || 0},
                        penalty_minutes = ${boxscoreData.teams[team].players[player].stats.skaterStats?.penaltyMinutes || 0}
                        WHERE game_pk = ${gamePK} AND player_id = '${player.replace("'","''")}'`;
                    await pool.query(UPDATE_game_stats).catch((error) => {
                        console.log(error);
                        console.log('Error with query:', UPDATE_game_stats);
                    });
                }
            )});
            // Update game
            await pool.query(`UPDATE games SET
                home_team_id = ${gameData.teams.home.id},
                away_team_id = ${gameData.teams.away.id},
                status = ${gameData.status.statusCode},
                status_name = '${gameData.status.detailedState}'
                WHERE game_pk = ${gamePK}
            `);
        }
        // Remove completed games from queue
        if (isGameComplete(gameData.status.statusCode)) {
            gamesQueue.splice(gamesQueue.indexOf(gamePK), 1);
            if (!completeRecordedGames.includes(gamePK)) {
                completeRecordedGames.push(gamePK);
            }
        }
    }));
}