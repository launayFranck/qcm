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
	if (req.cookies.access_token) {
		jwt.verify(req.cookies.access_token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
			if (err) {
				console.error(err.message);
				res.redirect('/login');
				return;
			};

			if (!user) {
				res.redirect('/login');
				return;
			}
			
			if (user.role === 1) {
				res.redirect('/admin');
				return;
			};

			res.render('pages/index.ejs');
		});
	} else {
		res.redirect('/login');
	};
});

app.get('/login', (req, res) => {
	if (req.cookies.access_token) {
		jwt.verify(req.cookies.access_token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
			if (err) {
				console.error(err.message);
			};

			if (user) {
				if (user.role === 1) {
					res.redirect('/admin');
					return;
				} else {
					res.redirect('/');
					return;
				};
			};

			res.render('pages/login.ejs');
		});
	} else {
		res.render('pages/login.ejs');
	};
});

app.get('/logout', (req, res) => {
	for (const cookie of Object.keys(req.cookies)) {
		res.cookie(cookie, '', {maxAge: 0});
	};
	
	res.redirect('/login');
});

app.get('/users', (req, res) => {
	if (req.cookies.access_token) {
		jwt.verify(req.cookies.access_token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
			if (err) {
				console.error(err.message);
				res.redirect('/login');
			};

			if (!user) res.redirect('/login');
			if (user.role !== 1) res.redirect('/');

			res.render('pages/users.ejs');
		});
	} else {
		res.redirect('/login');
	};
});

app.get('/themes', (req, res) => {
	if (req.cookies.access_token) {
		jwt.verify(req.cookies.access_token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
			if (err) {
				// console.error(err.message);
				res.redirect('/login');
				return;
			};

			if (!user) {
				res.redirect('/login');
				return;
			}
			if (user.role !== 1) {
				res.redirect('/');
				return;
			}
	
			res.render('pages/themes.ejs');
		});
	} else {
		res.redirect('/login');
	};
});

app.get('/admin', (req, res) => {
	if (req.cookies.access_token) {
		jwt.verify(req.cookies.access_token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
			if (err) {
				console.error(err.message);
				res.redirect('/login');
			};

			if (!user) res.redirect('/login');
			if (user.role !== 1) res.redirect('/');
	
			res.render('pages/admin.ejs');
		});
	} else {
		res.redirect('/login');
	};
});

// • Server Listening
app.listen(PORT, () => console.log(`App started on http://localhost:${PORT}`));
