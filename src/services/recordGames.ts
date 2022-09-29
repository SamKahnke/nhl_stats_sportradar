import axios from 'axios';
import { db } from '../app';
import { isGameComplete } from '../utils/utils';
import { Game, GameStat } from './types';
const config = require('config');

export async function RecordGames(gamesQueue: string[], completeRecordedGames: string[]): Promise<void> {
    console.log('RecordGames');
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
                ) VALUES (
                    ${gameData.gamePK},
                    ${gameData.homeTeamID},
                    ${gameData.awayTeamID},
                    ${gameData.status},
                    ${gameData.statusName}
                )`
            );
            // Insert game_stats for each player
            Object.keys(rawBoxscoreData.teams).map((team, index) => {
                return Object.keys(rawBoxscoreData.teams[team].players).map(async (player, index) => {
                    const gameStatData: GameStat = {
                        gamePK: gamePK,
                        playerID: `'${player.replace("'","''")}'`,
                        teamID: rawBoxscoreData.teams[team].team.id,
                        teamName: `'${rawBoxscoreData.teams[team].team.name.replace("'","''")}'` || null,
                        name: `'${rawBoxscoreData.teams[team].players[player].person.fullName.replace("'","''")}'` || null,
                        age: rawGameData.players[player].currentAge || null,
                        number: rawBoxscoreData.teams[team].players[player].jerseyNumber || null,
                        position: `'${rawBoxscoreData.teams[team].players[player].position.name.replace("'","''")}'` || null,
                        assists: rawBoxscoreData.teams[team].players[player].stats.skaterStats?.assists || 0,
                        goals: rawBoxscoreData.teams[team].players[player].stats.skaterStats?.goals || 0,
                        hits: rawBoxscoreData.teams[team].players[player].stats.skaterStats?.hits || 0,
                        penaltyMinutes: rawBoxscoreData.teams[team].players[player].stats.skaterStats?.penaltyMinutes || 0
                    }
                    
                    const INSERT_game_stats =
                        `INSERT INTO game_stats (
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
                                ${gameStatData.gamePK},
                                ${gameStatData.playerID},
                                ${gameStatData.teamID},
                                ${gameStatData.teamName},
                                ${gameStatData.name},
                                ${gameStatData.age},
                                ${gameStatData.number},
                                ${gameStatData.position},
                                ${gameStatData.assists},
                                ${gameStatData.goals},
                                ${gameStatData.hits},
                                ${gameStatData.penaltyMinutes}
                            )`;

                    await db.query(INSERT_game_stats).catch((error) => {
                        console.log('Error in INSERT_game_stats:', error);
                        console.log('Query:', INSERT_game_stats);
                    });
                });
            });
            // Remove completed games from queue
            if (isGameComplete(rawGameData.status.statusCode)) {
                gamesQueue.splice(gamesQueue.indexOf(gamePK), 1);
            }
        } else {
            // Update game_stats for each player
            Object.keys(rawBoxscoreData.teams).map((team, index) => {
                return Object.keys(rawBoxscoreData.teams[team].players).map(async (player, index) => {
                    const gameStatData: GameStat = {
                        gamePK: gamePK,
                        playerID: `'${player.replace("'","''")}'`,
                        teamID: rawBoxscoreData.teams[team].team.id,
                        teamName: `'${rawBoxscoreData.teams[team].team.name.replace("'","''")}'` || null,
                        name: `'${rawBoxscoreData.teams[team].players[player].person.fullName.replace("'","''")}'` || null,
                        age: rawGameData.players[player].currentAge || null,
                        number: rawBoxscoreData.teams[team].players[player].jerseyNumber || null,
                        position: `'${rawBoxscoreData.teams[team].players[player].position.name.replace("'","''")}'` || null,
                        assists: rawBoxscoreData.teams[team].players[player].stats.skaterStats?.assists || 0,
                        goals: rawBoxscoreData.teams[team].players[player].stats.skaterStats?.goals || 0,
                        hits: rawBoxscoreData.teams[team].players[player].stats.skaterStats?.hits || 0,
                        penaltyMinutes: rawBoxscoreData.teams[team].players[player].stats.skaterStats?.penaltyMinutes || 0
                    }

                    const UPDATE_game_stats =
                        `UPDATE game_stats SET
                            player_id = ${gameStatData.playerID},
                            team_id = ${gameStatData.teamID},
                            team_name = ${gameStatData.teamName},
                            name = ${gameStatData.name},
                            age = ${gameStatData.age},
                            number = ${gameStatData.number},
                            position = ${gameStatData.position},
                            assists = ${gameStatData.assists},
                            goals = ${gameStatData.goals},
                            hits = ${gameStatData.hits},
                            penalty_minutes = ${gameStatData.penaltyMinutes}
                            WHERE game_pk = ${gameStatData.gamePK} AND player_id = ${gameStatData.playerID}`;

                    await db.query(UPDATE_game_stats).catch((error) => {
                        console.log('Error in UPDATE_game_stats:', error);
                        console.log('Query:', UPDATE_game_stats);
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