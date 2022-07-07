import { jwtDecode } from "./jwt-decode.js";
import { capitalize, formatDate, sendMessageToPanel, sortByProperty } from './utils.js';

const jwtDecoded = jwtDecode(localStorage.getItem('Authorization'));

const hostname = window.location.href.split(window.location.pathname)[0];

// Overlay buttons
const insertExaminationBtn = document.querySelector('#insert-overlay-btn');
const detailsExaminationBtn = document.querySelector('#details-overlay-btn');

// Overlay stuff
const overlay = document.querySelector(".overlay");
const overlayBg = document.querySelector(".overlay-bg");
const insertExaminationBox = document.querySelector(".insert-overlay");
const detailsExaminationBox = document.querySelector(".details-overlay");
const editExaminationBox = document.querySelector(".edit-overlay");
const deleteExaminationBox = document.querySelector(".delete-overlay");

const insertAddChargedBtn = document.querySelector('.insert-overlay .add-charged');
const editAddChargedBtn = document.querySelector('.edit-overlay .add-charged');

// Filter & order params
const search = document.querySelector('.search');
const orderProperty = document.querySelector('.order-property');
const orderAscending = document.querySelector('.order-ascending');
const showActives = document.querySelector('.show-actives');

// Insert form
const title = document.querySelector('.insert-overlay .title');
const theme = document.querySelector('.insert-overlay .theme');
const description = document.querySelector('.insert-overlay .description');
const duration = document.querySelector('.insert-overlay .duration');
const alwaysAvailable = document.querySelector('.insert-overlay .always-available');
const startsAt = document.querySelector('.insert-overlay .starts-at');
const endsAt = document.querySelector('.insert-overlay .ends-at');
const requiredScore = document.querySelector('.insert-overlay .required-score');

// examinations infos
const examinationsContainer = document.querySelector('#examinations-container');
const examinationsNb = document.querySelector('.examinations-number');

const toggleAvailability = (bool) => {
	const status = bool ? !bool : alwaysAvailable.checked;

	const inputs = document.querySelectorAll('.availability input');
	if (status) {
		inputs.forEach(input => {
			input.setAttribute('disabled', 'true');
		});
	} else {
		inputs.forEach(input => {
			input.removeAttribute('disabled');
		});
	};
};

