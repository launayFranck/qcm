import express from 'express';
import { authenticateToken } from '../middleware/authorization.js';

import jwt from 'jsonwebtoken';

import examination from '../models/examination.js';

const router = express.Router();

// • Fetching all examinations
router.get('/', async (req, res) => {
	try {
		const authorization = req.headers['authorization'].split(' ')[1];
		jwt.verify(authorization, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
			if (err) throw err;
			try {
				const result = await examination.findAll();
				res.status(200).json({examinations : result});
			} catch (err) {
				res.status(400).json({error : err.message});
			};
		});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

// • Fetching examination by id
router.get('/:id', async (req, res) => {
	try {
		const authorization = req.headers['authorization'].split(' ')[1];
		jwt.verify(authorization, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
			if (err) throw err;
			try {
				const result = await examination.findById(req.params.id);
				res.status(200).json({examination : result});
			} catch (err) {
				res.status(400).json({error : err.message});
			};
		});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

// • Creating new examination
router.post("/", async (req, res) => {
	try {
		const authorization = req.headers['authorization'].split(' ')[1];
		jwt.verify(authorization, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
			if (err) throw err;
			try {
				const result = await examination.create(req.body, user);
				res.status(200).json({examination : result});
			} catch (err) {
				res.status(400).json({error : err.message});
			};
		});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

// • Updating examination
router.put('/:id', async (req, res) => {
	try {
		const authorization = req.headers['authorization'].split(' ')[1];
		jwt.verify(authorization, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
			if (err) throw err;
			try {
				const response = await examination.update(req.params.id, req.body);
				res.status(200).json({examination : response});
			} catch (err) {
				res.status(400).json({error : err.message});
			};
		});
	} catch (err) {
		res.status(400).json({error : err.message});
	};
});

// • Deleting an examination
router.delete('/:id', async (req, res) => {
	try {
		const authorization = req.headers['authorization'].split(' ')[1];
		jwt.verify(authorization, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
			if (err) throw err;
			try {
				const response = await examination.destroy(req.params.id, user);
				res.status(200).json(response);
			} catch (err) {
				res.status(400).json({error : err.message});
			};
		});
	} catch (err) {
		res.status(400).json({error: err.message});
	};
});

export default router;