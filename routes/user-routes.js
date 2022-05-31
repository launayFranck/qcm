import express from 'express';
import knex from '../models/knexClient.js';
import bcrypt from 'bcrypt';
import { authenticateToken } from '../middleware/authorization.js';

const router = express.Router();

import users from '../models/user.js';

// • Fetching user by unsername
router.get('/username/:username', async (req, res) => {
	try {
		const result = await users.findByUsername(req.params.username);
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
router.post("/", authenticateToken, async (req, res) => {
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
		const newUser = await knex('user').insert(payload).returning();
		res.json({users : newUser});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

export default router;