alwaysAvailable.addEventListener('click', () => {
	toggleAvailability()
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

insertExaminationBtn.addEventListener('click', () => {
	displayOverlay(true, insertExaminationBox);
});

detailsExaminationBtn.addEventListener('click', () => {
	displayOverlay(true, detailsExaminationBox);
});

overlayBg.addEventListener('click', () => {
	displayOverlay(false);
});

document.querySelectorAll('.overlay-closer').forEach(overlayCloser => {
	overlayCloser.addEventListener('click', () => {
		displayOverlay(false);
	});
});

/**
 * Get all examinations
 * @async
 * @returns examinations
 */
const getAllExaminations = async () => {
	const res = await fetch(`${hostname}/api/examinations`, {
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
 * Insert an examination into the DB
 * @param {object} payload An object containing the properties to insert
 * @returns {object} The created examination
 */
const insertExamination = async (payload) => {
	const res = await fetch(`${hostname}/api/examinations`, {
		method: 'POST',
		credentials: 'include',
		cache: 'no-cache',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${localStorage.getItem('Authorization')}`
		},
		body: JSON.stringify(payload)
	});
	return await res.json();
};

/**
 * Updates an examination from the DB
 * @param {number} id Integer referring to a examination's id
 * @param {object} payload An object containing the properties to modify
 * @returns {object} The updated examination
 */
const updateExamination = async (id, payload) => {
	const res = await fetch(`${hostname}/api/examinations/${id}`, {
		method: 'PUT',
		credentials: 'include',
		cache: 'no-cache',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${localStorage.getItem('Authorization')}`
		},
		body: JSON.stringify(payload)
	});
	return await res.json();
};

/**
 * Deletes an examination from the DB
 * @param {number} id Integer referring to a examination's id
 * @returns {object} The deleted examination
 */
const deleteExamination = async (id) => {
	const res = await fetch(`${hostname}/api/examinations/${id}`, {
		method: 'DELETE',
		credentials: 'include',
		cache: 'no-cache',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${localStorage.getItem('Authorization')}`
		}
	});
	console.log(res);
	return await res.json();
};

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

const addThemesInSelect = async (select, id) => {
	const { themes } = await getAllThemes();

	select.innerHTML = `<option value="" disabled ${id ? '' : 'selected'}>-- Sélectionnez un thème</option>`;
	select.innerHTML += sortByProperty(themes, 'title').map((theme) => `<option value="${theme.id}" ${id ? theme.id == id ? 'selected' : '' : ''}>${theme.title}</option>`).join('');
};

// The listener for the insert examination form's submit event
document.querySelector('.insert-overlay form').addEventListener('submit', async (e) => {
	e.preventDefault();
	try {
		const payload = {
			title : title.value,
			theme_id : theme.value,
			description : description.value,
			duration : duration.value,
			always_available : alwaysAvailable.checked,
			starts_at : !alwaysAvailable.checked ? startsAt.value : null,
			ends_at : !alwaysAvailable.checked ? endsAt.value : null,
			required_score : requiredScore.value
		};

		const insertDetails = await insertExamination(payload);
		if (insertDetails.error) throw new Error(insertDetails.error);

		console.log(insertDetails);

		sendMessageToPanel(`L'examen "${insertDetails.examination.title}" a été créé`, 'var(--color-good-message)');
		await setExaminations();
		displayOverlay(false);
		e.target.reset();
		toggleAvailability(false);

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

	const detailsContainer = document.querySelector('.details-container');
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
 * @param {object} examination The theme on which to base the edit form depending on what we're editing
 */
const setEditExaminationForm = async (examination) => {
	// Getting form and emptying charged users list
	const form = document.querySelector('.edit-overlay form');

	// Cloning the form to remove all the event listeners
	const formClone = form.cloneNode(true);

	// Replacing the previous form with the freshly created clone
	form.parentNode.replaceChild(formClone, form);

	const allowedProperties = ["title", "theme_id", "description", "duration", "always_available", "starts_at", "ends_at", "required_score"];

	formClone.querySelector(`.title`).value = examination.title;
	addThemesInSelect(formClone.querySelector(`.theme-id`), examination.theme_id);
	formClone.querySelector(`.description`).value = examination.description;
	formClone.querySelector(`.duration`).value = examination.duration;
	formClone.querySelector(`.always-available`).value = examination.always_available;
	formClone.querySelector(`.starts-at`).value = examination.starts_at;
	formClone.querySelector(`.ends-at`).value = examination.ends_at;
	formClone.querySelector(`.required-score`).value = examination.required_score;

	formClone.addEventListener('submit', async (e) => {
		e.preventDefault();

		
		const payload = {
			title : document.querySelector('.edit-overlay .title'),
			theme_id : document.querySelector('.edit-overlay .theme-id'),
			description : document.querySelector('.edit-overlay .description'),
			duration : document.querySelector('.edit-overlay .duration'),
			always_available : document.querySelector('.edit-overlay .always-available'),
			starts_at : document.querySelector('.edit-overlay .starts-at'),
			ends_at : document.querySelector('.edit-overlay .ends-at'),
			required_score : document.querySelector('.edit-overlay .required-score')
		};

		Object.keys(payload).forEach(property => {
			if (!allowedProperties.includes(property)) {
				throw new Error(`Property ${property} is not allowed`);
			};
		});

		try {
			// Not updating if nothing to change
			if (Object.keys(payload).length < 1) throw new Error(`Le thème "${examination.title}" n'a pas été modifié`);

			const updateThemeDetails = await updateTheme(examination.id, payload);
			if (updateThemeDetails.error) throw new Error(updateThemeDetails.error);

			console.log(updateThemeDetails);
			
			await setThemes();
			sendMessageToPanel(`Le thème "${examination.title}" a été modifié`, 'var(--color-good-message)');
			displayOverlay(false);

		} catch (err) {
			sendMessageToPanel(err.message, 'var(--color-bad-message)');
		};
	});

	displayOverlay(true, editExaminationBox);
};

/**
 * Creates a form on which we'd base a examination to set up the deletion depending on it
 * @param {object} examination The examination on which we'll base the delete examination form
 */
const setDeleteExaminationForm = async (examination) => {
	document.querySelector('.delete-query').innerText = `Souhaitez-vous vraiment supprimer ${examination.title} ?`;

	const deleteExaminationBtn = document.querySelector('.delete-overlay .delete-btn');
	const deleteExaminationBtnClone = deleteExaminationBtn.cloneNode(true);

	deleteExaminationBtnClone.addEventListener('click', async (e) => {
		e.preventDefault;

		try {
			const deleteDetails = await deleteExamination(examination.id);
			// console.log(deleteDetails);

			if (deleteDetails.error) throw new Error(deleteDetails.error);

			await setExaminations();
			sendMessageToPanel(`L'examen "${examination.title}" a été supprimé`, 'var(--color-good-message)');
			displayOverlay(false);
		} catch (err) {
			sendMessageToPanel(err.message, 'var(--color-bad-message)');
		};
	});

	deleteExaminationBtn.parentElement.replaceChild(deleteExaminationBtnClone, deleteExaminationBtn);

	displayOverlay(true, deleteExaminationBox);
};

const setFormRowsFlexBasis = (formRows) => {
	formRows.forEach(row => {
		for (let i = 0; i < row.children.length; i++) {
			row.children[i].style.setProperty('flex-basis', `${100 / row.children.length}%`);
		};
	});
};
setFormRowsFlexBasis(document.querySelectorAll('.insert-overlay .form-row'));

const setExaminations = async () => {
	const { examinations } = await getAllExaminations();
	
	await addThemesInSelect(document.querySelector('.insert-overlay .theme'));
	await displayExaminations(await filterExaminations(examinations));
};

setExaminations();

/**
 * Filtering by search query
 * @param {Array<object>} examinations 
 * @returns {Array<object>} filtered users
 */
const filterExaminations = (examinations) => {
	if (!examinations) return {message : "Aucun examen ne correspond à ces critères"};
	if (examinations.length < 1) return {message : "Aucun examen ne correspond à ces critères"};

	let tmp = examinations;

	// If search input is set
	tmp = search.value ?
		tmp.filter(examination => {
			// Checking if the search query contains any of the following values
			const res = [
				examination.title.toLowerCase(),
				examination.description ? examination.description.toLowerCase() : examination.description,
				examination.theme_title.toLowerCase()
			].map(element => element ? element.includes(search.value.toLowerCase()) : false);
			return res.includes(true);
		})
		:
		tmp
	;

	if (tmp.length < 1) return {message : "Aucun examen ne correspond à ces critères"};

	// If show actives checkbox is set
	tmp = showActives.checked ?
		tmp.filter(examination => examination.active)
		:
		tmp
	;

	if (tmp.length < 1) return {message : "Aucun examen ne correspond à ces critères"};

	return tmp;
};

/**
 * Displays all examinations passed as arguments
 * @param {Array<object>} examinations 
 */
const displayExaminations = async (examinations) => {
	const container = document.querySelector('#examinations-container'); 
	const cardsBox = document.createElement('div');
	cardsBox.classList.add('cards-box');

	// setInfos(examinations);

	// Emptying examinations container
	container.innerHTML = '';

	if (examinations.message) {
		container.innerHTML = `
			<div class="examinations-message">
				<h1>:(</h1>
				<p>${examinations.message}</p>
			</div>
		`;
		return;
	};

	// Looping on all sorted examinations to add them one by one
	const sortedExams = sortByProperty(examinations, orderProperty.value.replaceAll('-', '_'), JSON.parse(orderAscending.value));
	sortedExams.forEach(examination => {

		const cardContainer = document.createElement('div');
		cardContainer.classList.add('card-container');

		const card = document.createElement('article');
		card.classList.add('examination-card');
		
		const formatInterval = (interval) => {
			const hours = interval.hours ? interval.hours : '00';
			const minutes = interval.minutes ? interval.minutes : '00';

			interval = `${hours}h${minutes}`;

			return interval;
		}

		card.innerHTML = `
			<div class="examination-title">
				<h2>${examination.title}</h2>
			</div>
			<div class="examination-stats">
				<p>Créé le ${formatDate(examination.created_at, '$D/$M/$Y à $H:$m')} par ${examination.created_by}</p>
				<p>Modifié le ${formatDate(examination.updated_at, '$D/$M/$Y à $H:$m')} par ${examination.updated_by}</p>
			</div>
			<div class="examination-theme">
				<p>${examination.theme_title}</p>
			</div>
			<div class="examination-duration">
				<div>
					<img src="/img/stopwatch.svg" alt="stopwatch" title="Durée moyenne de l'examen">
					<p>${formatInterval(examination.duration)}</p>
				</div>
			</div>
			<div class="examination-availability">
				
				${(() => {
					// console.log(examination.always_available);
					// console.log(examination.starts_at);
					// console.log(examination.ends_at);

					if (examination.always_available) {
						return `<p class="available">Éternellement disponible</p>`;
					} else {
						return `
							${new Date(examination.starts_at) < new Date() && new Date(examination.ends_at) > new Date() ?
								`<p class="available">Actuellement disponible</p>`
								:
								`<p class="unavailable">Actuellement indisponible</p>`
							}
							<p>Disponible le ${formatDate(examination.starts_at)}</p>
							<p>Termine le ${formatDate(examination.ends_at)}</p>
						`;
					};
				})()}
			</div>
			${(() => {
				if (examination.description !== null) {
					return `
						<div class="examination-description">
							<p>${examination.description}</p>
						</div>
					`;
				} else {
					return '';
				};
			})()}
			<div class="examination-required-score">
				<p>${examination.required_score} point${examination.required_score > 1 ? 's' : ''} requis</p>
			</div>
		`;

		const btnContainer = document.createElement('div');
		btnContainer.classList.add('btn-container');

		card.appendChild(btnContainer);

		const toggleSwitch = document.createElement('div');
		toggleSwitch.classList.add('toggle-switch');

		const label = document.createElement('label');
		label.classList.add('switch');

		const input = document.createElement('input');
		input.type = 'checkbox';
		
		if (examination.active) {
			input.setAttribute('checked', '');
		} else {
			input.removeAttribute('checked');
		};

		input.addEventListener('click', async (e) => {
			const active = input.checked;
			const updateExaminationDetails = await updateExamination(examination.id, {active});
			examination.active = active;

			if (!input.ckecked && showActives.checked) {
				setTimeout(setExaminations, 1000);
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
			await setEditExaminationForm(examination);
		});

		// Delete button
		const deleteBtn = document.createElement('button');
		deleteBtn.classList.add('destroy');
		deleteBtn.addEventListener('click', async () => {
			await setDeleteExaminationForm(examination);
		});

		btnContainer.appendChild(toggleSwitch);
		btnContainer.appendChild(editBtn);
		btnContainer.appendChild(deleteBtn);

		cardContainer.appendChild(card);
		cardsBox.appendChild(cardContainer);
	});

	container.appendChild(cardsBox);
};

search.addEventListener('input', () => {
	setExaminations(search.value);
});
orderProperty.addEventListener('change', () => {
	setExaminations(orderProperty.value);
});
orderAscending.addEventListener('change', () => {
	setExaminations(orderAscending.value);
});
showActives.addEventListener('change', () => {
	setExaminations(showActives.value);
});
