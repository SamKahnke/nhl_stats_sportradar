import axios from "axios";
import { pool, root } from "../app";
import { isGameComplete } from "../utils/utils";

export async function recordGames(gamesQueue, completeRecordedGames) {
    Promise.all(gamesQueue.map(async (gamePK) => {
        const game = await pool.query(`SELECT * FROM games WHERE game_pk = ${gamePK}`);
        const stats = await axios.get(`${root}/game/${gamePK}/feed/live/diffPatch?startTimecode=20220101_000000`);

        if (game.rows.length === 0) {
            // insert game
            await pool.query(`INSERT INTO games (
                    game_pk,
                    home_team_id,
                    away_team_id,
                    status,
                    status_name
                ) VALUES (
                    ${gamePK},
                    ${stats.data.gameData.teams.home.id},
                    ${stats.data.gameData.teams.away.id},
                    ${stats.data.gameData.status.statusCode},
                    '${stats.data.gameData.status.detailedState}'
                )
            `);
            // insert game_stats for each player
            Object.keys(stats.data.liveData.boxscore.teams).map((team, index) => {
                return Object.keys(stats.data.liveData.boxscore.teams[team].players).map(async (player, index) => {
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
                            ${stats.data.liveData.boxscore.teams[team].team.id},
                            ${`'${stats.data.liveData.boxscore.teams[team].team.name.replace("'","''")}'` || null},
                            ${`'${stats.data.liveData.boxscore.teams[team].players[player].person.fullName.replace("'","''")}'` || null},
                            ${stats.data.gameData.players[player].currentAge || null},
                            ${stats.data.liveData.boxscore.teams[team].players[player].jerseyNumber || null},
                            ${`'${stats.data.liveData.boxscore.teams[team].players[player].position.name.replace("'","''")}'` || null},
                            ${stats.data.liveData.boxscore.teams[team].players[player].stats.skaterStats?.assists || 0},
                            ${stats.data.liveData.boxscore.teams[team].players[player].stats.skaterStats?.goals || 0},
                            ${stats.data.liveData.boxscore.teams[team].players[player].stats.skaterStats?.hits || 0},
                            ${stats.data.liveData.boxscore.teams[team].players[player].stats.skaterStats?.penaltyMinutes || 0}
                    )`;
                    await pool.query(INSERT_game_stats).catch((error) => {
                        console.log(error);
                        console.log('Error with query:', INSERT_game_stats);
                    });
                });
            });
            // remove completed games from queue
            if (isGameComplete(stats.data.gameData.status.statusCode)) {
                gamesQueue.splice(gamesQueue.indexOf(gamePK), 1);
            }
        } else {
            // update game_stats for each player
            Object.keys(stats.data.liveData.boxscore.teams).map((team, index) => {
                return Object.keys(stats.data.liveData.boxscore.teams[team].players).map(async (player, index) => {
                    const UPDATE_game_stats = `UPDATE game_stats SET
                        player_id = '${player.replace("'","''")}',
                        team_id = ${stats.data.liveData.boxscore.teams[team].team.id},
                        team_name = ${`'${stats.data.liveData.boxscore.teams[team].team.name.replace("'","''")}'` || null},
                        name = ${`'${stats.data.liveData.boxscore.teams[team].players[player].person.fullName.replace("'","''")}'` || null},
                        age = ${stats.data.gameData.players[player].currentAge || null},
                        number = ${stats.data.liveData.boxscore.teams[team].players[player].jerseyNumber || null},
                        position = ${`'${stats.data.liveData.boxscore.teams[team].players[player].position.name.replace("'","''")}'` || null},
                        assists = ${stats.data.liveData.boxscore.teams[team].players[player].stats.skaterStats?.assists || 0},
                        goals = ${stats.data.liveData.boxscore.teams[team].players[player].stats.skaterStats?.goals || 0},
                        hits = ${stats.data.liveData.boxscore.teams[team].players[player].stats.skaterStats?.hits || 0},
                        penalty_minutes = ${stats.data.liveData.boxscore.teams[team].players[player].stats.skaterStats?.penaltyMinutes || 0}
                        WHERE game_pk = ${gamePK} AND player_id = '${player.replace("'","''")}'`;
                    await pool.query(UPDATE_game_stats).catch((error) => {
                        console.log(error);
                        console.log('Error with query:', UPDATE_game_stats);
                    });
                }
            )});
            // update game
            await pool.query(`UPDATE games SET
                        home_team_id = ${stats.data.gameData.teams.home.id},
                        away_team_id = ${stats.data.gameData.teams.away.id},
                        status = ${stats.data.gameData.status.statusCode},
                        status_name = '${stats.data.gameData.status.detailedState}'
                        WHERE game_pk = ${gamePK}
                `);
            }
            // remove completed games from queue
            if (isGameComplete(stats.data.gameData.status.statusCode)) {
                gamesQueue.splice(gamesQueue.indexOf(gamePK), 1);
                if (!completeRecordedGames.includes(gamePK)) {
                    completeRecordedGames.push(gamePK);
                }
            }
    }));
}