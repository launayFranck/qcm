import express from 'express';
import knex from '../models/knexClient.js';
import bcrypt from 'bcrypt';
import { authenticateToken } from '../middleware/authorization.js';

import theme from '../models/theme.js';

const router = express.Router();

// • Fetching all themes
router.get('/', async (req, res) => {
	try {
		const result = await theme.findAll();
		res.status(200).json({themes : result});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

// • Fetching a theme by its id
router.get('/:id', async (req, res) => {
	try {
		const result = await theme.findById(req.params.id);
		res.status(200).json({theme : result});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

// • Fetching a theme by its id with its owner
router.get('/owner/:id', async (req, res) => {
	try {
		const result = await theme.findByIdWithOwner(req.params.id);
		res.status(200).json({theme : result});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

// • Fetching a theme by its name
router.get('/name/:name', async (req, res) => {
	try {
		const result = await theme.findByName(req.params.name);
		res.status(200).json({theme : result});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

// • Creating new theme
router.post("/", async (req, res) => {
    try {
        const response = await theme.create(req.body);
        res.status(201).json(response);
    } catch (err) {
        res.status(400).send(err.message);
    };
});

// • Updating a user
router.put('/:id', async (req, res) => {
	try {
		const response = await theme.update(req.params.id, req.body);
		res.status(200).json(response);
	} catch (err) {
		res.status(400).json({error : err.message});
	};
});

// • Deleting a theme
router.delete('/:id', async (req, res) => {
	try {
		const response = await theme.destroy(req.params.id);
		res.status(200).json(response);
	} catch (err) {
		res.status(400).json(err.message);
	};
});


export default router;
