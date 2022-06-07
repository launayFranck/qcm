import { jwtDecode } from "./jwt-decode.js";

const jwtDecoded = jwtDecode(localStorage.getItem('Authorization'));

const hostname = window.location.href.split(window.location.pathname)[0];

// Form infos
const username = document.getElementsByName('username')[0];
const firstname = document.getElementsByName('firstname')[0];
const lastname = document.getElementsByName('lastname')[0];
const email = document.getElementsByName('email')[0];
const phone = document.getElementsByName('phone')[0];
const password = document.getElementsByName('password')[0];
const role = document.getElementsByName('role')[0];

// Users infos
const usersContainer = document.querySelector('#users-container');
const usersNb = document.querySelector('.users-number');
const adminsNb = document.querySelector('.admins-number');
const managersNb = document.querySelector('.managers-number');
const formersNb = document.querySelector('.formers-number');
const internsNb = document.querySelector('.interns-number');

// Filter & order infos
const search = document.querySelector('.search');
const orderProperty = document.querySelector('.order-property');
const orderAscending = document.querySelector('.order-ascending');
const showActives = document.querySelector('.show-actives');

console.log(orderProperty);

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

document.querySelector('#add-user-form').addEventListener('submit', async (e) => {
	e.preventDefault();

	const insertDetails = await insertUser({
		username : username.value,
		firstname : firstname.value,
		lastname : lastname.value,
		email : email.value,
		phone : phone.value,
		password : password.value,
		role : role.value
	});
	if (insertDetails.error) {
		alert(insertDetails.error);
	} else {
		await setUsers();
		e.reset();
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
 * Capitalizes a string
 * @param {string} str The string to capitalize
 * @returns {string} The capitalized string
 */
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Sorts an array of objects by one of the objects' property
 * @param {array} array The array containing objects to sort
 * @param {string} property The name of the property to use as a filter
 * @param {boolean} ascending Specifies the order of the required informations
 * @returns {Array<object>} The sorted array
 */
const sortByProperty = (array, property, ascending = true) => {
	try {
		const res = array.sort((a, b) => (a[property].toLowerCase() > b[property].toLowerCase() ?
			(ascending ? 1 : -1)
			:
			(ascending ? -1 : 1)
		));
		return res;
	} catch (err) {
		console.error(err.message);
		return array;
	};
};

/**
 * Shows informations about the users in the HTML
 */
const fillUsersInfos = async () => {
	const { users : number } = await countAllUsers();
	try {
		usersNb.innerText = number.users_number;
		adminsNb.innerText = number.admins_number;
		managersNb.innerText = number.managers_number;
		formersNb.innerText = number.formers_number;
		internsNb.innerText = number.interns_number;
	} catch (err) {
		console.error(err.message);
	};
};

const setUsers = async () => {

	/**
	 * Creates an array inside which all roles will be stored
	 * @param {Array<object>} users 
	 */
	const filterRoles = async (users) => {

	};

	await fillUsersInfos();
	
	// Fetching users
	const {users} = await getAllUsers();
	users.sort((a, b) => (a.role > b.role ? 1 : -1));

	// Filtering distinct roles
	let roles = {};
	users.forEach(user => {
		roles[user.role] = user.name;
	});
	const rolesIds = Object.keys(roles);
	
	// Showing up users sorted by role
	const displayUsers = () => {
		usersContainer.innerHTML = '';
		rolesIds.forEach(roleId => {
			const newRoleBox = document.createElement('section');
			newRoleBox.setAttribute('id', roles[roleId]);
			newRoleBox.classList.add('role-box');
			newRoleBox.innerHTML = `
				<div class="role-header">
					<h1>${capitalize((() => {
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

			// Filtering by search query
			let filteredUsers = search.value ? users.filter(user => {
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

			// Filtering by "show actives accounts" only query
			const checked = showActives.checked;
			filteredUsers = checked ? filteredUsers.filter(user => user.activated) : filteredUsers;

			for (let user of sortByProperty(filteredUsers.filter(user => user.role == roleId), orderProperty.value, orderAscending.value)) {
				const article = document.createElement('article');
				const userBox = document.createElement('div');
				userBox.classList.add('user-box');
				userBox.innerHTML = `
					<h2>${user.username}</h2>
					<p>${user.firstname} ${user.lastname}</p>
					<p>${user.email}</p>
					<p>${user.phone}</p>
					<p>Membre depuis le ${(() => {
						const date = new Date(user.created_at);
						const year = date.getFullYear();
						const month = date.getMonth() + 1;
						const day = date.getDate();

						const formatNb = (nb) => {
							return (nb.toString()).length < 2 ? `0${nb}` : nb;
						};

						return `${formatNb(day)}/${formatNb(month)}/${year}`;
					})()}</p>
					<p>Dernière modification le ${(() => {
						const date = new Date(user.updated_at);
						const year = date.getFullYear();
						const month = date.getMonth() + 1;
						const day = date.getDate();

						const formatNb = (nb) => {
							return (nb.toString()).length < 2 ? `0${nb}` : nb;
						};

						return `${formatNb(day)}/${formatNb(month)}/${year}`;
					})()}</p>
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
					editBtn.addEventListener('click', () => window.location = `/users/edit/${user.id}`);

					// Delete button
					const deleteBtn = document.createElement('button');
					deleteBtn.classList.add('destroy');
					deleteBtn.addEventListener('click', async () => {
						const answer = confirm(`Voulez-vous vraiment supprimer l'utilisateur ${user.username} ?`);
						if (answer) {
							const deleteDetails = await deleteUser(user.id);
							await setUsers();
						};
					});

					btnContainer.appendChild(toggleSwitch);
					btnContainer.appendChild(editBtn);
					btnContainer.appendChild(deleteBtn);
				} else {
					// Edit button
					const editBtn = document.createElement('button');
					editBtn.classList.add('edit');
					editBtn.addEventListener('click', () => window.location = `/users/edit/${user.id}`);

					btnContainer.appendChild(editBtn);
				};
				article.appendChild(userBox);
				article.appendChild(btnContainer);

				newRoleBox.appendChild(article);
			};
			usersContainer.appendChild(newRoleBox);
		});
	};
	displayUsers();

	search.addEventListener('input', displayUsers);
	orderProperty.addEventListener('change', displayUsers);
	orderAscending.addEventListener('change', displayUsers);
	showActives.addEventListener('change', displayUsers);
};

setUsers();