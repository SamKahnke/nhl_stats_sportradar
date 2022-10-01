import { db } from "../app";
import { Game } from "../types";
import { buildParams } from "./utils";

export function getGames(req, res) {
    const data: Game[] = [];
  
    const params: string = buildParams([
        { column: 'home_team_id', value: req.query.homeTeamID },
        { column: 'away_team_id', value: req.query.awayTeamID }
    ]);

    const query =
        `SELECT
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
        if (error && process.env.NODE_ENV !== 'test') {
            console.error('Error executing query:', error);
        }
        res.json(data);
    });
}