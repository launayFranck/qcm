import express from 'express';
import { authenticateToken } from '../middleware/authorization.js';

import jwt from 'jsonwebtoken';

import examination from '../models/examination.js';

const router = express.Router();

// • Fetching all examination
router.get('/', async (req, res) => {
	try {
		const result = await examination.findAll();
		res.status(200).json({examinations : result});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

// • Fetching examination by id
router.get('/:id', async (req, res) => {
	try {
		const result = await examination.findById(req.params.id);
		res.status(200).json({examination : result});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

// • Creating new examination
router.post("/", async (req, res) => {
	try {
		const result = await examination.create(req.body);
		res.status(200).json({examination : result});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

// • Updating examination
router.put('/:id', async (req, res) => {
	console.log(req.params.id)
	try {
		const response = await examination.update(req.params.id, req.body);
		res.status(200).json(response);
	} catch (err) {
		res.status(400).json({error : err.message});
	};
});

// • Deleting an examination
router.delete('/:id', async (req, res) => {
	try {
		const { access_token : accessToken } = req.cookies;
		jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
			if (err) throw err;

			const response = await examination.destroy(req.params.id, user);
			res.status(200).json(response);
		});
	} catch (err) {
		res.status(400).json({error: err.message});
	};
});

export default router;