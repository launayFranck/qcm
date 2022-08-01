import { jwtDecode } from "./jwt-decode.js";
import { capitalize, displayOverlay, formatDate, sendMessageToPanel, sortByProperty } from './utils.js';

const jwtDecoded = jwtDecode(localStorage.getItem('Authorization'));

const hostname = window.location.href.split(window.location.pathname)[0];

// Overlay buttons
const insertThemeBtn = document.querySelector('#insert-overlay-btn');
const detailsThemeBtn = document.querySelector('#details-overlay-btn');

// Overlay stuff
const overlay = document.querySelector(".overlay");
const overlayBg = document.querySelector(".overlay-bg");
const insertThemeBox = document.querySelector(".insert-overlay");
const detailsThemeBox = document.querySelector(".details-overlay");
const editThemeBox = document.querySelector(".edit-overlay");
const deleteThemeBox = document.querySelector(".delete-overlay");

const insertAddRemovableBtn = document.querySelector('.insert-overlay .add-removable');
const editAddRemovableBtn = document.querySelector('.edit-overlay .add-removable');

const getUsersWithThemeRights = async () => {
	const res = await fetch(`${hostname}/api/users/theme_rights`, {
		method: 'GET',
		credentials:'include',
		cache:'no-cache',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${localStorage.getItem('Authorization')}`
		}
	});
	return await res.json();
};

/**
 * Adding removable fields to a charged users list
 * @param {htmlnode} node The html node in which adding the charged user's field
 * @param {number} userId The id of the user we want to select by default (optional)
 */
const addChargedField = async (node, userId) => {
	try {
		// Fetching users who have the rights to add or update roles
		const getUsersDetails = await getUsersWithThemeRights();
		if (getUsersDetails.error) throw new Error(getUsersDetails.error);

		const { users } = getUsersDetails; // Extracting users from getUsersDetails

		// Adding a new field for a new charged user
		const parent = node.querySelector('.removable-list');

		const removableRow = document.createElement('div');
		removableRow.classList.add('removable-row');

		const select = document.createElement('select');
		select.classList.add('removable');

		// Getting all unique roles' names
		const roles = {};
		users.forEach(user => {
			roles[user.role_name] = 1;
		});

		Object.keys(roles).forEach(role => {
			const filteredUsers = users.filter(user => user.role_name == role);

			const optGroup = document.createElement('optgroup');
			optGroup.setAttribute('label', `-- ${capitalize(role)}`);
			
			// Adding all users as options inside the optgroup for the previously created select
			for (let user of filteredUsers) {
				const option = document.createElement('option');
				option.setAttribute('value', user.id);
				if (userId) if (userId == user.id) option.setAttribute('selected', true);
				option.innerHTML = `${user.username} <span class="fullname">(${user.firstname} ${user.lastname})</span>`;

				optGroup.appendChild(option);
			};

			select.appendChild(optGroup);
		});
	
		// "Button" (div) for removing a user in charge for a theme
		const removeRemovable = document.createElement('div');
		removeRemovable.classList.add('remove-removable');
		removeRemovable.innerText = '-';
		removeRemovable.addEventListener('click', (e) => {
			parent.removeChild(removableRow);
		});

		removableRow.appendChild(select);
		removableRow.appendChild(removeRemovable);

		parent.insertBefore(removableRow, node.querySelector('.add-removable'));
	} catch (err) {
		console.error(err.message);
	};
};

addChargedField(insertThemeBox);

insertAddRemovableBtn.addEventListener('click', () => {
	addChargedField(insertThemeBox);
});

insertThemeBtn.addEventListener('click', () => {
	displayOverlay(true, insertThemeBox);
});

detailsThemeBtn.addEventListener('click', () => {
	displayOverlay(true, detailsThemeBox);
});

overlayBg.addEventListener('click', () => {
	displayOverlay(false);
});

document.querySelectorAll('.overlay-closer').forEach(overlayCloser => {
	overlayCloser.addEventListener('click', () => {
		displayOverlay(false);
	});
});

// Filter & order params
const search = document.querySelector('.search');
const orderProperty = document.querySelector('.order-property');
const orderAscending = document.querySelector('.order-ascending');
const orderUser = document.querySelector('.order-user');

/**
 * Get all themes
 * @async
 * @returns themes
 */
const getAllThemes = async () => {
	const res = await fetch(`${hostname}/api/themes`, {
		method: 'GET',
		credentials: 'include',
		cache: 'no-cache',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${localStorage.getItem('Authorization')}`
		}
	});
	return await res.json();
};

