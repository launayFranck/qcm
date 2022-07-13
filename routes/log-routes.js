import express from 'express';
import { authenticateToken } from '../middleware/authorization.js';

import jwt from 'jsonwebtoken';

import log from '../models/log.js';

const router = express.Router();

// • Fetching all logs
router.get('/', async (req, res) => {
	try {
		const result = await log.findAll();
		res.status(200).json({logs : result});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

// • Creating new log
router.post("/", async (req, res) => {
	try {
		const {access_token : accessToken} = req.cookies;
		jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
			if (err) throw err;

			const response = await log.create(content, user);
			res.status(201).json(response);
		});
	} catch (err) {
		res.status(400).json({ error: err.message });
	};
});

// • Deleting a log
router.delete('/:id', async (req, res) => {
	try {
		const response = await log.destroy(req.params.id);
		res.status(200).json(response);
	} catch (err) {
		res.status(400).json({error : err.message});
	};
});

export default router;
