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
import themeRouter from './routes/theme-routes.js';
import chapterRouter from './routes/chapter-routes.js';
import questionRouter from './routes/question-routes.js';
import examinationsRouter from './routes/examination-routes.js';
import authRouter from './routes/auth-routes.js';

// • Server Config
const PORT = process.env.PORT || 5000;

app.set('views engine', 'ejs');
const corsOptions = {credentials: true, origin: process.env.URL || '*'};
app.use(cors(corsOptions));
app.use('/', express.static('public'));
app.use(express.json());
app.use(cookieParser());

// • Routes Config
// Api
app.use('/api/users', usersRouter);
app.use('/api/examinations', examinationsRouter);
app.use('/api/auth', authRouter);
app.use('/api/themes', themeRouter);
app.use('/api/chapters', chapterRouter);
app.use('/api/questions', questionRouter);

// Pages
app.get('/', (req, res) => {
	const {access_token : accessToken} = req.cookies;
	jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
		if (err) {
			console.error(err.message);
			res.redirect('/login');
		};

		res.render('pages/index.ejs');
	});
});

app.get('/login', (req, res) => {
	const {access_token : accessToken} = req.cookies;
	console.log(accessToken);
	if (accessToken) {
		jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
			if (err) console.error(err.message);

			if (!user) return;

			if (user.role === 1) res.redirect('/admin');
			else res.redirect('/');
		});
	};
	
	res.render('pages/login.ejs');
});

app.get('/logout', (req, res) => {
	res.cookie('access_token', '', {maxAge: 0});
	res.cookie('refresh_token', '', {maxAge: 0});
	// Object.keys(req.cookies).forEach(cookie => {
	// 	res.clearCookie(cookie);
		
	// });
	res.redirect('/login');
});

app.get('/users', (req, res) => {
	const {access_token : accessToken} = req.cookies;
	jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
		if (err) {
			console.error(err.message);
			res.redirect('/login');
		};
		if (user.role !== 1) res.redirect('/');

		res.render('pages/users.ejs');
	});
});

app.get('/themes', (req, res) => {
	const {access_token : accessToken} = req.cookies;
	jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user, theme) => {
		if (err) {
			console.error(err.message);
			res.redirect('/login');
		};
		if (user.role !== 1) res.redirect('/');

		res.render('pages/themes.ejs');
	});
});

app.get('/admin', (req, res) => {
	const {access_token : accessToken} = req.cookies;
	jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
		if (err) {
			console.error(err.message);
			res.redirect('/login');
		};
		if (user.role !== 1) res.redirect('/');

		res.render('pages/admin.ejs');
	});
});

// • Server Listening
app.listen(PORT, () => console.log(`App started on http://localhost:${PORT}`));