/**
 * Insert a new theme in the DB
 * @param {object} data
 * @returns {object} The new theme
 */
const insertTheme = async (data) => {
	const res = await fetch(`${hostname}/api/themes`, {
		method: 'POST',
		credentials:'include',
		cache:'no-cache',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${localStorage.getItem('Authorization')}`
		},
		body: JSON.stringify(data)
	});
	return await res.json();
};

/**
 * Updates a theme from the DB
 * @param {number} id Integer referring to a theme's id
 * @param {object} payload An object containing the properties to modify
 * @returns {object} The updated theme
 */
const updateTheme = async (id, payload) => {
	const res = await fetch(`${hostname}/api/themes/${id}`, {
		method: 'PUT',
		credentials:'include',
		cache:'no-cache',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${localStorage.getItem('Authorization')}`
		},
		body: JSON.stringify(payload)
	});
	return await res.json();
};

/**
 * Deletes a theme from the DB
 * @param {number} id Integer referring to a theme's id
 * @returns {object} The deleted theme
 */
const deleteTheme = async (id) => {
	const res = await fetch(`${hostname}/api/themes/${id}`, {
		method: 'DELETE',
		credentials:'include',
		cache:'no-cache',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${localStorage.getItem('Authorization')}`
		}
	});
	return await res.json();
};

/**
 * Remove duplicated values from an array
 * @param {array} array The array to filter
 */
const removeDuplicates = async (array) => {
	let tmp = {};
	array.forEach(async (value) => {
		tmp[value] = 1;
	});
	return Object.keys(tmp);
};

// The listener for the insert theme form's submit event
document.querySelector('.insert-overlay form').addEventListener('submit', async (e) => {
	e.preventDefault();
	try {
		const title = document.querySelector('.insert-overlay .title').value.trim();
		if (title.length < 1) throw new Error(`Le titre du thème ne peut être vide`);

		const description = document.querySelector('.insert-overlay .description').value.trim();

		const users = await removeDuplicates(Array.from(document.querySelectorAll('.insert-overlay .removable')).map(user => user.value));
		if (users.length < 1) throw new Error(`Veuillez attribuer au moins un utilisateur au thème ${title}`);

		const insertDetails = await insertTheme({title, description, users});
		if (insertDetails.error) throw new Error(insertDetails.error);

		// console.log(insertDetails);

		sendMessageToPanel(`Le thème "${insertDetails.theme.theme.title}" a été créé`, 'var(--color-good-message)');
		await setThemes();
		displayOverlay(false);
		e.target.reset();
	} catch (err) {
		sendMessageToPanel(err.message, 'var(--color-bad-message)');
	};
});

/**
 * Set details about the themes
 * @param {array} themes 
 */
const setDetails = (themes) => {
	const stats = [
		{
			name : 'Nombre de thèmes',
			value : themes.length
		},
		{
			name : "Nombre min d'utilisateur",
			value : themes.sort((a, b) => a.users.length > b.users.length ? 1 : -1)[0].users.length
		},
		{
			name : "Nombre max d'utilisateur",
			value : themes.sort((a, b) => a.users.length < b.users.length ? 1 : -1)[0].users.length
		},
		{
			name : "Utilisateur gérant le moins de thèmes",
			value : (() => {
				const usersNb = {};
				themes.forEach(theme => {
					theme.users.forEach(user => {
						if (usersNb[user.name]) {
							usersNb[user.name] += 1;
						} else {
							usersNb[user.name] =1;
						};
					});
				});

				const users = Object.keys(usersNb).map(user => {
					return {
						name : user,
						number : usersNb[user]
					}
				});
				return users.sort((a, b) => a.number > b.number ? 1 : -1)[0].name
			})()
		},
		{
			name : "Utilisateur gérant le plus de thèmes",
			value : (() => {
				const usersNb = {};
				themes.forEach(theme => {
					theme.users.forEach(user => {
						if (usersNb[user.name]) {
							usersNb[user.name] += 1;
						} else {
							usersNb[user.name] =1;
						};
					});
				});

				const users = Object.keys(usersNb).map(user => {
					return {
						name : user,
						number : usersNb[user]
					}
				});
				return users.sort((a, b) => a.number < b.number ? 1 : -1)[0].name
			})()
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
};

/**
 * Sets the edit-overlay form so it depends on which user we're editing
 * @param {object} theme The theme on which to base the edit form depending on what we're editing
 */
const setEditThemeForm = async (theme) => {
	const properties = ["title", "description"];

	// Getting form and emptying charged users list
	const form = document.querySelector('.edit-overlay form');
	form.querySelectorAll('.removable-row').forEach(chargeRow => {
		chargeRow.parentElement.removeChild(chargeRow);
	});

	// Cloning the form to remove all the event listeners
	const formClone = form.cloneNode(true);
	theme.users.forEach(user => {
		addChargedField(editThemeBox, user.id);
	});
	formClone.querySelector('.add-removable').addEventListener('click', () => {
		addChargedField(editThemeBox);
	});

	// Replacing the previous form with the freshly created clone
	form.parentNode.replaceChild(formClone, form);

	formClone.addEventListener('submit', async (e) => {
		e.preventDefault();

		const title = document.querySelector('.edit-overlay .title');
		const description = document.querySelector('.edit-overlay .description');

		const charges = await removeDuplicates(Array.from(document.querySelectorAll('.edit-overlay .removable')).map(charge => {
			return charge.value;
		}));

		const values = {
			title : title.value.toString(),
			description : description.value.toString(),
			charges
		};
		
		let payload = {};
		Object.keys(values).forEach(property => {
			if (values[property] != theme[property] && values[property] != "") {
				payload[property] = values[property];
			};
		});

		try {
			// Not updating if nothing to change
			if (Object.keys(payload).length < 1) throw new Error(`Le thème "${theme.title}" n'a pas été modifié`);

			const updateThemeDetails = await updateTheme(theme.id, payload);
			if (updateThemeDetails.error) throw new Error(updateThemeDetails.error);

			// console.log(updateThemeDetails);
			
			await setThemes();
			sendMessageToPanel(`Le thème "${theme.title}" a été modifié`, 'var(--color-good-message)');
			displayOverlay(false);

		} catch (err) {
			sendMessageToPanel(err.message, 'var(--color-bad-message)');
		};
	});

	properties.forEach(prop => {
		const input = document.querySelector(`.edit-overlay .${prop}`);
		input.value = theme[prop] ? theme[prop] : "";
	});

	displayOverlay(true, editThemeBox);
};

