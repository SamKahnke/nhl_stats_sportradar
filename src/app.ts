import express from 'express';
import { Pool } from 'pg';
import * as api from './api';
import * as services from './services';

export const app = express();
const config = require('config');
export const supertest = require("supertest");
const port = config.get('host.port');

// Database
export const db = new Pool({
	host: config.get('database.host'),
	user: config.get('database.user'),
	database: config.get('database.database'),
	password: config.get('database.password'),
	port: config.get('database.port')
});

const connectToDB = async () => {
	try {
		if (process.env.NODE_ENV !== 'test') {
			await db.connect();
		}
	} catch (error) {
		console.error('Error connecting to database:', error);
	}
};

connectToDB();

// Listen on port
export const appListener = app.listen(port, () => {
	// if (process.env.NODE_ENV !== 'test') {
		return console.log(`Express is listening at http://localhost:${port}`);
	// }
});

// Initialize tables if none exist
services.InitializeDBTables().then(() => {
	if (process.env.NODE_ENV !== 'test') {
		// Open the pipeline
		services.RunPipeline();
	}
});

// API Endpoints
app.get(['/', '/readme'], (req, res) => {
  	res.redirect(config.get('readme'));
});

app.get('/games', (req, res) => {
	api.getGames(req, res);
});

app.get('/games/:gamePK', (req, res) => {
	api.getGame(req, res);
});

app.get('/stats', (req, res) => {
  	api.getStats(req, res);
});

app.get('*', function (req, res) {
  	res.send(`Invalid url. Please see documentation <a target="_blank" href="${config.get('readme')}">here</a>.`);
})





