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

router.get('/email/:email', async (req, res) => {
	console.log(req.body.email);
	try {
		const result = await users.findByEmail(req.params.username);
		res.status(200).json({users : result});
	} catch (err) {
		res.status(500).json({error : err.message});
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
