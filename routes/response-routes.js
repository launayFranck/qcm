import express from 'express';
import { authenticateToken } from '../middleware/authorization.js';

import jwt from 'jsonwebtoken';

import response from '../models/response.js';

const router = express.Router();

// • Fetching all responses
router.get('/', async (req, res) => {
	try {
		const authorization = req.headers['authorization'].split(' ')[1];
		jwt.verify(authorization, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
			if (err) throw err;
			try {
				const result = await response.findAll();
				res.status(200).json({responses : result});
			} catch (err) {
				res.status(400).json({error : err.message});
			};
		});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

// • Fetching a response by its id
router.get('/:id', async (req, res) => {
	try {
		const authorization = req.headers['authorization'].split(' ')[1];
		jwt.verify(authorization, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
			if (err) throw err;
			try {
				const result = await response.findById(req.params.id);
				res.status(200).json({response : result});
			} catch (err) {
				res.status(400).json({error : err.message});
			};
		});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

// • Fetching responses by a question id
router.get('/question/:id', async (req, res) => {
	try {
		const authorization = req.headers['authorization'].split(' ')[1];
		jwt.verify(authorization, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
			if (err) throw err;
			try {
				const result = await response.findByQuestionId(req.params.id);
				res.status(200).json({responses : result});
			} catch (err) {
				res.status(400).json({error : err.message});
			};
		});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

// • Creating new response
router.post("/", async (req, res) => {
	try {
		const authorization = req.headers['authorization'].split(' ')[1];
		jwt.verify(authorization, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
			if (err) throw err;
			try {
				const result = await response.create(req.body);
				res.status(201).json({response : result});
			} catch (err) {
				res.status(400).json({error : err.message});
			};
		});
	} catch (err) {
		res.status(400).send({error : err.message});
	};
});

// • Updating a user
router.put('/:id', async (req, res) => {
	try {
		const authorization = req.headers['authorization'].split(' ')[1];
		jwt.verify(authorization, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
			if (err) throw err;
			try {
				const result = await response.update(req.params.id, req.body);
				res.status(200).json({response : result});
			} catch (err) {
				res.status(400).json({error : err.message});
			};
		});
	} catch (err) {
		res.status(400).json({error : err.message});
	};
});

// • Deleting a response
router.delete('/:id', async (req, res) => {
	try {
		const authorization = req.headers['authorization'].split(' ')[1];
		jwt.verify(authorization, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
			if (err) throw err;
			try {
				const result = await response.destroy(req.params.id);
				res.status(200).json({response : result});
			} catch (err) {
				res.status(400).json({error : err.message});
			};
		});
	} catch (err) {
		res.status(400).json({error : err.message});
	};
});

export default router;