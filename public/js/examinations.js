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

// Form infos
const title = document.getElementsByName('title')[0];
const duration = document.getElementsByName('duration')[0];
const startsAt = document.getElementsByName('starts-at')[0];
const endsAt = document.getElementsByName('ends-at')[0];
const requiredScore = document.getElementsByName('required-score')[0];

// examinations infos
const examinationsContainer = document.querySelector('#examinations-container');
const examinationsNb = document.querySelector('.examinations-number');

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

const setThemesInSelect = async (themes, select) => {
	select.innerHTML = `<option value="">-- Sélectionnez un thème</option>`
	select.innerHTML = sortByProperty(themes, 'title').map((theme) => `<option value="${theme.id}">${theme.title}</option>`).join('');
};

// The listener for the insert examination form's submit event
document.querySelector('.insert-overlay form').addEventListener('submit', async (e) => {
	e.preventDefault();
	try {
		const title = document.querySelector('.insert-overlay .title').value;
		const theme = document.querySelector('.insert-overlay .theme').value;
		const description = document.querySelector('.insert-overlay .description').value;

		const insertDetails = await insertTheme({title, description, users});
		if (insertDetails.error) throw new Error(insertDetails.error);

		console.log(insertDetails);

		sendMessageToPanel(`Le thème "${insertDetails.theme.title}" a été créé`, 'var(--color-good-message)');
		await setThemes();
		displayOverlay(false);
		e.target.reset();
	} catch (err) {
		sendMessageToPanel(err.message, 'var(--color-bad-message)');
	};
});

const setExaminations = async () => {
	const { examinations } = await getAllExaminations();
	const { themes } = await getAllThemes();
	
	await setThemesInSelect(themes, document.querySelector('.insert-overlay .theme'));
	await displayExaminations(await filterExaminations(examinations));
};

setExaminations();

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

const setFormFlexBasis = () => {
	const formRows = document.querySelectorAll('.insert-overlay .form-row');
	formRows.forEach(row => {
		for (let i = 0; i < row.children.length; i++) {
			row.children[i].style.setProperty('flex-basis', `${100 / row.children.length}%`);
		};
	});
};
setFormFlexBasis();

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
				examination.description ? examination.description.toLowerCase() : examination.description
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
	const sortedExams = sortByProperty(examinations, orderProperty.value, JSON.parse(orderAscending.value));
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
				${new Date(examination.starts_at) < new Date() && new Date(examination.ends_at) > new Date() ? `<p class="available">Actuellement disponible</p>` : `<p class="unavailable">Actuellement indisponible</p>`}
				<p>Disponible le ${formatDate(examination.starts_at)}</p>
				<p>Termine le ${formatDate(examination.ends_at)}</p>
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
				<p>${examination.required_score} points requis</p>
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
	console.log(search.value);
});
orderProperty.addEventListener('change', () => {
	setExaminations(orderProperty.value);
	console.log(orderProperty.value);
});
orderAscending.addEventListener('change', () => {
	setExaminations(orderAscending.value);
	console.log(orderAscending.value);
});
showActives.addEventListener('change', () => {
	setExaminations(showActives.value);
	console.log(showActives.value);
});
