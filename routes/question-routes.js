import express from 'express';
import { authenticateToken } from '../middleware/authorization.js';

import jwt from 'jsonwebtoken';

import question from '../models/question.js';

const router = express.Router();

// • Fetching all questions
router.get('/', async (req, res) => {
	try {
		const authorization = req.headers['authorization'].split(' ')[1];
		jwt.verify(authorization, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
			if (err) throw err;
			try {
				const result = await question.findAll();
				res.status(200).json({questions : result});
			} catch (err) {
				res.status(400).json({error : err.message});
			};
		});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

// • Fetching a question by its id
router.get('/:id', async (req, res) => {
	try {
		const authorization = req.headers['authorization'].split(' ')[1];
		jwt.verify(authorization, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
			if (err) throw err;
			try {
				const result = await question.findById(req.params.id);
				res.status(200).json({question : result});
			} catch (err) {
				res.status(400).json({error : err.message});
			};
		});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

// • Fetching a question by its chapter id
router.get('/chapter/:id', async (req, res) => {
	try {
		const authorization = req.headers['authorization'].split(' ')[1];
		jwt.verify(authorization, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
			if (err) throw err;
			try {
				const result = await question.findByChapterId(req.params.id);
				res.status(200).json({questions : result});
			} catch (err) {
				res.status(400).json({error : err.message});
			};
		});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

// • Fetching a question by its theme id
router.get('/theme/:id', async (req, res) => {
	try {
		const authorization = req.headers['authorization'].split(' ')[1];
		jwt.verify(authorization, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
			if (err) throw err;
			try {
				console.log(req.params.id);
				const result = await question.findByChapterId(req.params.id);
				res.status(200).json({questions : result});
			} catch (err) {
				res.status(400).json({error : err.message});
			};
		});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

// • Creating new question
router.post("/", async (req, res) => {
	try {
		const authorization = req.headers['authorization'].split(' ')[1];
		jwt.verify(authorization, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
			if (err) throw err;
			try {
				const response = await question.create(req.body, user);
				res.status(201).json(response);
			} catch (err) {
				res.status(400).json({error : err.message});
			};
		});
	} catch (err) {
		res.status(400).send({error : err.message});
	};
});

// • Updating a question
router.put('/:id', async (req, res) => {
	try {
		const authorization = req.headers['authorization'].split(' ')[1];
		jwt.verify(authorization, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
			if (err) throw err;
			try {
				const response = await question.update(req.params.id, req.body, user);
				res.status(200).json(response);
			} catch (err) {
				res.status(400).json({error : err.message});
			};
		});
	} catch (err) {
		res.status(400).json({error : err.message});
	};
});

// • Deleting a question
router.delete('/:id', async (req, res) => {
	try {
		const authorization = req.headers['authorization'].split(' ')[1];
		jwt.verify(authorization, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
			if (err) throw err;
			try {
				const response = await question.destroy(req.params.id);
				res.status(200).json(response);
			} catch (err) {
				res.status(400).json({error : err.message});
			};
		});
	} catch (err) {
		res.status(400).json({error : err.message});
	};
});

export default router;