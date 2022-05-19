import express from 'express';
import knex from '../models/knexClient.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {jwtTokens} from '../utils/jwt-helpers.js';

const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await knex('user').select().where('email', '=', email).first();
        if (!user) return res.status(401).json({error: 'Email ou mot de passe incorrect'});
        // PASSWORD CHECK
        const validPassword = await bcrypt.compare(password, user.password);

        if(!validPassword) return res.status(401).json({error: 'Email ou mot de passe incorrect'});

        //JWT
        let tokens = jwtTokens(user);
        res.cookie('refresh_token', tokens.refreshToken, {httpOnly: true});
        res.json(tokens);
    } catch (err) {
        res.status(401).json({error: err.message});
    }
})

router.get('/refresh_token', (req, res) => {
    try {
        const refreshToken = req.cookies.refresh_token;
        if (refreshToken === null) return res.status(401).json({error: 'Null refresh token'});
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, user) => {
            if (error) return res.status(403).json({error: error.message});
            let tokens = jwtTokens(user);
            res.cookie('refersh_token', tokens.refreshToken, {httpOnly: true});
            res.json(tokens);
        });
    } catch (err) {
        res.status(401).json({error: err.message});
    };
});

router.delete('/refresh_token', (req, res) => {
    try {
        res.clearCookie('refresh_token');
        return res.status(200).json({message: 'refresh token deleted.'});
    } catch (err) {
        res.status(401).json({error: err.message});
    };
});

export default router;