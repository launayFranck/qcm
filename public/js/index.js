import {jwtDecode} from "./jwt-decode.js";

const api_url = 'http://localhost:3000/api';

// Create html elements if Authorized
if (localStorage.getItem('Authorization')) {
	const jwtDecoded = jwtDecode(localStorage.getItem('Authorization'));

	const h1 = document.createElement('h1');
	h1.innerText = `Bienvenue, ${jwtDecoded.firstname} ${jwtDecoded.lastname}`;

	const p = document.createElement('p');
	p.innerText = `Votre email est ${jwtDecoded.email}`;

	document.body.querySelector('main').appendChild(h1);
	document.body.querySelector('main').appendChild(p);
} else {
	window.location.href = "/login";
};