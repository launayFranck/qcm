import {jwtDecode} from "./jwt-decode.js";

if (!localStorage.getItem('Authorization') || jwtDecode(localStorage.getItem('Authorization')).role !== 1) {
	window.location = "/";
};

(async () => {
	const jwtDecoded = jwtDecode(localStorage.getItem('Authorization'));

	const h1 = document.createElement('h1');
	h1.innerText = `Bienvenue, ${jwtDecoded.firstname} ${jwtDecoded.lastname}`;
	const p = document.createElement('p');
	p.innerText = `Votre email est ${jwtDecoded.email}`;

	document.body.appendChild(h1);
	document.body.appendChild(p);
})();