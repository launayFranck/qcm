import { jwtDecode } from "./jwt-decode.js";
import { capitalize, formatDate, sendMessageToPanel } from './utils.js';

const jwtDecoded = jwtDecode(localStorage.getItem('Authorization'));

const hostname = window.location.href.split(window.location.pathname)[0];

// Overlay buttons
const insertExaminationBtn = document.querySelector('#insert-examination-btn');
const detailsExaminationBtn = document.querySelector('#details-examination-btn');

// Overlay stuff
const overlay = document.querySelector(".overlay");
const overlayBg = document.querySelector(".overlay-bg");
const insertExaminationBox = document.querySelector(".insert-examination");
const detailsExaminationBox = document.querySelector(".details-examination");
const editExaminationBox = document.querySelector(".edit-examination");
const deleteExaminationBox = document.querySelector(".delete-examination");

const insertAddChargedBtn = document.querySelector('.insert-examination .add-charged');
const editAddChargedBtn = document.querySelector('.edit-examination .add-charged');

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

// Form infos
const title = document.getElementsByName('title')[0];
const duration = document.getElementsByName('duration')[0];
const startsAt = document.getElementsByName('starts-at')[0];
const endsAt = document.getElementsByName('ends-at')[0];
const requiredScore = document.getElementsByName('required-score')[0];

// examinations infos
const examinationsContainer = document.querySelector('#examinations-container');
const examinationsNb = document.querySelector('.examinations-number');

// Filter & order infos
const search = document.querySelector('.search');
const orderProperty = document.querySelector('.order-property');
const orderAscending = document.querySelector('.order-ascending');
const orderUser = document.querySelector('.order-user');

/**
 * Get all examinations
 * @async
 * @returns examinations
 */
 const getAllExaminations = async () => {
	const res = await fetch(`${hostname}/api/examinations`, {
		method: 'GET',
		credentials:'include',
		cache:'no-cache',
		headers: {
			'Content-Type': 'application/json'
		}
	});
	return await res.json();
};

const setExaminations = async () => {
	const {examinations} = await getAllExaminations();
	await displayExaminations(examinations);
};

setExaminations();

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

	// Looping on all examinations to add them one by one
	examinations.forEach(examination => {
		console.log(examination);

		const title = examination.title;
		const description = examination.description;
		const createdAt = formatDate(examination.created_at);
		const updatedAt = formatDate(examination.updated_at);
		const createdBy = examination.created_by;
		const updatedBy = examination.updated_by;
		const users = examination.users;

		const cardContainer = document.createElement('div');
		cardContainer.classList.add('card-container');

		const card = document.createElement('article');
		card.classList.add('examination-card');

		card.innerHTML = `
			<div class="examination-title">
				<h2>${title}</h2>
			</div>
			<div class="examination-stats">
				<p>Créé le ${createdAt} par ${createdBy}</p>
				<p>Modifié le ${updatedAt} par ${updatedBy}</p>
			</div>
			<div class="examination-description">
				<p>${description}</p>
			</div>
		`;

		const btnContainer = document.createElement('div');
		btnContainer.classList.add('btn-container');

		card.appendChild(btnContainer);

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

		btnContainer.appendChild(editBtn);
		btnContainer.appendChild(deleteBtn);

		cardContainer.appendChild(card);
		cardsBox.appendChild(cardContainer);
	});

	container.appendChild(cardsBox);
};