import {jwtDecode} from "./jwt-decode.js";

const api_url = 'http://localhost:3000/api';

const formLogin = document.querySelector("form");

formLogin.onsubmit = async (e) => {
	e.preventDefault();

	const email = formLogin.email.value;
	const password = formLogin.password.value;
	const loginDetails = await login({email, password});
	console.log(loginDetails);

	const msg = document.querySelector(".msg");
	if (loginDetails.error) {
		msg.style.setProperty('color', 'red');
		msg.innerText = loginDetails.error;
		document.querySelectorAll('input[type="email"], input[type="email"]').forEach(input => {
			input.style.setProperty('border-color', 'red');
		});
		return;
	};

	msg.style.removeProperty('color');
	msg.innerText = '';
	document.querySelectorAll('input[type="email"], input[type="email"]').forEach(input => {
		input.style.removeProperty('border-color');
	});
};

async function login(data) {
	const res = await fetch(`${api_url}/auth/login`, {
		method: 'POST',
		credentials:'include',
		cache:'no-cache',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	});
	return await res.json();
};