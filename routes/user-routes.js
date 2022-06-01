import express from 'express';
import bcrypt from 'bcrypt';
import { authenticateToken } from '../middleware/authorization.js';

import user from '../models/user.js';

const router = express.Router();

// • Fetching all users
router.get('/', async (req, res) => {
	try {
		const result = await user.findAll();
		res.status(200).json({users : result});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

router.get('/:id', async (req, res) => {
	console.log(req.params.id);
	try {
		const result = await user.findById(req.params.id);
		res.status(200).json({users : result});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

// • Fetching user by username
router.get('/username/:username', async (req, res) => {
	try {
		const result = await user.findByUsername(req.params.username);
		res.status(200).json({users : result});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

router.get('/email/:email', async (req, res) => {
	console.log(req.body.email);
	try {
		const result = await user.findByEmail(req.params.username);
		res.status(200).json({users : result});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

// • Updating user
router.put('/:id', async (req, res) => {
	try {
		const response = await user.update(req.params.id, req.body);
		res.status(200).json(response);
	} catch (err) {
		res.status(400).json({error : err.message});
	};
});

// • Deleting user
router.delete('/:id', async (req, res) => {
	try {
		const response = await user.destroy(req.params.id);
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

		const result = await user.create(payload);
		res.status(200).json({users : newUser});
	} catch (err) {
		res.status(500).json({error : err.message});
	};
});

export default router;
