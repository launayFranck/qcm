import express from 'express';
import knex from '../models/knexClient.js';
import bcrypt from 'bcrypt';
import { authenticateToken } from '../middleware/authorization.js';

import users from '../models/user.js';

const router = express.Router();

// • Fetching all users
router.get('/', async (req, res) => {
	console.log(req.headers);
	try {
		const result = await users.findAll();
		res.status(200).json({users : result});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

router.get('/:id', async (req, res) => {
	console.log(req.params.id);
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

router.get('/email/:email', async (req, res) => {
	console.log(req.body.email);
	try {
		const result = await users.findByEmail(req.params.username);
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

// • Creating new user
router.post("/", async (req, res) => {
	try {
		const payload = {
			username : req.body.username,
			firstname : req.body.firstname,
			lastname : req.body.lastname,
			email : req.body.email,
			phone : req.body.phone,
			password : await bcrypt.hash(req.body.password, 10),
			role : req.body.role || 4
		};

		const result = await users.create(payload);
		res.status(200).json({users : newUser});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

export default router;
