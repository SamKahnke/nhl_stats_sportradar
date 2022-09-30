import { db } from "../app";
import { Stat } from "../types";
import { buildParams } from "./utils";

export function getStats(req, res) {
    const data: Stat[] = [];

  	const params: string = buildParams([
		{ column: 'game_pk', value: req.query.gamePK },
		{ column: 'player_id', value: req.query.playerID },
		{ column: 'team_id', value: req.query.teamID }
  	]);

    const query =
        `SELECT
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
};