/**
 * Creates a form on which we'd base a theme to set up the deletion depending on it
 * @param {object} theme The theme on which we'll base the delete theme form
 */
const setDeleteThemeForm = async (theme) => {
	document.querySelector('.delete-query').innerText = `Souhaitez-vous vraiment supprimer ${theme.title} ?`;

	const deleteThemeBtn = document.querySelector('.delete-overlay .delete-btn');
	const deleteThemeBtnClone = deleteThemeBtn.cloneNode(true);

	deleteThemeBtnClone.addEventListener('click', async (e) => {
		e.preventDefault;

		try {
			const deleteDetails = await deleteTheme(theme.id);
			if (deleteDetails.error) throw new Error(deleteDetails.error);

			await setThemes();
			sendMessageToPanel(`Le thème "${theme.title}" a été supprimé`, 'var(--color-good-message)');
			displayOverlay(false);
		} catch (err) {
			sendMessageToPanel(err.message, 'var(--color-bad-message)');
		};
	});

	deleteThemeBtn.parentElement.replaceChild(deleteThemeBtnClone, deleteThemeBtn);

	displayOverlay(true, deleteThemeBox);
};

/**
 * @async Adds all users with theme rights into a select box
 * @param {htmlnode} select The select tag inside which we want to add the users
 */
const displayUsersInSelect = async (select) => {
	try {
		const { users } = await getUsersWithThemeRights();

		let roles = {};
		users.forEach(user => {
			roles[user.role_name] = 1; // Define a property with the role_name value
		});
		// Object.keys(roles) : Array with role properties
		Object.keys(roles).forEach(role => {
			const optgroup = document.createElement('optgroup');
			optgroup.setAttribute('label', role);

			const filteredUsers = users.filter(user => user.role_name == role);

			if (filteredUsers.length > 0) {
				filteredUsers.forEach(user => {
					const option = document.createElement('option');
					option.setAttribute('value', user.username);
					option.innerText = user.username;
	
					optgroup.appendChild(option);
				});
			};
			
			select.appendChild(optgroup);
		});

	} catch (err) {
		console.error(err.message);
	};
};
displayUsersInSelect(document.querySelector('.order-user'));

