import { jwtDecode } from "./jwt-decode.js";
import { capitalize, displayOverlay, formatDate, formatPhone, sendMessageToPanel, sortByProperty } from './utils.js';

const jwtDecoded = jwtDecode(localStorage.getItem('Authorization'));

const hostname = window.location.href.split(window.location.pathname)[0];

// Overlay buttons
const insertUserBtn = document.querySelector('#insert-overlay-btn');
const detailsUserBtn = document.querySelector('#details-overlay-btn');

// Overlay stuff
const overlay = document.querySelector(".overlay");
const overlayBg = document.querySelector(".overlay-bg");
const insertUserBox = document.querySelector(".insert-overlay");
const detailsUserBox = document.querySelector(".details-overlay");
const editUserBox = document.querySelector(".edit-overlay");
const deleteUserBox = document.querySelector(".delete-overlay");

insertUserBtn.addEventListener('click', () => {
	displayOverlay(true, insertUserBox);
});

detailsUserBtn.addEventListener('click', () => {
	displayOverlay(true, detailsUserBox);
});

overlayBg.addEventListener('click', () => {
	displayOverlay(false);
});

document.querySelectorAll('.overlay-closer').forEach(overlayCloser => {
	overlayCloser.addEventListener('click', () => {
		displayOverlay(false);
	});
});

// Form infos
const username = document.getElementsByName('username')[0];
const firstname = document.getElementsByName('firstname')[0];
const lastname = document.getElementsByName('lastname')[0];
const email = document.getElementsByName('email')[0];
const phone = document.getElementsByName('phone')[0];
const password = document.getElementsByName('password')[0];
const role = document.getElementsByName('role')[0];

// Users details
const usersContainer = document.querySelector('#users-container');
const usersNb = document.querySelector('.users-number');
const adminsNb = document.querySelector('.admins-number');
const managersNb = document.querySelector('.managers-number');
const formersNb = document.querySelector('.formers-number');
const internsNb = document.querySelector('.interns-number');

// Filter & order params
const search = document.querySelector('.search');
const orderProperty = document.querySelector('.order-property');
const orderAscending = document.querySelector('.order-ascending');
const showActives = document.querySelector('.show-actives');

/**
 * Get all users
 * @async
 * @returns users
 */
const getAllUsers = async () => {
	const res = await fetch(`${hostname}/api/users`, {
		method: 'GET',
		credentials:'include',
		cache:'no-cache',
		headers: {
			'Content-Type': 'application/json'
		}
	});
	return await res.json();
};

/**
 * Insert a new user in the DB
 * @param {object} data 
 * @returns {object} The new user
 */
