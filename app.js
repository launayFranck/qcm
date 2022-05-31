// • Modules Imports
import express from 'express';
const app = express();
import cors from 'cors';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import {dirname, join} from 'path';
import {fileURLToPath} from 'url';
import dotenv from 'dotenv';
dotenv.config();

// • External Scripts Imports
import usersRouter from './routes/user-routes.js';
import authRouter from './routes/auth-routes.js';
import themeRouter from './routes/theme-routes.js';

// • Server Config
const PORT = process.env.PORT || 5000;

app.set('views engine', 'ejs');
const corsOptions = {credentials: true, origin: process.env.URL || '*'};
app.use(cors(corsOptions));
app.use('/', express.static('public'));
app.use(express.json());
app.use(cookieParser());

// • Routes Config
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/themes', themeRouter);

app.get('/', (req, res) => {
	res.render('pages/index.ejs');
});

// • Redirect to the right pages

app.get('/login', (req, res) => {
	res.render('pages/login.ejs');
});

// Admin
app.get('/admin', (req, res) => {
	const {access_token : accessToken} = req.cookies;
	jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
		if (error) {
			console.log(error.message);
			res.redirect('/');
		};
		if (user.role !== 1) res.redirect('/');

		res.render('pages/admin.ejs');
	});
});

// Manager

// Former

// Intern

// • Server Listening
app.listen(PORT, () => console.log(`App started on http://localhost:${PORT}`));
