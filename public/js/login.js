import {jwtDecode} from "./jwt-decode.js";

const api_url = 'http://localhost:3000/api';

const formLogin = document.querySelector("form");
const deleteTokenBtn = document.querySelector('#deleteTokenBtn');

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
		document.querySelectorAll('input[type="email"], input[type="password"]').forEach(input => {
			input.style.setProperty('border-color', 'red');
		});
		return;
	};

	msg.style.setProperty('color', 'lime');
	msg.innerText = 'Login success';
	const inputs = document.querySelectorAll('input[type="email"], input[type="password"]');
	inputs.forEach(input => {
		input.style.removeProperty('border-color');
	});

	const accessToken = loginDetails.accessToken;
	localStorage.setItem('jwt', accessToken);
	const jwtDecoded = jwtDecode(accessToken);
	console.log(jwtDecoded);
	// window.location.href = "/";
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

deleteTokenBtn.onclick = async (e) => {
	const deleteDetails = await deleteToken();
	if (deleteDetails.error) {
	  pStatus.innerText = deleteDetails.error;
	  return;
	};
	accessToken = "";
	pStatus.innerText = deleteDetails.message;
	showLoginPanel(true);
};

async function deleteToken(){
	const res = await fetch(`${api_url}/auth/refresh_token`,{
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json'
		},
		mode: 'cors',
		credentials: 'include'
	});
	return await res.json();
};