const insertUser = async (data) => {
	const res = await fetch(`${hostname}/api/users`, {
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
 * Updates a user from the DB
 * @param {number} id Integer referring to a user's id
 * @param {object} payload An object containing the properties to modify
 * @returns {object} The updated user
 */
const updateUser = async (id, payload) => {
	const res = await fetch(`${hostname}/api/users/${id}`, {
		method: 'PUT',
		credentials:'include',
		cache:'no-cache',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload)
	});
	return await res.json();
};

/**
 * Deletes a user from the DB
 * @param {number} id Integer referring to a user's id
 * @returns {object} The deleted user
 */
const deleteUser = async (id) => {
	const res = await fetch(`${hostname}/api/users/${id}`, {
		method: 'DELETE',
		credentials:'include',
		cache:'no-cache',
		headers: {
			'Content-Type': 'application/json'
		}
	});
	return await res.json();
};

document.querySelector('.insert-overlay form').addEventListener('submit', async (e) => {
	e.preventDefault();
	try {
		const insertDetails = await insertUser({
			username : username.value,
			firstname : firstname.value,
			lastname : lastname.value,
			email : email.value,
			phone : phone.value,
			password : password.value,
			role : role.value
		});
		if (insertDetails.error) throw new Error(insertDetails.error);

		await setUsers();
		displayOverlay(false);
		e.target.reset();
	} catch (err) {
		sendMessageToPanel(err.message, 'var(--color-red)');
	};
});

/**
 * Setting the username inside the furnished HTML node
 * @param {HTMLNode} field The HTML node inside which we want to generate the username
 * @param {string} username The username we want to put in the field
 */
const setUsername = (field, username) => {
	field.value = username;
};

/**
 * Generating a username based on two strings
 * @param {HTMLNode} firstname The HTML Node containing the user's first name
 * @param {HTMLNode} lastname The HTML Node containing the user's last name
 * @returns {string} A username in lower case based on the first character of the first name concatenated to the last name
 */
const generateUsername = (firstname, lastname) => {
	try {
		const firstLetter = (firstname.value.trim()).charAt(0).toLowerCase();
		const familyName = (lastname.value.trim()).toLowerCase().replaceAll(' ', '').replaceAll("'", '').replaceAll("-", '');
		return firstLetter + familyName;
	} catch (err) {
		console.error(err.message);
	};
};

/**
 * Function used for the firstname and lastname input event listeners
 */
const modifiedNameInputs = () => {
	setUsername(username, generateUsername(firstname, lastname));
};

// Auto generating username based on firstname and lastname when any is written
firstname.addEventListener('input', modifiedNameInputs);
lastname.addEventListener('input', modifiedNameInputs);

// Removing auto generating username if username is specified by admin
username.addEventListener('input', () => {
	if (username.value === '') {
		firstname.addEventListener('input', modifiedNameInputs);
		lastname.addEventListener('input', modifiedNameInputs);
	} else {
		firstname.removeEventListener('input', modifiedNameInputs);
		lastname.removeEventListener('input', modifiedNameInputs);
	};
});

/**
 * Count users by role and total of users
 * @async
 * @returns {object} number of users
 */
const countAllUsers = async () => {
	const res = await fetch(`${hostname}/api/users/count`, {
		method: 'GET',
		credentials:'include',
		cache:'no-cache',
		headers: {
			'Content-Type': 'application/json'
		}
	});
	return await res.json();
};

/**
 * Shows informations about the users in the HTML
 */
const setDetails = async (users) => {
	try {
		const stats = [
			{
				name : "Nombre d'administrateurs",
				value : users.filter(user => user.role == 1).length
			},
			{
				name : "Nombre de gestionnaires",
				value : users.filter(user => user.role == 2).length
			},
			{
				name : "Nombre de formateurs",
				value : users.filter(user => user.role == 3).length
			},
			{
				name : "Nombre de stagiaires",
				value : users.filter(user => user.role == 4).length
			},
			{
				name : "Total d'utilisateurs",
				value : users.length
			},
			{
				name : "Utilisateurs actifs",
				value : `${users.filter(user => user.activated === true).length} / ${users.length}`
			},
			{
				name : "Utilisateur le plus ancien",
				value : users.sort((a, b) => a.created_at > b.created_at ? 1 : -1)[0].username
			},
			{
				name : "Utilisateur le plus récent",
				value : users.sort((a, b) => a.created_at > b.created_at ? -1 : 1)[0].username
			}
		];
		
		const detailsContainer = document.querySelector('.details-overlay .container-body');
		detailsContainer.innerHTML = "";
		stats.forEach((stat, i) => {
			detailsContainer.innerHTML += `
				<div class="details-row${i % 2 ? ' darkened' : ''}">
					<p>${stat.name}</p>
					<hr>
					<span>${stat.value}</span>
				</div>
			`;
		});
	} catch (err) {
		sendMessageToPanel(err.message, 'var(--color-bad-message)');
	};
};

/**
 * Creates an array inside which all roles will be stored
 * @param {Array<object>} users 
 */
 const filterRoles = async (users) => {
	let roles = {};
	users.forEach(user => {
		roles[user.role] = user.name;
	});
	const rolesIds = Object.keys(roles);
	return {
		roles,
		rolesIds
	};
};

/**
 * Turns 1/2 rows in the infos panel to light gray
 */
const setInfosRowColor = () => {
	document.querySelectorAll('.infos-row').forEach((row, i) => {
		if (i % 2) row.style.backgroundColor = "var(--color-bg-alt3)";
	});
};
setInfosRowColor();

/**
 * Sets the edit-overlay form so it depends on which user we're editing
 * @param {object} user The user on which to base the edit form depending on who we're editing
 */
const setEditUserForm = async (user) => {
	const properties = ["username", "firstname", "lastname", "email", "phone", "password", "role"];

	const form = document.querySelector('.edit-overlay form');
	const formClone = form.cloneNode(true);

	form.parentNode.replaceChild(formClone, form);

	formClone.addEventListener('submit', async (e) => {
		e.preventDefault();

		const username = document.querySelector('.edit-overlay .username');
		const firstname = document.querySelector('.edit-overlay .firstname');
		const lastname = document.querySelector('.edit-overlay .lastname');
		const email = document.querySelector('.edit-overlay .email');
		const phone = document.querySelector('.edit-overlay .phone');
		const password = document.querySelector('.edit-overlay .password');
		const role = document.querySelector('.edit-overlay .role');

		const values = {
			username : username.value.toString(),
			firstname : firstname.value.toString(),
			lastname : lastname.value.toString(),
			email : email.value.toString(),
			phone : phone.value.toString(),
			password : password.value.toString(),
			role : role.value.toString()
		};
		
		let payload = {};
		Object.keys(values).forEach(property => {
			if (values[property] != user[property] && values[property] != "") {
				payload[property] = values[property];
			};
		});

		try {
			// Not updating if nothing to change
			if (Object.keys(payload).length < 1) throw new Error("L'utilisateur n'a pas été modifié");

			const updateUserDetails = await updateUser(user.id, payload);
			console.log(updateUserDetails);

			displayOverlay(false);
			setUsers();
		} catch (err) {
			sendMessageToPanel(err.message);
		};
	});

	properties.forEach(prop => {
		const input = document.querySelector(`.edit-overlay .${prop}`);
		input.value = user[prop] ? user[prop] : "";
	});

	displayOverlay(true, editUserBox);
};

const setDeleteUserForm = async (user) => {
	document.querySelector('.delete-query').innerText = `Souhaitez-vous vraiment supprimer ${user.firstname} ${user.lastname} ?`;

	const deleteUserBtn = document.querySelector('.delete-overlay .delete-btn');
	const deleteUserBtnClone = deleteUserBtn.cloneNode(true);

	deleteUserBtnClone.addEventListener('click', async (e) => {
		e.preventDefault;

		try {
			const deleteDetails = await deleteUser(user.id);

			await setUsers();
			sendMessageToPanel(`L'utilisateur ${user.firstname} ${user.lastname} (${user.username}) a été supprimé`, 'var(--color-green)');
			displayOverlay(false);
		} catch (err) {
			sendMessageToPanel(err.message, 'var(--color-red)');
		};
	});

	deleteUserBtn.parentElement.replaceChild(deleteUserBtnClone, deleteUserBtn);

	displayOverlay(true, deleteUserBox);
};

const setUsers = async () => {	
	// Fetching users
	const {users} = await getAllUsers();
	users.sort((a, b) => (a.role > b.role ? 1 : -1));
	setDetails(users);

	const { roles, rolesIds } = await filterRoles(users);

	displayUsersByRole(users, roles, rolesIds);

	search.addEventListener('input', async () => {
		displayUsersByRole(users, roles, rolesIds);
	});
	orderProperty.addEventListener('change', async () => {
		displayUsersByRole(users, roles, rolesIds);
	});
	orderAscending.addEventListener('change', async () => {
		displayUsersByRole(users, roles, rolesIds);
	});
	showActives.addEventListener('change', async () => {
		displayUsersByRole(users, roles, rolesIds);
	});
};

const displayUsersByRole = (users, roles, rolesIds) => {
	if (!users) return {message : "Aucun utilisateur ne correspond à ces critères"};
	if (users.length < 1) return {message : "Aucun utilisateur ne correspond à ces critères"};
	
	usersContainer.innerHTML = '';
	rolesIds.forEach(roleId => {
		const filteredUsers = filterUsers(users.filter(user => user.role == roleId));
		displayUsers(filteredUsers, roles, roleId);
	});
};

/**
 * Filtering by search query
 * @param {Array<object>} users 
 * @returns {Array<object>} filtered users
 */
const filterUsers = (users) => {
	if (!users) return {message : "Aucun utilisateur ne correspond à ces critères"};
	if (users.length < 1) return {message : "Aucun utilisateur ne correspond à ces critères"};

	// If search input is set
	let filtered = search.value ?
		filtered.filter(user => {
			// Checking if the search query contains any of the following values
			const res = [
				user.username.toLowerCase(),
				user.firstname.toLowerCase(),
				user.lastname.toLowerCase(),
				user.email.toLowerCase(),
				user.phone.toLowerCase()
			].map(element => element.includes(search.value.toLowerCase()));
			return res.includes(true);
		})
		:
		users
	;

	if (users.length < 1) return {message : "Aucun utilisateur ne correspond à ces critères"};

	// If show actives checkbox is set
	filtered = showActives.checked ?
		filtered.filter(user => user.activated)
		:
		filtered
	;

	if (users.length < 1) return {message : "Aucun utilisateur ne correspond à ces critères"};

	return filtered;
};

/**
 * Displays all users passed as arguments
 * @param {Array<object>} users 
 * @param {array} roles The roles to use as categories
 * @param {array} rolesIds The roles ids used for bracket notation to get the roles' name
 */
 const displayUsers = (users, roles, roleId) => {
	// If something is to be said (potentially an error)
	if (users.message) {
		container.innerHTML = `
			<div class="themes-message">
				<h1>:(</h1>
				<p>${themes.message}</p>
			</div>
		`;
		return;
	};

	// Resetting usersContainer's content
	const newRoleBox = document.createElement('section');
		newRoleBox.setAttribute('id', roles[roleId]);
		newRoleBox.classList.add('role-box');
		newRoleBox.innerHTML = `
			<div class="role-header">
				<h1>${capitalize((() => {
					// Traduction des roles anglais en français
					switch (roles[roleId]) {
						case "admin" :
							return "administrateurs";
						case "manager" :
							return "gestionnaires";
						case "former" :
							return "formateurs";
						case "intern" :
							return "stagiaires";
						default :
							return "utilisateurs";
					}
				})())}</h1>
			</div>
		`;

		const cardsBox = document.createElement('div');
		cardsBox.classList.add('cards-box');

		const sortedUsers = sortByProperty(users, orderProperty.value, JSON.parse(orderAscending.value));
		sortedUsers.forEach(user => {
			const cardContainer = document.createElement('div');
			cardContainer.classList.add('card-container');
			
			const card = document.createElement('article');
			card.classList.add('user-card');
			
			const userBox = document.createElement('div');
			userBox.classList.add('user-box');
			userBox.innerHTML = `
				<div class="user-personal">
					<h2>${user.firstname} ${user.lastname}</h2>
					<p class="username">${user.username}</p>
				</div>
				<div class="user-contact">
					<a href="mailto:${user.email}" class="email">${user.email}</a>
					<a href="tel:${user.phone}" class="phone">${formatPhone(user.phone)}</a>
				</div>
				<div class="user-stats">
					<p class="createdAt">Inscrit le ${formatDate(user.created_at)}</p>
					<p class="updatedAt">Modifié le ${formatDate(user.updated_at)}</p>
				</div>
			`;

			const btnContainer = document.createElement('div');
			btnContainer.classList.add('btn-container');

			// Preventing auto-deletion and auto-deactivation
			if (jwtDecoded.id !== user.id) {
				// Toggle switch
				const toggleSwitch = document.createElement('div');
				toggleSwitch.classList.add('toggle-switch');

				const label = document.createElement('label');
				label.classList.add('switch');

				const input = document.createElement('input');
				input.type = 'checkbox';
				
				if (user.activated) {
					input.setAttribute('checked', '');
				} else {
					input.removeAttribute('checked');
				};

				input.addEventListener('click', async (e) => {
					const activated = input.checked;
					const updateUserDetails = await updateUser(user.id, {activated});
					user.activated = activated;

					if (!input.ckecked && showActives.checked) {
						setTimeout(setUsers, 1000);
					}
				});
				
				const span = document.createElement('span');
				span.classList.add('slider', 'round');

				label.appendChild(input);
				label.appendChild(span);
				toggleSwitch.appendChild(label);

				// Edit button
				const editBtn = document.createElement('button');
				editBtn.classList.add('edit');
				editBtn.addEventListener('click', async () => {
					await setEditUserForm(user);
				});

				// Delete button
				const deleteBtn = document.createElement('button');
				deleteBtn.classList.add('destroy');
				deleteBtn.addEventListener('click', async () => {
					await setDeleteUserForm(user);
				});

				btnContainer.appendChild(toggleSwitch);
				btnContainer.appendChild(editBtn);
				btnContainer.appendChild(deleteBtn);
			} else {
				// Edit button
				const editBtn = document.createElement('button');
				editBtn.classList.add('edit');
				editBtn.addEventListener('click', async () => {
					await setEditUserForm(user);
				});

				btnContainer.appendChild(editBtn);
			};
			card.appendChild(userBox);
			card.appendChild(btnContainer);

			cardContainer.appendChild(card);
			cardsBox.appendChild(cardContainer);
		});
		newRoleBox.appendChild(cardsBox);

		usersContainer.appendChild(newRoleBox);
};

setUsers();