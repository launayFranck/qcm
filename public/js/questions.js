import { jwtDecode } from "./jwt-decode.js";
import { capitalize, displayOverlay, formatDate, sendMessageToPanel, sortByProperty } from './utils.js';

const jwtDecoded = jwtDecode(localStorage.getItem('Authorization'));

const hostname = window.location.href.split(window.location.pathname)[0];

// Overlay buttons
const insertQuestionBtn = document.querySelector('#insert-overlay-btn');
const detailsQuestionBtn = document.querySelector('#details-overlay-btn');

// Overlay stuff
const overlay = document.querySelector(".overlay");
const overlayBg = document.querySelector(".overlay-bg");
const insertQuestionBox = document.querySelector(".insert-overlay");
const detailsQuestionBox = document.querySelector(".details-overlay");
const editQuestionBox = document.querySelector(".edit-overlay");
const deleteQuestionBox = document.querySelector(".delete-overlay");

const insertAddResponseBtn = document.querySelector('.insert-overlay .add-removable');
const editAddResponseBtn = document.querySelector('.edit-overlay .add-removable');

/**
 * Get all questions
 * @async
 * @returns {Array<object>} questions
 */
const getQuestions = async (filters) => {
	const res = await fetch(`${hostname}/api/questions`, {
		method: 'GET',
		credentials: 'include',
		cache: 'no-cache',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${localStorage.getItem('Authorization')}`
		},
		body: JSON.stringify(filters)
	});
	return await res.json();
};

/**
 * Insert a new question in the DB
 * @param {object} data
 * @returns {object} The new question
 */
const insertQuestion = async (data) => {
	const res = await fetch(`${hostname}/api/questions`, {
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
 * Updates a question from the DB
 * @param {number} id Integer referring to a question's id
 * @param {object} payload An object containing the properties to modify
 * @returns {object} The updated question
 */
const updateQuestion = async (id, payload) => {
	const res = await fetch(`${hostname}/api/questions/${id}`, {
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
 * Deletes a question from the DB
 * @param {number} id Integer referring to a question's id
 * @returns {object} The deleted question
 */
const deleteQuestion = async (id) => {
	const res = await fetch(`${hostname}/api/Questions/${id}`, {
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
 * Get all responses linked to a specific question
 * @async
 * @returns {Array<object>} Responses linked to the specified question
 */
 const getResponsesByQuestionId = async (id) => {
	const res = await fetch(`${hostname}/api/responses/question/${id}`, {
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
 * 
 * @param {*} select 
 * @param {object} params An object inside which will be stored the id and defaultText
 */
const addThemesInSelect = async (select, params = {id: undefined, defaultText: "-- Sélectionnez un thème", hasHeaderOption: true}) => {
	if (params.defaultText === undefined) params.defaultText = "-- Sélectionnez un thème";
	if (params.hasHeaderOption === undefined) params.hasHeaderOption = true;

	const { themes } = await getAllThemes();

	select.innerHTML = `${params.hasHeaderOption ? `<option value="" disabled ${params.id ? '' : 'selected'}>${params.defaultText}</option>` : ``}`;
	select.innerHTML += sortByProperty(themes, 'title').map((theme) => `<option value="${theme.id}" ${params.id ? theme.id == params.id ? 'selected' : '' : ''}>${theme.title}</option>`).join('');
};

let addResponseFieldCalls = 0;
/**
 * Adding response field in a question creation / edition overlay
 * @param {htmlnode} node The html node in which adding the response field
 * @param {object} response The response we want to set by default (optional)
 */
const addResponseField = async (node, response) => {
	try {
		// Adding a new field for a new response
		const parent = node.querySelector('.removable-list');

		const removableRow = document.createElement('div');
		removableRow.classList.add('removable-row');

		// "Button" (input type radio) to select the correct response
		const responseTag = `resp-${(new Date()).getTime()}-${Math.floor(Math.random() * 1000000)}-${addResponseFieldCalls}`;
		console.log(responseTag);

		const correct = document.createElement('input');
		correct.type = "radio";
		correct.classList.add('correct-btn');
		correct.setAttribute('name', 'correct');
		correct.setAttribute('id', responseTag);
		if (response) {
			if (response.correct) correct.setAttribute('checked', '');
		} else if (addResponseFieldCalls === 0) correct.setAttribute('checked', '');
		removableRow.appendChild(correct);

		const correctLabel = document.createElement('label');
		correctLabel.classList.add('correct-label');
		correctLabel.setAttribute('title', 'Cliquez ici pour définir cette réponse comme étant la bonne réponse');
		correctLabel.setAttribute('for', responseTag);
		removableRow.appendChild(correctLabel);

		const input = document.createElement('input');
		input.classList.add('response');
		input.type = 'text';
		input.setAttribute('id', responseTag);
		if (response) input.value = (response.title.split('<br>')).map((txt, i) => {
			if (i === (response.title.split('<br>')).length - 1) {
				return txt;
			} else {
				return txt + "\n";
			}
		});
		removableRow.appendChild(input);
	
		// "Button" (div) for removing a response linked to a question
		const removeRemovable = document.createElement('div');
		removeRemovable.classList.add('remove-removable');
		removeRemovable.innerText = '-';
		removeRemovable.setAttribute('title', 'Cliquez ici pour supprimer cette réponse de la liste des réponses disponibles');

		removeRemovable.addEventListener('click', (e) => {
			parent.removeChild(removableRow);
		});
		removableRow.appendChild(removeRemovable);

		parent.insertBefore(removableRow, node.querySelector('.add-removable'));
		addResponseFieldCalls += 1;
	} catch (err) {
		console.error(err.message);
	};
};

// addResponseField(insertQuestionBox);

insertAddResponseBtn.addEventListener('click', () => {
	addResponseField(insertQuestionBox);
});

insertQuestionBtn.addEventListener('click', () => {
	displayOverlay(true, insertQuestionBox);
});

detailsQuestionBtn.addEventListener('click', () => {
	displayOverlay(true, detailsQuestionBox);
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
const orderTheme = document.querySelector('.order-theme');

// The listener for the insert question form's submit event
document.querySelector('.insert-overlay form').addEventListener('submit', async (e) => {
	e.preventDefault();
	try {
		const title = document.querySelector('.insert-overlay .title').value.trim();
		if (title.length < 1) throw new Error(`L'intitulé de la question ne peut être vide`);

		const correction = document.querySelector('.insert-overlay .correction').value.trim();
		if (correction.length < 1) throw new Error(`La correction ne peut être vide`);

		const theme = document.querySelector('.insert-overlay .theme').value.trim();
		if (theme.length < 1) throw new Error(`Le thème ne peut être vide`);

		const score = document.querySelector('.insert-overlay .score').value.trim();
		if ((score.toString()).length < 1) throw new Error(`Le score ne peut être vide`);
		if (score < 0) throw new Error(`Le score ne peut être négatif`);

		const responses = Array.from(document.querySelectorAll('.insert-overlay .removable-row')).map(row => {
			if ((row.querySelector('.response').value.trim()).length < 1) throw new Error('Veuillez compléter les champs des réponses');
			return {
				title : row.querySelector('.response').value,
				correct : row.querySelector('.correct-btn').checked
			};
		});
		if (responses.length < 1) throw new Error(`Veuillez fournir au moins une réponse`);

		const insertDetails = await insertQuestion({
			title,
			correction,
			theme_id : parseInt(theme),
			score,
			responses
		});
		if (insertDetails.error) throw new Error(insertDetails.error);
		console.log(insertDetails.question);

		addResponseFieldCalls = 0;
		sendMessageToPanel(`La question #Q${insertDetails.question.question.id} a été créée`, 'var(--color-good-message)');
		await setQuestions();
		displayOverlay(false);
		e.target.reset();
	} catch (err) {
		sendMessageToPanel(err.message, 'var(--color-bad-message)');
	};
});

