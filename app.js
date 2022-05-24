// • Modules imports
import express, {json} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import {dirname, join} from 'path';
import {fileURLToPath} from 'url';
import { authenticateToken } from './middleware/authorization.js';
import usersRouter from './routes/users-routes.js';
import authRouter from './routes/auth-routes.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 5000;
const corsOptions = {credentials: true, origin: process.env.URL || '*'};

app.use(cors(corsOptions));
app.use(json());
app.use(cookieParser());

app.set('views engine', 'ejs');

app.use('/', express.static('public'));
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);

app.get('/', (req, res) => {
	res.render('pages/index.ejs');
});

app.get('/login', (req, res) => {
	res.render('pages/login.ejs');
});

app.get('/admin', (req, res) => {
    if (true) {
	    res.render('pages/admin.ejs');
    } else {
        res.redirect('/');
    }
});

app.listen(PORT, () => console.log(`App started on http://localhost:${PORT}`));

// // • Server config
// app.set('views engine', 'ejs');
// app.use(express.json());
// app.use(bodyParser.urlencoded({ extended: false }));

// // • External scripts imports
// const knex = require("./models/knexClient");

// // • Server routes
// app.get("/", async (req, res) => {
//     res.send("<p>Hello world!</p> <a href='/login'>Connexion</a>");
// });

// app.get("/login", async (req, res) => {
//     res.render('pages/login.ejs');
// });
// app.post("/login", async (req, res) => {
//     try {
//         const data = await knex('user').select().where('email', '=', req.body.email);
//         if (data.length < 1) throw new Error('User not found');
//         res.json(data);
//     } catch (err) {
//         res.send(`${err.message}. <a href='/login'>Réessayer</a>`);
//     };
// });

// // • Server launching
// app.listen(process.env.PORT, () => console.log(`App started on http://localhost:${process.env.PORT}`));