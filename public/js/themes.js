import { jwtDecode } from "./jwt-decode.js";

const jwtDecoded = jwtDecode(localStorage.getItem('Authorization'));

const hostname = window.location.href.split(window.location.pathname)[0];

// Overlay buttons
const insertThemeBtn = document.querySelector('#insert-theme-btn');
const detailsThemeBtn = document.querySelector('#details-theme-btn');

// Overlay stuff
const overlay = document.querySelector(".overlay");
const overlayBg = document.querySelector(".overlay-bg");
const insertThemeBox = document.querySelector(".insert-theme");
const detailsThemeBox = document.querySelector(".details-theme");
const editThemeBox = document.querySelector(".edit-theme");
const deleteThemeBox = document.querySelector(".delete-theme");

const insertAddChargedBtn = document.querySelector('.insert-theme .add-charged');
const editAddChargedBtn = document.querySelector('.edit-theme .add-charged');

const getUsersWithThemeRights = async () => {
	const res = await fetch(`${hostname}/api/users/theme_rights`, {
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
 * Adding charged fields to a charged list
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
		const parent = node.querySelector('.charged-list');

		const chargeRow = document.createElement('div');
		chargeRow.classList.add('charge-row');

		const select = document.createElement('select');
		select.classList.add('charge');

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
				option.innerText = `${user.username} (${user.firstname} ${user.lastname})`;

				optGroup.appendChild(option);
			};
			if (userId) select.value = userId;

			select.appendChild(optGroup);
		});
	
		// "Button" (div) for removing a user in charge for a theme
		const removeCharged = document.createElement('div');
		removeCharged.classList.add('remove-charged');
		removeCharged.innerText = '-';
		removeCharged.addEventListener('click', (e) => {
			parent.removeChild(chargeRow);
		});

		chargeRow.appendChild(select);
		chargeRow.appendChild(removeCharged);

		parent.insertBefore(chargeRow, node.querySelector('.add-charged'));
	} catch (err) {
		console.error(err.message);
	};
};

addChargedField(insertThemeBox);

insertAddChargedBtn.addEventListener('click', () => {
	addChargedField(insertThemeBox);
});

/**
 * Function displaying or hiding the overlay and its black blurred transparent background
 * @param {boolean} visible Specifies if the overlay must be visible or not
 * @param {*} boxName The name of the box we wish to display with the overlay
 */
const displayOverlay = (visible = true, boxName) => {
	// Checking if required overlay box is the one we requested
	if (boxName) {
		document.querySelectorAll('.overlay-box').forEach(box => {
			box.style.setProperty('display', box == boxName ? "flex" : "none");
		});
	};
	overlay.style.setProperty("display", visible ? "flex" : "none");
};

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

// Form infos
const title = document.getElementsByName('title')[0];
const description = document.getElementsByName('description')[0];

// Themes infos
const themesContainer = document.querySelector('#themes-container');
const themesNb = document.querySelector('.themes-number');

// Filter & order infos
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
		credentials:'include',
		cache:'no-cache',
		headers: {
			'Content-Type': 'application/json'
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
			'Content-Type': 'application/json'
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
			'Content-Type': 'application/json'
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
			'Content-Type': 'application/json'
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

/**
 * Function used to display a message in the top-left corner of the page (navbar not included)
 * @param {string} msg The message to send to the message panel
 * @param {string} color The color in which the message box will be painted
 */
const sendMessageToPanel = async (msg, color) => {
	const messageBox = document.createElement('div');
	messageBox.style.setProperty('background-color', color);
	messageBox.classList.add('message-box');

	const message = document.createElement('p');
	message.innerText = msg;

	messageBox.append(message);

	const messagePanel = document.querySelector('.message-panel')
	messagePanel.append(messageBox);

	setTimeout(() => {
		messagePanel.removeChild(messageBox);
	}, 5000);
};

// The event listener for the insert theme form's submit event
document.querySelector('.insert-theme form').addEventListener('submit', async (e) => {
	e.preventDefault();
	try {
		const title = document.querySelector('.insert-theme .title').value;
		const description = document.querySelector('.insert-theme .description').value;

		const users = await removeDuplicates(Array.from(document.querySelectorAll('.insert-theme .charge')).map(user => user.value));

		const insertDetails = await insertTheme({title, description, users});
		if (insertDetails.error) throw insertDetails.error;

		sendMessageToPanel(`Le thème "${insertDetails.theme.title}" a été créé`, 'var(--color-green)');
		await setThemes();
		displayOverlay(false);
		e.target.reset();
	} catch (err) {
		sendMessageToPanel(err.message, 'var(--color-red)');
	};
});

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
 * Set infos about the themes
 * @param {array} themes 
 */
const setInfos = (themes) => {

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
				console.log(users)
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
				console.log(users)
				return users.sort((a, b) => a.number < b.number ? 1 : -1)[0].name
			})()
		}
	];

	const infoContainer = document.querySelector('.info-container');
	infoContainer.innerHTML = "";
	stats.forEach(stat => {
		infoContainer.innerHTML += `
			<div class="infos-row">
				<p>${stat.name}</p>
				<hr>
				<span>${stat.value}</span>
			</div>
		`;
	});
};

