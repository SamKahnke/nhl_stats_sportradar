import { app, db, supertest, appListener } from '../app';
import { InitializeDBTables } from '../services';

beforeAll(done => {
	done();
});

afterAll(done => {
	db.end();
	appListener.close();
	done();
});

const gameData = {
	gamePK: 1,
	homeTeamID: 1000,
	awayTeamID: 2000,
	status: 6,
	statusName: 'Final'
}

const statData = {
	gamePK: 1,
	playerID: 'ID1',
	teamID: 1000,
	teamName: 'Test Team',
	name: 'Test Player',
	age: 30,
	number: null,
	position: 'Left Wing',
	assists: 2,
	goals: 1,
	hits: 1,
	penaltyMinutes: 0
}

const deleteGameQuery = `DELETE FROM games WHERE game_pk = ${gameData.gamePK}`;
const deleteStatQuery = `DELETE FROM stats WHERE game_pk = ${statData.gamePK}`;

const insertGameQuery = 
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
		${gameData.statusName ? `'${gameData.statusName}'` : null}
	WHERE NOT EXISTS
		(SELECT * FROM games 
		WHERE game_pk = ${gameData.gamePK})`;

const insertStatQuery = 
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
		penalty_minutes)
	SELECT
		${statData.gamePK},
		${statData.playerID ? `'${statData.playerID}'` : null},
		${statData.teamID},
		${statData.teamName ? `'${statData.teamName}'` : null},
		${statData.name ? `'${statData.name}'` : null},
		${statData.age},
		${statData.number},
		${statData.position ? `'${statData.position}'` : null},
		${statData.assists},
		${statData.goals},
		${statData.hits},
		${statData.penaltyMinutes}
	WHERE NOT EXISTS
		(SELECT * FROM stats 
		WHERE game_pk = ${statData.gamePK}
		AND player_id = '${statData.playerID}')`;

		console.log(insertStatQuery);

const initializeTestData = async () => {
	await Promise.all([
		await db.query(deleteGameQuery),
		await db.query(deleteStatQuery),
		await db.query(insertGameQuery),
		await db.query(insertStatQuery)
	]);
}

const clearTestData = async () => {
	await Promise.all([
		await db.query(deleteGameQuery),
		await db.query(deleteStatQuery)
	]);
}

test('Initialize Tables', async () => {
	await InitializeDBTables().then((response) => {
		console.log(response);
		expect(response).toBeTruthy();
	});
});

test('GET /games', async () => {
	await initializeTestData();
	await supertest(app).get(`/games`)
		.expect(200)
		.then((response) => {
			// Check type and length
			expect(Array.isArray(response.body)).toBeTruthy();
			expect(response.body.length).toBeGreaterThanOrEqual(1);

			// Check data
			response.body.map((game) => {
				expect(typeof game.gamePK).toBe('number');
				expect(typeof game.homeTeamID).toBe('number');
				expect(typeof game.awayTeamID).toBe('number');
				expect(typeof game.status).toBe('number');
				expect(typeof game.statusName).toBe('string');
			})
		});
		await clearTestData();
});

test('GET /games?homeTeamID=&awayTeamID=', async () => {
	await initializeTestData();
	await supertest(app).get(`/games?homeTeamID=${gameData.homeTeamID}&awayTeamID=${gameData.awayTeamID}`)
		.expect(200)
		.then((response) => {
			// Check type and length
			expect(Array.isArray(response.body)).toBeTruthy();
			expect(response.body.length).toEqual(1);

			// Check data
			expect(response.body[0].gamePK).toBe(gameData.gamePK);
			expect(response.body[0].homeTeamID).toBe(gameData.homeTeamID);
			expect(response.body[0].awayTeamID).toBe(gameData.awayTeamID);
			expect(response.body[0].status).toBe(gameData.status);
			expect(response.body[0].statusName).toBe(gameData.statusName);
		});
	await clearTestData();
});

test('GET /games/{gamePK}', async () => {
	await initializeTestData();
	await supertest(app).get(`/games/${gameData.gamePK}`)
		.expect(200)
		.then((response) => {
			// Check type and length
			expect(Array.isArray(response.body)).toBeTruthy();
			expect(response.body.length).toEqual(1);

			// Check data
			expect(response.body[0].gamePK).toBe(gameData.gamePK);
			expect(response.body[0].homeTeamID).toBe(gameData.homeTeamID);
			expect(response.body[0].awayTeamID).toBe(gameData.awayTeamID);
			expect(response.body[0].status).toBe(gameData.status);
			expect(response.body[0].statusName).toBe(gameData.statusName);
		});
	await clearTestData();
});

test('GET /stats?gamePK={gamePK}&playerID={playerID}&teamID={teamID}', async () => {
	await initializeTestData();
	await supertest(app).get(`/stats?gamePK=${statData.gamePK}&playerID=${statData.playerID}&teamID=${statData.teamID}`)
		.expect(200)
		.then((response) => {
			// Check type and length
			expect(Array.isArray(response.body)).toBeTruthy();
			expect(response.body.length).toEqual(1);

			// Check data
			expect(response.body[0].gamePK).toBe(statData.gamePK);
			expect(response.body[0].playerID).toBe(statData.playerID);
			expect(response.body[0].teamID).toBe(statData.teamID);
			expect(response.body[0].teamName).toBe(statData.teamName);
			expect(response.body[0].name).toBe(statData.name);
			expect(response.body[0].age).toBe(statData.age);
			expect(response.body[0].number).toBe(statData.number);
			expect(response.body[0].position).toBe(statData.position);
			expect(response.body[0].assists).toBe(statData.assists);
			expect(response.body[0].goals).toBe(statData.goals);
			expect(response.body[0].hits).toBe(statData.hits);
			expect(response.body[0].penaltyMinutes).toBe(statData.penaltyMinutes);
		});
	await clearTestData();
});