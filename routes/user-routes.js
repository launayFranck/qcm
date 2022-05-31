import express from 'express';
import { authenticateToken } from '../middleware/authorization.js';

import users from '../models/user.js';

const router = express.Router();

// • Fetching all users
router.get('/', async (req, res) => {
	try {
		const result = await users.findAll();
		res.status(200).json({users : result});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

// • Fetching user by id
router.get('/:id', async (req, res) => {
	try {
		const result = await users.findById(req.params.id);
		res.status(200).json({users : result});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

// • Fetching user by username
router.get('/username/:username', async (req, res) => {
	try {
		const result = await users.findByUsername(req.params.username);
		res.status(200).json({users : result});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

// • Fetching user by email
router.get('/email/:email', async (req, res) => {
	try {
		const result = await users.findByEmail(req.body.email);
		res.status(200).json({users : result});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

// • Creating new user
router.post("/", async (req, res) => {
	try {
		const result = await users.create(req.body);
		res.status(200).json({users : result});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

// • Updating user
router.put('/:id', async (req, res) => {
	try {
		const response = await users.update(req.params.id, req.body);
		res.status(200).json(response);
	} catch (err) {
		res.status(400).json({error : err.message});
	};
});

// • Deleting user
router.delete('/:id', async (req, res) => {
	try {
		const response = await users.destroy(req.params.id);
		res.status(200).json(response);
	} catch (err) {
		res.status(400).json(err.message);
	};
});

export default router;