/**
 * Turns 1/2 rows in the infos panel to light gray
 */
const setInfosRowColor = () => {
	document.querySelectorAll('.infos-row').forEach((row, i) => {
		row.style.backgroundColor = i % 2 ? "#ececec" : "transparent"
	});
};
setInfosRowColor();

/**
 * Sets the edit-theme form so it depends on which user we're editing
 * @param {object} theme The theme on which to base the edit form depending on what we're editing
 */
const setEditThemeForm = async (theme) => {
	const properties = ["title", "description"];

	// Getting form and emptying charged users list
	const form = document.querySelector('.edit-theme form');
	form.querySelectorAll('.charge-row').forEach(chargeRow => {
		chargeRow.parentElement.removeChild(chargeRow);
	});

	// Cloning the form to remove all the event listeners
	const formClone = form.cloneNode(true);
	theme.users.forEach(user => {
		addChargedField(editThemeBox, user.id);
	});
	formClone.querySelector('.add-charged').addEventListener('click', () => {
		addChargedField(editThemeBox);
	});

	// Replacing the previous form with the freshly created clone
	form.parentNode.replaceChild(formClone, form);

	formClone.addEventListener('submit', async (e) => {
		e.preventDefault();

		const title = document.querySelector('.edit-theme .title');
		const description = document.querySelector('.edit-theme .description');

		const charges = await removeDuplicates(Array.from(document.querySelectorAll('.edit-theme .charge')).map(charge => {
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

			console.log(updateThemeDetails);
			
			await setThemes();
			sendMessageToPanel(`Le thème "${theme.title}" a été modifié`, 'var(--color-green)');
			displayOverlay(false);

		} catch (err) {
			sendMessageToPanel(err.message, 'var(--color-red)');
		};
	});

	properties.forEach(prop => {
		const input = document.querySelector(`.edit-theme .${prop}`);
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

	const deleteThemeBtn = document.querySelector('.delete-theme .delete-btn');
	const deleteThemeBtnClone = deleteThemeBtn.cloneNode(true);

	deleteThemeBtnClone.addEventListener('click', async (e) => {
		e.preventDefault;

		try {
			const deleteDetails = await deleteTheme(theme.id);
			if (deleteDetails.error) {
				throw new Error(deleteDetails.error);
			};

			await setThemes();
			sendMessageToPanel(`Le thème "${theme.title}" a été supprimé`, 'var(--color-green)');
			displayOverlay(false);
		} catch (err) {
			sendMessageToPanel(err.message, 'var(--color-red)');
		};
	});

	deleteThemeBtn.parentElement.replaceChild(deleteThemeBtnClone, deleteThemeBtn);

	displayOverlay(true, deleteThemeBox);
};

/**
 * @async
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
 * Fetches all themes and display them
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

	tmp = sortByProperty(tmp, orderProperty.value, JSON.parse(orderAscending.value));

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

	setInfos(themes);

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
	// Looping on all themes to add theme one by one
	themes.forEach(theme => {
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

/**
 * Turns a timestamp into a formatted date string
 * @param {date} timestamp The timestamp we wish to convert
 * @returns {string} A date with the following format : DD/MM/YYYY
 */
const formatDate = (timestamp) => {
	const formatted = new Date(timestamp);

	const year = formatted.getFullYear();
	const month = ((formatted.getMonth()).toString()).length < 2 ? `0${formatted.getMonth()}` : formatted.getMonth();
	const date = ((formatted.getDate()).toString()).length < 2 ? `0${formatted.getDate()}` : formatted.getDate();

	return `${date}/${month}/${year}`;
};

setThemes();