import express from 'express';
import { authenticateToken } from '../middleware/authorization.js';

import jwt from 'jsonwebtoken';

import chapter from '../models/chapter.js';

const router = express.Router();

// • Fetching all chapters
router.get('/', async (req, res) => {
	try {
		const authorization = req.headers['authorization'].split(' ')[1];
		jwt.verify(authorization, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
			if (err) throw err;
			try {
				const result = await chapter.findAll();
				res.status(200).json({chapters : result});
			} catch (err) {
				res.status(400).json({error : err.message});
			};
		});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

// • Fetching chapters by examination id
router.get('/examination/:id', async (req, res) => {
	try {
		const authorization = req.headers['authorization'].split(' ')[1];
		jwt.verify(authorization, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
			if (err) throw err;
			try {
				const result = await chapter.findByExaminationId(req.params.id);
				res.status(200).json({chapters : result});
			} catch (err) {
				res.status(400).json({error : err.message});
			};
		});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

// • Fetching chapter by id
router.get('/:id', async (req, res) => {
	try {
		const authorization = req.headers['authorization'].split(' ')[1];
		jwt.verify(authorization, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
			if (err) throw err;
			try {
				const result = await chapter.findById(req.params.id);
				res.status(200).json({chapter : result});
			} catch (err) {
				res.status(400).json({error : err.message});
			};
		});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

// • Creating new chapter
router.post("/", async (req, res) => {
	// console.log(req.body);
	try {
		const authorization = req.headers['authorization'].split(' ')[1];
		jwt.verify(authorization, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
			if (err) throw err;
			try {
				const result = await chapter.create(req.body, user);
				res.status(200).json({chapter : result});
			} catch (err) {
				res.status(400).json({error : err.message});
			};
		});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

// • Updating chapter
router.put('/:id', async (req, res) => {
	try {
		const authorization = req.headers['authorization'].split(' ')[1];
		jwt.verify(authorization, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
			if (err) throw err;
			try {
				const response = await chapter.update(req.params.id, req.body);
				res.status(200).json({chapter : response});
			} catch (err) {
				res.status(400).json({error : err.message});
			};
		});
	} catch (err) {
		res.status(400).json({error : err.message});
	};
});

// • Deleting a chapter
router.delete('/:id', async (req, res) => {
	try {
		const authorization = req.headers['authorization'].split(' ')[1];
		jwt.verify(authorization, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
			if (err) throw err;
			try {
				const response = await chapter.destroy(req.params.id, user);
				res.status(200).json({chapter : response});
			} catch (err) {
				res.status(400).json({error : err.message});
			};
		});
	} catch (err) {
		res.status(400).json({error: err.message});
	};
});

export default router;