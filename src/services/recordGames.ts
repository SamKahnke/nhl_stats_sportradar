import axios from 'axios';
import { db } from '../app';
import { isGameComplete } from './utils';
import { Game, Stat } from '../types';
const config = require('config');

export async function RecordGames(gamesQueue: string[], completeRecordedGames: string[]): Promise<void> {
    Promise.all(gamesQueue.map(async (gamePK) => {
        const game = await db.query(`SELECT * FROM games WHERE game_pk = ${gamePK}`);
        const stats = await axios.get(`${config.get('liveData.rootURL')}/game/${gamePK}/feed/live/diffPatch?startTimecode=${config.get('liveData.startOfSeason')}`);
        const rawGameData = stats.data.gameData;
        const rawBoxscoreData = stats.data.liveData.boxscore;
        const gameData: Game = {
            gamePK: gamePK,
            homeTeamID: rawGameData.teams.home.id,
            awayTeamID: rawGameData.teams.away.id,
            status: rawGameData.status.statusCode,
            statusName: `'${rawGameData.status.detailedState}'`
        }

        if (game.rows.length === 0) {
            // Insert game
            await db.query(
                `INSERT INTO games (
                    game_pk,
                    home_team_id,
                    away_team_id,
                    status,
                    status_name
                ) SELECT
                    ${gameData.gamePK},
                    ${gameData.homeTeamID},
                    ${gameData.awayTeamID},
                    ${gameData.status},
                    ${gameData.statusName}
                WHERE NOT EXISTS
                    (SELECT * FROM games 
                    WHERE game_pk = ${gamePK})`
            );
            // Insert stats for each player
            Object.keys(rawBoxscoreData.teams).map((team, index) => {
                return Object.keys(rawBoxscoreData.teams[team].players).map(async (player, index) => {
                    const statData: Stat = {
                        gamePK: gamePK,
                        playerID: `'${player.replace("'","''")}'`,
                        teamID: rawBoxscoreData.teams[team].team.id,
                        teamName: `'${rawBoxscoreData.teams[team].team.name?.replace("'","''")}'` || null,
                        name: `'${rawBoxscoreData.teams[team].players[player].person.fullName?.replace("'","''")}'` || null,
                        age: rawGameData.players[player].currentAge || null,
                        number: rawBoxscoreData.teams[team].players[player].jerseyNumber || null,
                        position: `'${rawBoxscoreData.teams[team].players[player].position.name?.replace("'","''")}'` || null,
                        assists: rawBoxscoreData.teams[team].players[player].stats.skaterStats?.assists || 0,
                        goals: rawBoxscoreData.teams[team].players[player].stats.skaterStats?.goals || 0,
                        hits: rawBoxscoreData.teams[team].players[player].stats.skaterStats?.hits || 0,
                        penaltyMinutes: rawBoxscoreData.teams[team].players[player].stats.skaterStats?.penaltyMinutes || 0
                    }
                    
                    const INSERT_stats =
                        `INSERT INTO stats (
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
                            penalty_minutes) SELECT
                                ${statData.gamePK},
                                ${statData.playerID},
                                ${statData.teamID},
                                ${statData.teamName},
                                ${statData.name},
                                ${statData.age},
                                ${statData.number},
                                ${statData.position},
                                ${statData.assists},
                                ${statData.goals},
                                ${statData.hits},
                                ${statData.penaltyMinutes}
                        WHERE NOT EXISTS
                            (SELECT * FROM stats 
                            WHERE game_pk = ${statData.gamePK}
                            AND player_id = ${statData.playerID})`;

                    await db.query(INSERT_stats).catch((error) => {
                        if (process.env.NODE_ENV !== 'test') {
                            console.error('Error in INSERT_stats:', error);
                            console.error('Query:', INSERT_stats);
                        }
                    });
                });
            });
            // Remove completed games from queue
            if (isGameComplete(rawGameData.status.statusCode)) {
                gamesQueue.splice(gamesQueue.indexOf(gamePK), 1);
            }
        } else {
            // Update stats for each player
            Object.keys(rawBoxscoreData.teams).map((team, index) => {
                return Object.keys(rawBoxscoreData.teams[team].players).map(async (player, index) => {
                    const statData: Stat = {
                        gamePK: gamePK,
                        playerID: `'${player.replace("'","''")}'`,
                        teamID: rawBoxscoreData.teams[team].team.id,
                        teamName: `'${rawBoxscoreData.teams[team].team.name?.replace("'","''")}'` || null,
                        name: `'${rawBoxscoreData.teams[team].players[player].person.fullName?.replace("'","''")}'` || null,
                        age: rawGameData.players[player].currentAge || null,
                        number: rawBoxscoreData.teams[team].players[player].jerseyNumber || null,
                        position: `'${rawBoxscoreData.teams[team].players[player].position.name?.replace("'","''")}'` || null,
                        assists: rawBoxscoreData.teams[team].players[player].stats.skaterStats?.assists || 0,
                        goals: rawBoxscoreData.teams[team].players[player].stats.skaterStats?.goals || 0,
                        hits: rawBoxscoreData.teams[team].players[player].stats.skaterStats?.hits || 0,
                        penaltyMinutes: rawBoxscoreData.teams[team].players[player].stats.skaterStats?.penaltyMinutes || 0
                    }

                    const UPDATE_stats =
                        `UPDATE stats SET
                            player_id = ${statData.playerID},
                            team_id = ${statData.teamID},
                            team_name = ${statData.teamName},
                            name = ${statData.name},
                            age = ${statData.age},
                            number = ${statData.number},
                            position = ${statData.position},
                            assists = ${statData.assists},
                            goals = ${statData.goals},
                            hits = ${statData.hits},
                            penalty_minutes = ${statData.penaltyMinutes}
                            WHERE game_pk = ${parseInt(statData.gamePK)} AND player_id = ${statData.playerID}`;

                    await db.query(UPDATE_stats).catch((error) => {
                        if (process.env.NODE_ENV !== 'test') {
                            console.error('Error in UPDATE_stats:', error);
                            console.error('Query:', UPDATE_stats);
                        }
                    });
                }
            )});
            // Update game
            await db.query(
                `UPDATE games SET
                    home_team_id = ${gameData.homeTeamID},
                    away_team_id = ${gameData.awayTeamID},
                    status = ${gameData.status},
                    status_name = ${gameData.statusName}
                    WHERE game_pk = ${gameData.gamePK}`
            );
        }
        // Remove completed games from queue
        if (isGameComplete(rawGameData.status.statusCode)) {
            gamesQueue.splice(gamesQueue.indexOf(gamePK), 1);
            if (!completeRecordedGames.includes(gamePK)) {
                completeRecordedGames.push(gamePK);
            }
        }
    }));
}