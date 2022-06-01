import express from 'express';
import { authenticateToken } from '../middleware/authorization.js';

import chapter from '../models/chapter.js';

const router = express.Router();

// • Fetching all chapters
router.get('/', async (req, res) => {
	try {
		const result = await chapter.findAll();
		res.status(200).json({chapters : result});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

// • Fetching a chapter by its id
router.get('/:id', async (req, res) => {
	try {
		const result = await chapter.findById(req.params.id);
		res.status(200).json({chapter : result});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

// • Fetching a chapter by its name
router.get('/name/:name', async (req, res) => {
	try {
		const result = await chapter.findByName(req.params.name);
		res.status(200).json({chapter : result});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

// • Creating new chapter
router.post("/", async (req, res) => {
    try {
        const response = await chapter.create(req.body);
        res.status(201).json(response);
    } catch (err) {
        res.status(400).send(err.message);
    };
});

// • Updating a user
router.put('/:id', async (req, res) => {
	try {
		const response = await chapter.update(req.params.id, req.body);
		res.status(200).json(response);
	} catch (err) {
		res.status(400).json({error : err.message});
	};
});

// • Deleting a chapter
router.delete('/:id', async (req, res) => {
	try {
		const response = await chapter.destroy(req.params.id);
		res.status(200).json(response);
	} catch (err) {
		res.status(400).json(err.message);
	};
});


export default router;