/**
 * Set details about the questions
 * @param {array} questions 
 */
const setDetails = (questions) => {
	const stats = [
		{
			name : 'Nombre de questions',
			value : questions.length
		},
		{
			name : "Nombre min d'utilisateur",
			value : questions.sort((a, b) => a.users.length > b.users.length ? 1 : -1)[0].users.length
		},
		{
			name : "Nombre max d'utilisateur",
			value : questions.sort((a, b) => a.users.length < b.users.length ? 1 : -1)[0].users.length
		},
		{
			name : "Utilisateur gérant le moins de questions",
			value : (() => {
				const usersNb = {};
				questions.forEach(question => {
					question.users.forEach(user => {
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
			name : "Utilisateur gérant le plus de questions",
			value : (() => {
				const usersNb = {};
				questions.forEach(question => {
					question.users.forEach(user => {
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
 * @param {object} question The question on which to base the edit form depending on what we're editing
 */
const setEditQuestionForm = async (question) => {
	// Getting form and emptying response list
	const form = document.querySelector('.edit-overlay form');
	form.querySelectorAll('.removable-row').forEach(responseRow => {
		responseRow.parentElement.removeChild(responseRow);
	});

	// Cloning the form to remove all the event listeners
	const formClone = form.cloneNode(true);
	formClone.querySelector('.add-removable').addEventListener('click', () => {
		addResponseField(editQuestionBox);
	});

	// Replacing the previous form with the freshly created clone
	form.parentNode.replaceChild(formClone, form);

	// Setting the questions' title into the edit form, replacing all the <br> with line breaks (\n)
	formClone.querySelector(`.title`).value = (question.title.split('<br>')).map((txt, i) => {
		return `${txt}${i === (question.title.split('<br>')).length - 1 ? '' : '\n'}`;
	}).join('');
	formClone.querySelector(`.correction`).value = question.correction;
	formClone.querySelector(`.score`).value = question.score;
	formClone.querySelector(`.theme`).value = question.theme_id;
	question.responses.forEach(response => {
		addResponseField(formClone, response);
	});

	formClone.addEventListener('submit', async (e) => {
		e.preventDefault();
		try {
			const title = formClone.querySelector('.title').value.trim();
			if (title.length < 1) throw new Error(`L'intitulé de la question ne peut être vide`);
			console.log((title.replace(/(?:\r\n|\r|\n)/g, '<br>')));

			const correction = formClone.querySelector('.correction').value.trim();
			if (correction.length < 1) throw new Error(`La correction ne peut être vide`);

			const theme = formClone.querySelector('.theme').value.trim();
			if (theme.length < 1) throw new Error(`Le thème ne peut être vide`);

			const score = formClone.querySelector('.score').value.trim();
			if (score.length < 1) throw new Error(`Le score ne peut être vide`);
			if (score < 0) throw new Error(`Le score ne peut être négatif`);

			const responses = Array.from(formClone.querySelectorAll('.removable-row')).map(row => {
				if ((row.querySelector('.response').value.trim()).length < 1) throw new Error('Veuillez compléter les champs des réponses');
				return {
					title : row.querySelector('.response').value,
					correct : row.querySelector('.correct-btn').checked
				};
			});
			if (responses.length < 1) throw new Error(`Veuillez fournir au moins une réponse`);

			const editDetails = await updateQuestion(question.id, {
				title : (title.split(/\n/)).join('<br>'),
				correction,
				theme_id : parseInt(theme),
				score,
				responses
			});
			if (editDetails.error) throw new Error(editDetails.error);

			console.log(editDetails);
			addResponseFieldCalls = 0;
			sendMessageToPanel(`La question #Q${editDetails.question.question.id} a été mise à jour`, 'var(--color-good-message)');
			await setQuestions();
			displayOverlay(false);
			e.target.reset();
		} catch (err) {
			sendMessageToPanel(err.message, 'var(--color-bad-message)');
		};
	});

	// properties.forEach(prop => {
	// 	const input = document.querySelector(`.edit-overlay .${prop}`);
	// 	input.value = question[prop] ? question[prop] : "";
	// });

	displayOverlay(true, editQuestionBox);
};

/**
 * Creates a form on which we'd base a question to set up the deletion depending on it
 * @param {object} question The question on which we'll base the delete question form
 */
const setDeleteQuestionForm = async (question) => {
	document.querySelector('.delete-query').innerText = `Souhaitez-vous vraiment supprimer la question #Q${question.id} ?`;

	const deleteQuestionBtn = document.querySelector('.delete-overlay .delete-btn');
	const deleteQuestionBtnClone = deleteQuestionBtn.cloneNode(true);

	deleteQuestionBtnClone.addEventListener('click', async (e) => {
		e.preventDefault;

		try {
			const deleteDetails = await deleteQuestion(question.id);
			if (deleteDetails.error) throw new Error(deleteDetails.error);

			await setQuestions();
			sendMessageToPanel(`La question "${question.title}" a été supprimée`, 'var(--color-good-message)');
			displayOverlay(false);
		} catch (err) {
			sendMessageToPanel(err.message, 'var(--color-bad-message)');
		};
	});

	deleteQuestionBtn.parentElement.replaceChild(deleteQuestionBtnClone, deleteQuestionBtn);

	displayOverlay(true, deleteQuestionBox);
};

/**
 * Fetches all questions and displays them
 */
const setQuestions = async () => {
	const { questions } = await getQuestions();
	await addThemesInSelect(document.querySelector('.insert-overlay .theme'));
	await addThemesInSelect(document.querySelector('.edit-overlay .theme'));

	await addThemesInSelect(document.querySelector('.filter-params .order-theme'), {defaultText: "Tous les thèmes"});

	search.addEventListener('input', async () => {
		await displayQuestions(await filterQuestions(questions));
	});
	orderProperty.addEventListener('change', async () => {
		await displayQuestions(await filterQuestions(questions));
	});
	orderAscending.addEventListener('change', async () => {
		await displayQuestions(await filterQuestions(questions));
	});
	orderTheme.addEventListener('change', async () => {
		await displayQuestions(await filterQuestions(questions));
	});

	await displayQuestions(await filterQuestions(questions));
};

/**
 * @async
 * @param {array<Object>} questions 
 * @returns {array<Object>} questions
 */
const filterQuestions = async (questions) => {
	if (!questions) return {message : "Aucune question ne correspond à ces critères"};
	if (questions.length < 1) return {message : "Aucune question ne correspond à ces critères"};

	// If search input is set
	let tmp = search.value ?
		questions.filter(question => {
			// Checking if the search query contains any of the following values
			const res = [
				`#q${question.id}`,
				question.theme_title.toLowerCase(),
				question.title.toLowerCase(),
				formatDate(question.created_at),
				formatDate(question.updated_at),
				question.created_by.toLowerCase(),
				question.updated_by.toLowerCase()
			].map(element => element.includes(search.value.toLowerCase()));
			return res.includes(true);
		})
		:
		questions
	;
	if (tmp.length < 1) return {message : "Aucune question ne correspond à ces critères"};

	tmp = orderTheme.value ?
		tmp.filter(question => question.theme_id == orderTheme.value)
		:
		tmp
	;

	if (tmp.length < 1) return {message : "Aucune question ne correspond à ces critères"};

	return tmp;
};

/**
 * Displays all questions passed as arguments
 * @param {Array<object>} questions 
 */
const displayQuestions = async (questions) => {
	const container = document.querySelector('#questions-container');
	const cardsBox = document.createElement('div');
	cardsBox.classList.add('cards-box');

	// setDetails(questions);

	// Emptying questions container
	container.innerHTML = '';

	if (questions.message) {
		container.innerHTML = `
			<div class="questions-message">
				<h1>:(</h1>
				<p>${questions.message}</p>
			</div>
		`;
		return;
	};
	// Looping on all sorted questions to add them one by one
	const sortedQuestions = sortByProperty(questions, orderProperty.value, JSON.parse(orderAscending.value));
	sortedQuestions.forEach(question => {
		const cardContainer = document.createElement('div');
		cardContainer.classList.add('card-container');

		const card = document.createElement('article');
		card.classList.add('question-card');

		const questionId = document.createElement('div');
		questionId.classList.add('question-id');
		questionId.innerHTML = `<h2>#Q${question.id}</h2>`;
		card.appendChild(questionId);

		const questionStats = document.createElement('div');
		questionStats.classList.add('question-stats');
		questionStats.innerHTML = `
			<p>Créé le ${formatDate(question.created_at)} par ${question.created_by}</p>
			<p>Modifié le ${formatDate(question.updated_at)} par ${question.updated_by}</p>
		`;
		card.appendChild(questionStats);

		// The textual part before the show content button
		const questionText = document.createElement('div');
		questionText.classList.add('question-text');

		const questionRow = document.createElement('div');
		questionRow.classList.add('question-row');

		const questionTheme = document.createElement('div');
		questionTheme.classList.add('question-theme');
		questionTheme.innerHTML = `
			<div class="icon"></div>
			<p>${question.theme_title}</p>
		`;
		questionRow.appendChild(questionTheme);

		const questionScore = document.createElement('div');
		questionScore.classList.add('question-score');
		questionScore.innerHTML = `
			<div class="icon"></div>
			<p>${question.score}</p>
		`;
		questionRow.appendChild(questionScore);
		questionText.appendChild(questionRow);

		const questionTitle = document.createElement('div');
		questionTitle.classList.add('question-title');
		questionTitle.innerHTML = (question.title.split('<br>')).map(txt => `<p>${txt.trim()}</p>`).join('');
		questionText.appendChild(questionTitle);

		card.appendChild(questionText);

		// The show content button
		const showContentBtn = document.createElement('div');
		showContentBtn.classList.add('show-content-btn');
		card.appendChild(showContentBtn);

		const showQuestionText = document.createElement('p');
		showQuestionText.innerText = question.responses.length > 1 ?
			`Afficher les ${question.responses.length} réponses`
			:
			question.responses.length === 1 ?
				`Afficher la réponse`
				:
				`Afficher le contenu`
		;
		showContentBtn.appendChild(showQuestionText);

		const displayArrow = document.createElement('div');
		displayArrow.classList.add('display-arrow');
		displayArrow.style.setProperty('transform', 'rotate(0)');
		showContentBtn.appendChild(displayArrow);

		const questionContent = document.createElement('div');
		questionContent.classList.add('question-content');
		questionContent.style.setProperty('display', 'none');
		questionContent.innerHTML = `
			<div class="question-responses">
				${question.responses.length > 0 ?
					question.responses.map(response => `
						<div class="response-box response-${JSON.stringify(response.correct)}">
							<div class="response-img"></div>
							<p class="response-title">${response.title.trim()}</p>
						</div>
					`).join('')
					:
					`<div class="empty-content-message">
						<div class="warning-sign"></div>
						<p>Cette question ne contient pas de réponses.</p>
					</div>`
				}
			</div>
			<div class="question-text">
				<hr>
				<div class="question-correction">
					<b>Correction :</b>
					${((question.correction.split('<br>')).map(txt => `<p>${txt.trim()}</p>`)).join('')}
				</div>
			</div>
		`;
		card.appendChild(questionContent);

		showContentBtn.addEventListener('click', () => {
			questionContent.style.setProperty('display', questionContent.style.getPropertyValue('display') === 'none' ? 'flex' : 'none');
			displayArrow.style.setProperty('transform', `rotate(${questionContent.style.getPropertyValue('display') === 'none' ? '0' : '180deg'})`)
			showQuestionText.innerText = questionContent.style.getPropertyValue('display') === 'none' ? 
				(question.responses.length > 1 ?
					`Afficher les ${question.responses.length} réponses`
					:
					`Afficher le contenu`
				)
				:
				(question.responses.length > 1 ?
					`Masquer les ${question.responses.length} réponses`
					:
					`Masquer le contenu`
				)
			;
		});

		const btnContainer = document.createElement('div');
		btnContainer.classList.add('btn-container');

		card.appendChild(btnContainer);

		// Edit button
		const editBtn = document.createElement('button');
		editBtn.classList.add('edit');
		editBtn.addEventListener('click', async () => {
			await setEditQuestionForm(question);
		});

		// Delete button
		const deleteBtn = document.createElement('button');
		deleteBtn.classList.add('destroy');
		deleteBtn.addEventListener('click', async () => {
			await setDeleteQuestionForm(question);
		});

		btnContainer.appendChild(editBtn);
		btnContainer.appendChild(deleteBtn);

		cardContainer.appendChild(card);
		cardsBox.appendChild(cardContainer);
	});

	container.appendChild(cardsBox);
};

setQuestions();