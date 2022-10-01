import { db } from "../app";
import { Game } from "../types";

export function getGame(req, res) {
    const data: Game[] = [];
    const query =
        `SELECT
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
        if (error && process.env.NODE_ENV !== 'test') {
            console.error('Error executing query:', error);
        }
        res.json(data);
    });
};