import { jwtDecode } from "./jwt-decode.js";

// Vérification d l'état de 
if (!localStorage.getItem('Authorization') || jwtDecode(localStorage.getItem('Authorization')).role !== 1) {
	window.location = "/";
};

// Récupération des infos du token
(async () => {
	const jwtDecoded = jwtDecode(localStorage.getItem('Authorization'));

	const h1 = document.createElement('h1');
	h1.innerText = `Bienvenue, ${jwtDecoded.firstname} ${jwtDecoded.lastname}`;
	const p = document.createElement('p');
	p.innerText = `Votre email est ${jwtDecoded.email}`;
	const role = document.createElement('p');
	role.innerText = `Votre role est ${jwtDecoded.role}`;

	document.body.querySelector('main').appendChild(h1);
	document.body.querySelector('main').appendChild(p);
	document.body.querySelector('main').appendChild(role);
})();