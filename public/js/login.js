import {jwtDecode} from "./jwt-decode.js";

const formLogin = document.querySelector("form");
const msg = document.querySelector(".msg");

if (localStorage.getItem('Authorization')) {
	localStorage.removeItem('Authorization');
};

const hostname = window.location.href.split(window.location.pathname)[0];

// • Sending form values to the login route
formLogin.onsubmit = async (e) => {
	e.preventDefault();

	// Get form values
	const email = formLogin.email.value;
	const password = formLogin.password.value;

	const loginDetails = await login({email, password});

	// Manage error case and let the user know
	if (loginDetails.error) {
		msg.style.setProperty('color', 'red');
		msg.innerText = loginDetails.error;
		document.querySelectorAll('input[type="email"], input[type="password"]').forEach(input => {
			input.style.setProperty('border-color', 'red');
		});
		return;
	};

	// Let the user know everything went right
	msg.style.setProperty('color', 'lime');
	msg.innerText = 'Login success';
	const inputs = document.querySelectorAll('input[type="email"], input[type="password"]');
	inputs.forEach(input => {
		input.style.removeProperty('border-color');
	});

	// Put access token in a variable
	const accessToken = loginDetails.accessToken;
	localStorage.setItem('Authorization', accessToken);

	// We put the decoded token in the jwtDecoded variable
	const jwtDecoded = jwtDecode(accessToken);
	console.dir(jwtDecoded);
	// Redirecting to the correct page
	window.location = jwtDecoded.role === 1 ? "/admin" : "/";

	// const response = await fetch(`http://localhost:3000/`, {
	// 	method: 'GET',
	// 	credentials:'include',
	// 	cache:'no-cache',
	// 	headers: {
	// 		'Content-Type': 'application/json',
	// 		"Authorization": `Bearer ${accessToken}`
	// 	}
	// });
};

/**
 * Sending email and password to the auth route
 * @param {object} data 
 * @returns {object} response
 */
async function login(data) {
	const res = await fetch(`${hostname}/api/auth/login`, {
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

/**
 * Fetching refresh token
 * @returns {object}
 */
async function fetchRefreshToken() {
	const res = await fetch(`${hostname}/api/auth/refresh_token`, {
		headers: {
			'Content-Type': 'application/json'
		},
		mode: 'cors',
		credentials: 'include'
	});
	const jsonResponse = await res.json();
	return jsonResponse;
};

const passwordField = document.querySelector('.password');

/**
 * Function used to display or not the password field's content
 * @param {boolean} bool
 */
const showPasswordField = (bool) => {
	if (bool) {
		passwordField.setAttribute('type', 'text');
	} else {
		passwordField.setAttribute('type', 'password');
	};
};

document.querySelector('.view-password').addEventListener('mousedown', () => {
	showPasswordField(true);
});
document.querySelector('.view-password').addEventListener('mouseup', () => {
	showPasswordField(false);
});

// document.querySelector('#deleteTokenBtn').onclick = async (e) => {
// 	const deleteDetails = await deleteToken();
// 	if (deleteDetails.error) {
// 		pStatus.innerText = deleteDetails.error;
// 		return;
// 	};
// 	accessToken = "";
// 	pStatus.innerText = deleteDetails.message;
// 	showLoginPanel(true);
// };
