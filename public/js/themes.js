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

const addChargedBtn = document.querySelector('.add-charged');

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

const addChargedField = async () => {
	try {
		// Fetching users who have the rights to add or update roles
		const getUsersDetails = await getUsersWithThemeRights();
		if (getUsersDetails.error) throw new Error(getUsersDetails.error);

		const { users } = getUsersDetails; // Extracting users from getUsersDetails

		// Adding a new field for a new charged user
		const parent = document.querySelector('.charged-list');

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
	
		parent.insertBefore(chargeRow, addChargedBtn);
	} catch (err) {
		console.error(err.message);
	};
};

addChargedField();

addChargedBtn.addEventListener('click', addChargedField);

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

(async () => {
	const res = await getAllThemes();
	console.log(res);
})

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
const removeDuplicates = (array) => {
	let tmp = {};
	array.forEach(value => {
		tmp[value] = 1;
	});
	return Object.keys(tmp);
};

const sendMessageToPanel = async (msg, color) => {
	const messageBox = document.createElement('div');
	messageBox.style.setProperty('background-color', `var(--color-${color})`);
	messageBox.classList.add('message-box');

	const message = document.createElement('p');
	message.innerText = msg;

	messageBox.append(message);

	const messagePanel = document.querySelector('.message-panel')
	messagePanel.append(messageBox);

	setTimeout(() => {
		messagePanel.removeChild(messageBox);
	}, 5000);
}

document.querySelector('.insert-theme form').addEventListener('submit', async (e) => {
	e.preventDefault();
	try {
		const title = document.querySelector('.insert-theme .title').value;
		const description = document.querySelector('.insert-theme .description').value;

		const users = removeDuplicates(Array.from(document.querySelectorAll('.insert-theme .charge')).map(user => user.value));

		const insertDetails = await insertTheme({title, description, users});
		if (insertDetails.error) throw insertDetails.error;

		console.log(insertDetails);

		sendMessageToPanel(`Le thème "${insertDetails.theme.title}" a été créé`, 'green');
		await setThemes();
		displayOverlay(false);
		e.target.reset();
	} catch (err) {
		sendMessageToPanel(err.message, 'red');
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
	document.querySelector('.themes-number').innerText = themes.length;
};

/**
 * Turns 1/2 rows in the infos panel to light gray
 */
const setInfosRowColor = () => {
	document.querySelectorAll('.infos-row').forEach((row, i) => {
		if ((i % 2)) {
			row.style.backgroundColor = "#ececec";
		};
	});
};
setInfosRowColor();

/**
 * Sets the edit-theme form so it depends on which user we're editing
 * @param {object} user The theme on which to base the edit form depending on who we're editing
 */
const setEditThemesForm = async (theme) => {
	const properties = ["title", "description"];

	const form = document.querySelector('.edit-theme form');
	const formClone = form.cloneNode(true);

	form.parentNode.replaceChild(formClone, form);

	formClone.addEventListener('submit', async (e) => {
		e.preventDefault();

		const title = document.querySelector('.edit-theme .title');
		const description = document.querySelector('.edit-theme .description');

		const values = {
			title : title.value.toString(),
			description : description.value.toString()
		};
		
		let payload = {};
		Object.keys(values).forEach(property => {
			if (values[property] != user[property] && values[property] != "") {
				payload[property] = values[property];
			};
		});

		try {
			// Not updating if nothing to change
			if (Object.keys(payload).length < 1) throw new Error("Le thème n'a pas été modifié");

			const updateThemeDetails = await updateTheme(theme.id, payload);

			displayOverlay(false);
			setThemes();
		} catch (err) {
			alert(err.message);
		};
	});

	properties.forEach(prop => {
		const input = document.querySelector(`.edit-user .${prop}`);
		input.value = user[prop] ? user[prop] : "";
	});

	displayOverlay(true, editUserBox);
};

const setDeleteThemeForm = async (user) => {
	document.querySelector('.delete-query').innerText = `Souhaitez-vous vraiment supprimer ${user.firstname} ${user.lastname} ?`;

	const deleteUserBtn = document.querySelector('.delete-user .delete-btn');
	const deleteUserBtnClone = deleteUserBtn.cloneNode(true);

	deleteUserBtnClone.addEventListener('click', async (e) => {
		e.preventDefault;

		try {
			const deleteDetails = await deleteUser(user.id);

			await setUsers();
			displayOverlay(false);
		} catch (err) {
			alert(err.message);
		};
	});

	deleteUserBtn.parentElement.replaceChild(deleteUserBtnClone, deleteUserBtn);

	displayOverlay(true, deleteUserBox);
};

const setThemes = async () => {
	const { themes } = await getAllThemes();
	displayThemes(themes);
}

const displayThemes = async (themes) => {
	const container = document.querySelector('#themes-container');
	const cardsBox = document.createElement('div');
	cardsBox.classList.add('cards-box');

	setInfos(themes);

	// Emptying themes container
	container.innerHTML = '';

	// Looping on all themes to add theme one by one
	themes.forEach(theme => {
		const title = theme.title;
		const description = theme.description;
		const createdAt = formatDate(theme.created_at);
		const updatedAt = formatDate(theme.updated_at);
		const createdBy = theme.created_by;
		const updatedBy = theme.updated_by;

		const cardContainer = document.createElement('div');
		cardContainer.classList.add('card-container');

		const themeCard = document.createElement('article');
		themeCard.classList.add('theme-card');

		themeCard.innerHTML += `
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
		`;
		cardContainer.appendChild(themeCard);
		cardsBox.appendChild(cardContainer);
	});

	container.appendChild(cardsBox);
};

const formatDate = (rawDate) => {
	const formatted = new Date(rawDate);

	const year = formatted.getFullYear();
	const month = ((formatted.getMonth()).toString()).length < 2 ? `0${formatted.getMonth()}` : formatted.getMonth();
	const date = ((formatted.getDate()).toString()).length < 2 ? `0${formatted.getDate()}` : formatted.getDate();

	return `${year}/${month}/${date}`;
};

setThemes();