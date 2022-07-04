import { jwtDecode } from "./jwt-decode.js";

const hostname = window.location.href.split(window.location.pathname)[0];

const checkRights = (user, right) => {
	console.log(user, right);
	return true;
};

const setNavbarLinks = (token) => {
	const jwtDecoded = jwtDecode(localStorage.getItem('Authorization'));

	const navLinks = document.querySelector('#navbar .nav-links');
	navLinks.innerHTML = '';
	try {
		navLinks.innerHTML += `
			${checkRights(jwtDecoded, 'isAdmin') ? `<li><a href="/admin">Admin</a></li>` : `<li><a href="/">Home</a></li>`}
			${checkRights(jwtDecoded, 'canViewUsers') ? `<li><a href="/users">Utilisateurs</a></li>` : ``}
			${checkRights(jwtDecoded, 'canViewThemes') ? `<li><a href="/themes">Thèmes</a></li>` : ``}
			${checkRights(jwtDecoded, 'canViewExaminations') ? `<li><a href="/examinations">Examens</a></li>` : ``}
		`;
	} catch (err) {
		console.error(err.message);
	};

	const navOptions = document.querySelector('#navbar .nav-options');
	navOptions.innerHTML = '';
	try {
		navOptions.innerHTML += `
			${checkRights(jwtDecoded, 'isAdmin') ? `<li><a href="/settings">Paramètres</a></li>` : ``}
			
		`;

		// Logout button
		const li = document.createElement('li');

		const logoutBtn = document.createElement('a');
		logoutBtn.setAttribute('href', '/logout');
		logoutBtn.classList.add('logoutBtn');
		logoutBtn.innerText = 'Déconnexion';
		logoutBtn.addEventListener('click', logout);

		li.appendChild(logoutBtn);
		navOptions.appendChild(li);
	} catch (err) {
		console.error(err.message);
	};
};

// • Delete Refresh token to logout
async function deleteToken() {
	const res = await fetch(`${hostname}/api/auth/refresh_token`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json'
		},
		mode: 'cors',
		credentials: 'include'
	});
	return await res.json();
};

/**
 * Log out
 */
const logout = async () => {
	try {
		console.log(path);
		// const deleteDetails = await deleteToken();
		// console.log(deleteDetails);

		localStorage.removeItem('Authorization');

		// const res = await fetch(`${hostname}/logout`, {
		// 	method: "GET",
		// });
		// console.log(res);
		// window.location = res.url;
	} catch (err) {
		console.log(err);
	};
};

setNavbarLinks();