import express from 'express';
import knex from '../models/knexClient.js';
import bcrypt from 'bcrypt';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const users = await knex('user').select();
        res.json({users});
    } catch (err) {
        res.status(500).json({error : err.message});
    };
});

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
        }
        const newUser = await knex('user').insert(payload).returning();
        res.json({users : newUser});
    } catch (err) {
        res.status(500).json({error : err.message});
    }
})
export default router;