import { jwtDecode } from "./jwt-decode.js";

const hostname = window.location.href.split(window.location.pathname)[0];

const checkRights = (token, right) => {
	// console.log(token, right);
	return true;
};

const setNavbarLinks = (token) => {
	const jwtDecoded = jwtDecode(localStorage.getItem('Authorization'));

	const navLinks = document.querySelector('#navbar .nav-links');
	navLinks.innerHTML = '';
	try {
		navLinks.innerHTML += `
			${checkRights(jwtDecoded, 'canViewAdminPage') ? `
				<li><a href="/admin">
					<img class="nav-icon" src="/img/home.svg" alt="Admin">
					<p>Admin</p>
				</a></li>` : `<li><a href="/">Home</a></li>`}
			${checkRights(jwtDecoded, 'canViewUsers') ? `
				<li><a href="/users">
					<img class="nav-icon" src="/img/user-white.webp" alt="Utilisateurs">
					<p>Utilisateurs</p>
				</a></li>` : ``}
			${checkRights(jwtDecoded, 'canViewThemes') ? `
				<li><a href="/themes">
					<img class="nav-icon" src="/img/palette.svg" alt="Thèmes">
					<p>Thèmes</p>
				</a></li>` : ``}
			${checkRights(jwtDecoded, 'canViewExaminations') ? `
				<li><a href="/examinations">
					<img class="nav-icon" src="/img/student-hat.svg" alt="Examens">
					<p>Examens</p>
				</a></li>` : ``}
			${checkRights(jwtDecoded, 'canViewExamQuestions') ? `
				<li><a href="/questions">
					<img class="nav-icon" src="/img/question-mark.svg" alt="Questions">
					<p>Questions</p>
				</a></li>` : ``}
		`;
	} catch (err) {
		console.error(err.message);
	};

	const navOptions = document.querySelector('#navbar .nav-options');
	navOptions.innerHTML = '';

	try {
		navOptions.innerHTML += `
			${checkRights(jwtDecoded, 'isAdmin') ? `
				<li><a href="/settings">
					<img class="nav-icon" src="/img/cog-white.svg" alt="Paramètres">
					<p>Paramètres</p>
				</a></li>` : ``}
		`;

		// Logout button
		const li = document.createElement('li');

		const logoutBtn = document.createElement('a');
		logoutBtn.setAttribute('href', '/logout');
		logoutBtn.classList.add('logoutBtn');
		logoutBtn.innerHTML = `
			<img class="nav-icon" src="/img/power-off.svg" alt="Déconnexion">
			<p>Déconnexion</p>
		`;
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