/**
 * Fetches all themes and displays them
 */
const setThemes = async () => {
	const { themes } = await getAllThemes();

	search.addEventListener('input', async () => {
		await displayThemes(await filterThemes(themes));
	});
	orderProperty.addEventListener('change', async () => {
		await displayThemes(await filterThemes(themes));
	});
	orderAscending.addEventListener('change', async () => {
		await displayThemes(await filterThemes(themes));
	});
	orderUser.addEventListener('change', async () => {
		await displayThemes(await filterThemes(themes));
	});

	await displayThemes(await filterThemes(themes));
};

/**
 * @async
 * @param {array<Object>} themes 
 * @returns {array<Object>} themes
 */
const filterThemes = async (themes) => {
	if (!themes) return {message : "Aucun thème ne correspond à ces critères"};
	if (themes.length < 1) return {message : "Aucun thème ne correspond à ces critères"};

	// If search input is set
	let tmp = search.value ?
		themes.filter(theme => {
			// Checking if the search query contains any of the following values
			const res = [
				theme.title.toLowerCase(),
				theme.description.toLowerCase(),
				formatDate(theme.created_at),
				formatDate(theme.updated_at),
				theme.created_by.toLowerCase(),
				theme.updated_by.toLowerCase()
			].map(element => element.includes(search.value.toLowerCase()));
			return res.includes(true);
		})
		:
		themes
	;
	if (tmp.length < 1) return {message : "Aucun thème ne correspond à ces critères"};

	tmp = orderUser.value ?
		tmp.filter(theme => theme.users.map(user => user.name).includes(orderUser.value))
		:
		tmp
	;

	if (tmp.length < 1) return {message : "Aucun thème ne correspond à ces critères"};

	return tmp;
};

/**
 * Displays all themes passed as arguments
 * @param {Array<object>} themes 
 */
const displayThemes = async (themes) => {
	const container = document.querySelector('#themes-container'); 
	const cardsBox = document.createElement('div');
	cardsBox.classList.add('cards-box');

	setDetails(themes);

	// Emptying themes container
	container.innerHTML = '';

	if (themes.message) {
		container.innerHTML = `
			<div class="themes-message">
				<h1>:(</h1>
				<p>${themes.message}</p>
			</div>
		`;
		return;
	};
	// Looping on all sorted themes to add theme one by one
	const sortedThemes = sortByProperty(themes, orderProperty.value, JSON.parse(orderAscending.value));
	sortedThemes.forEach(theme => {
		const title = theme.title;
		const description = theme.description;
		const createdAt = formatDate(theme.created_at);
		const updatedAt = formatDate(theme.updated_at);
		const createdBy = theme.created_by;
		const updatedBy = theme.updated_by;
		const users = theme.users;

		const cardContainer = document.createElement('div');
		cardContainer.classList.add('card-container');

		const card = document.createElement('article');
		card.classList.add('theme-card');

		card.innerHTML = `
			<div class="theme-title">
				<h2>${title}</h2>
			</div>
			<div class="theme-stats">
				<p>Créé le ${createdAt} par ${createdBy}</p>
				<p>Modifié le ${updatedAt} par ${updatedBy}</p>
			</div>
			<div class="theme-description">
				<p>${description}</p>
			</div>
			<ul class="theme-users">
				${(() => {
					return users.map(user => {
						return `
							<li>
								<img src="/img/user.webp" alt="•">
								<p>${user.name}</p>
							</li>
						`;
					}).join('');
				})()}
			</ul>
		`;

		const btnContainer = document.createElement('div');
		btnContainer.classList.add('btn-container');

		card.appendChild(btnContainer);

		// Edit button
		const editBtn = document.createElement('button');
		editBtn.classList.add('edit');
		editBtn.addEventListener('click', async () => {
			await setEditThemeForm(theme, users);
		});

		// Delete button
		const deleteBtn = document.createElement('button');
		deleteBtn.classList.add('destroy');
		deleteBtn.addEventListener('click', async () => {
			await setDeleteThemeForm(theme);
		});

		btnContainer.appendChild(editBtn);
		btnContainer.appendChild(deleteBtn);

		cardContainer.appendChild(card);
		cardsBox.appendChild(cardContainer);
	});

	container.appendChild(cardsBox);
};

setThemes();