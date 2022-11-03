import express from 'express';
import { Pool } from 'pg';
import * as api from './api';
import * as services from './services';

export const app = express();
export const supertest = require("supertest");

const config = require('config');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Database
export const db = new Pool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	database: process.env.DB_NAME,
	password: process.env.DB_PASSWORD,
	port: parseInt(process.env.DB_PORT)
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
export const appListener = app.listen(process.env.PORT, () => {
	return console.log(`Express is listening at http://localhost:${process.env.PORT}`);
});

// Initialize tables if none exist
if (process.env.NODE_ENV !== 'test') {
	services.InitializeDBTables().then(() => {
			// Open the pipeline
			services.RunPipeline();
	});
}

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





