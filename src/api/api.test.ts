// const supertest = require("supertest");
import { app, db, supertest, appListener } from '../app';

// Open and close connection for test
beforeAll(done => {
  done();
});

afterAll(done => {
  db.end();
  appListener.close();
  done();
});

test("GET /game?homeTeamID=&awayTeamID=", async () => {
	const gamePK = 1;
	const homeTeamID = 1000;
	const awayTeamID = 2000;
	const status = 6;
	const statusName = 'Final';

	const deleteQuery = `DELETE FROM games WHERE game_pk = ${gamePK}`;
	const insertQuery = 
		`INSERT INTO games (
			game_pk,
			home_team_id,
			away_team_id,
			status,
			status_name
		) VALUES (
			${gamePK},
			${homeTeamID},
			${awayTeamID},
			${status},
			'${statusName}'
		)`;

	await db.query(deleteQuery);
	await db.query(insertQuery);

	await supertest(app).get(`/games?homeTeamID=${homeTeamID}&awayTeamID=${awayTeamID}`)
		.expect(200)
		.then((response) => {
			// Check type and length
			expect(Array.isArray(response.body)).toBeTruthy();
			expect(response.body.length).toEqual(1);

			// Check data
			expect(response.body[0].gamePK).toBe(gamePK);
			expect(response.body[0].homeTeamID).toBe(homeTeamID);
			expect(response.body[0].awayTeamID).toBe(awayTeamID);
			expect(response.body[0].status).toBe(status);
			expect(response.body[0].statusName).toBe(statusName);
		});

	await supertest(app).get(`/games/${gamePK}`)
		.expect(200)
		.then((response) => {
			// Check type and length
			expect(Array.isArray(response.body)).toBeTruthy();
			expect(response.body.length).toEqual(1);

			// Check data
			expect(response.body[0].gamePK).toBe(gamePK);
			expect(response.body[0].homeTeamID).toBe(homeTeamID);
			expect(response.body[0].awayTeamID).toBe(awayTeamID);
			expect(response.body[0].status).toBe(status);
			expect(response.body[0].statusName).toBe(statusName);
		});

	await db.query(deleteQuery);
});