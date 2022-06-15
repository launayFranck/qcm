import { jwtDecode } from "./jwt-decode.js";
const hostname = window.location.href.split(window.location.pathname)[0];

if (!localStorage.getItem('Authorization') || jwtDecode(localStorage.getItem('Authorization')).role !== 1) {
	window.location = "/";
};

const getUserById = async (id) => {
	const res = await fetch(`${hostname}/api/users/${id}`, {
		method: 'GET',
		credentials:'include',
		cache:'no-cache',
		headers: {
			'Content-Type': 'application/json'
		}
	});
	return await res.json();
};

// Create html elements if Authorized
(async () => {
	const jwtDecoded = jwtDecode(localStorage.getItem('Authorization'));
	const {users : user} = await getUserById(jwtDecoded.id);
	
	const h1 = document.createElement('h1');
	h1.innerText = `Bienvenue, ${jwtDecoded.firstname} ${jwtDecoded.lastname}`;
	const p = document.createElement('p');
	p.innerText = `Votre email est ${jwtDecoded.email}`;
	const role = document.createElement('p');

	role.innerText = `Votre role est ${user.name}`;

	document.body.querySelector('main').appendChild(h1);
	document.body.querySelector('main').appendChild(p);
	document.body.querySelector('main').appendChild(role);
})();
