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

const insertAddChargedBtn = document.querySelector('.insert-overlay .add-charged');
const editAddChargedBtn = document.querySelector('.edit-overlay .add-charged');

/**
 * Adding charged fields to a charged list
 * @param {htmlnode} node The html node in which adding the charged user's field
 * @param {number} userId The id of the user we want to select by default (optional)
 */
const addChargedField = async (node, userId) => {
	try {
		// Fetching users who have the rights to add or update roles
		const getUsersDetails = await getUsersWithQuestionRights();
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
				if (userId) if (userId == user.id) option.setAttribute('selected', true);
				option.innerText = `${user.username} (${user.firstname} ${user.lastname})`;

				optGroup.appendChild(option);
			};

			select.appendChild(optGroup);
		});
	
		// "Button" (div) for removing a user in charge for a Question
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

addChargedField(insertQuestionBox);

insertAddChargedBtn.addEventListener('click', () => {
	addChargedField(insertQuestionBox);
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
const orderUser = document.querySelector('.order-user');

/**
 * Get all Questions
 * @async
 * @returns Questions
 */
const getAllQuestions = async () => {
	const res = await fetch(`${hostname}/api/questions`, {
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
 * Insert a new Question in the DB
 * @param {object} data
 * @returns {object} The new Question
 */
const insertQuestion = async (data) => {
	const res = await fetch(`${hostname}/api/Questions`, {
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
 * Updates a Question from the DB
 * @param {number} id Integer referring to a Question's id
 * @param {object} payload An object containing the properties to modify
 * @returns {object} The updated Question
 */
const updateQuestion = async (id, payload) => {
	const res = await fetch(`${hostname}/api/Questions/${id}`, {
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
 * Deletes a Question from the DB
 * @param {number} id Integer referring to a Question's id
 * @returns {object} The deleted Question
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

// The listener for the insert Question form's submit event
document.querySelector('.insert-overlay form').addEventListener('submit', async (e) => {
	e.preventDefault();
	try {
		const title = document.querySelector('.insert-overlay .title').value;
		const description = document.querySelector('.insert-overlay .description').value;

		const users = await removeDuplicates(Array.from(document.querySelectorAll('.insert-overlay .charge')).map(user => user.value));

		const insertDetails = await insertQuestion({title, description, users});
		if (insertDetails.error) throw new Error(insertDetails.error);

		console.log(insertDetails);

		sendMessageToPanel(`Le thème "${insertDetails.Question.Question.title}" a été créé`, 'var(--color-good-message)');
		await setQuestions();
		displayOverlay(false);
		e.target.reset();
	} catch (err) {
		sendMessageToPanel(err.message, 'var(--color-bad-message)');
	};
});

/**
 * Set details about the Questions
 * @param {array} Questions 
 */
const setDetails = (Questions) => {
	const stats = [
		{
			name : 'Nombre de thèmes',
			value : Questions.length
		},
		{
			name : "Nombre min d'utilisateur",
			value : Questions.sort((a, b) => a.users.length > b.users.length ? 1 : -1)[0].users.length
		},
		{
			name : "Nombre max d'utilisateur",
			value : Questions.sort((a, b) => a.users.length < b.users.length ? 1 : -1)[0].users.length
		},
		{
			name : "Utilisateur gérant le moins de thèmes",
			value : (() => {
				const usersNb = {};
				Questions.forEach(Question => {
					Question.users.forEach(user => {
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
				Questions.forEach(Question => {
					Question.users.forEach(user => {
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
 * @param {object} Question The Question on which to base the edit form depending on what we're editing
 */
const setEditQuestionForm = async (Question) => {
	const properties = ["title", "description"];

	// Getting form and emptying charged users list
	const form = document.querySelector('.edit-overlay form');
	form.querySelectorAll('.charge-row').forEach(chargeRow => {
		chargeRow.parentElement.removeChild(chargeRow);
	});

	// Cloning the form to remove all the event listeners
	const formClone = form.cloneNode(true);
	Question.users.forEach(user => {
		addChargedField(editQuestionBox, user.id);
	});
	formClone.querySelector('.add-charged').addEventListener('click', () => {
		addChargedField(editQuestionBox);
	});

	// Replacing the previous form with the freshly created clone
	form.parentNode.replaceChild(formClone, form);

	formClone.addEventListener('submit', async (e) => {
		e.preventDefault();

		const title = document.querySelector('.edit-overlay .title');
		const description = document.querySelector('.edit-overlay .description');

		const charges = await removeDuplicates(Array.from(document.querySelectorAll('.edit-overlay .charge')).map(charge => {
			return charge.value;
		}));

		const values = {
			title : title.value.toString(),
			description : description.value.toString(),
			charges
		};
		
		let payload = {};
		Object.keys(values).forEach(property => {
			if (values[property] != Question[property] && values[property] != "") {
				payload[property] = values[property];
			};
		});

		try {
			// Not updating if nothing to change
			if (Object.keys(payload).length < 1) throw new Error(`Le thème "${Question.title}" n'a pas été modifié`);

			const updateQuestionDetails = await updateQuestion(Question.id, payload);
			if (updateQuestionDetails.error) throw new Error(updateQuestionDetails.error);

			console.log(updateQuestionDetails);
			
			await setQuestions();
			sendMessageToPanel(`Le thème "${Question.title}" a été modifié`, 'var(--color-good-message)');
			displayOverlay(false);

		} catch (err) {
			sendMessageToPanel(err.message, 'var(--color-bad-message)');
		};
	});

	properties.forEach(prop => {
		const input = document.querySelector(`.edit-overlay .${prop}`);
		input.value = Question[prop] ? Question[prop] : "";
	});

	displayOverlay(true, editQuestionBox);
};

/**
 * Creates a form on which we'd base a Question to set up the deletion depending on it
 * @param {object} Question The Question on which we'll base the delete Question form
 */
const setDeleteQuestionForm = async (Question) => {
	document.querySelector('.delete-query').innerText = `Souhaitez-vous vraiment supprimer ${Question.title} ?`;

	const deleteQuestionBtn = document.querySelector('.delete-overlay .delete-btn');
	const deleteQuestionBtnClone = deleteQuestionBtn.cloneNode(true);

	deleteQuestionBtnClone.addEventListener('click', async (e) => {
		e.preventDefault;

		try {
			const deleteDetails = await deleteQuestion(Question.id);
			if (deleteDetails.error) throw new Error(deleteDetails.error);

			await setQuestions();
			sendMessageToPanel(`Le thème "${Question.title}" a été supprimé`, 'var(--color-good-message)');
			displayOverlay(false);
		} catch (err) {
			sendMessageToPanel(err.message, 'var(--color-bad-message)');
		};
	});

	deleteQuestionBtn.parentElement.replaceChild(deleteQuestionBtnClone, deleteQuestionBtn);

	displayOverlay(true, deleteQuestionBox);
};

/**
 * @async Adds all users with Question rights into a select box
 * @param {htmlnode} select The select tag inside which we want to add the users
 */
const displayUsersInSelect = async (select) => {
	try {
		const { users } = await getUsersWithQuestionRights();

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
 * Fetches all questions and displays them
 */
const setQuestions = async () => {
	const { questions } = await getAllQuestions();

	search.addEventListener('input', async () => {
		await displayQuestions(await filterQuestions(Questions));
	});
	orderProperty.addEventListener('change', async () => {
		await displayQuestions(await filterQuestions(Questions));
	});
	orderAscending.addEventListener('change', async () => {
		await displayQuestions(await filterQuestions(Questions));
	});
	orderUser.addEventListener('change', async () => {
		await displayQuestions(await filterQuestions(Questions));
	});

	await displayQuestions(await filterQuestions(Questions));
};

/**
 * @async
 * @param {array<Object>} questions 
 * @returns {array<Object>} questions
 */
const filterQuestions = async (Questions) => {
	if (!Questions) return {message : "Aucun thème ne correspond à ces critères"};
	if (Questions.length < 1) return {message : "Aucun thème ne correspond à ces critères"};

	// If search input is set
	let tmp = search.value ?
		Questions.filter(Question => {
			// Checking if the search query contains any of the following values
			const res = [
				Question.title.toLowerCase(),
				Question.description.toLowerCase(),
				formatDate(Question.created_at),
				formatDate(Question.updated_at),
				Question.created_by.toLowerCase(),
				Question.updated_by.toLowerCase()
			].map(element => element.includes(search.value.toLowerCase()));
			return res.includes(true);
		})
		:
		Questions
	;
	if (tmp.length < 1) return {message : "Aucun thème ne correspond à ces critères"};

	tmp = orderUser.value ?
		tmp.filter(Question => Question.users.map(user => user.name).includes(orderUser.value))
		:
		tmp
	;

	if (tmp.length < 1) return {message : "Aucun thème ne correspond à ces critères"};

	return tmp;
};

/**
 * Displays all Questions passed as arguments
 * @param {Array<object>} Questions 
 */
const displayQuestions = async (Questions) => {
	const container = document.querySelector('#Questions-container'); 
	const cardsBox = document.createElement('div');
	cardsBox.classList.add('cards-box');

	setDetails(Questions);

	// Emptying Questions container
	container.innerHTML = '';

	if (Questions.message) {
		container.innerHTML = `
			<div class="Questions-message">
				<h1>:(</h1>
				<p>${Questions.message}</p>
			</div>
		`;
		return;
	};
	// Looping on all sorted Questions to add Question one by one
	const sortedQuestions = sortByProperty(Questions, orderProperty.value, JSON.parse(orderAscending.value));
	sortedQuestions.forEach(Question => {
		const title = Question.title;
		const description = Question.description;
		const createdAt = formatDate(Question.created_at);
		const updatedAt = formatDate(Question.updated_at);
		const createdBy = Question.created_by;
		const updatedBy = Question.updated_by;
		const users = Question.users;

		const cardContainer = document.createElement('div');
		cardContainer.classList.add('card-container');

		const card = document.createElement('article');
		card.classList.add('Question-card');

		card.innerHTML = `
			<div class="Question-title">
				<h2>${title}</h2>
			</div>
			<div class="Question-stats">
				<p>Créé le ${createdAt} par ${createdBy}</p>
				<p>Modifié le ${updatedAt} par ${updatedBy}</p>
			</div>
			<div class="Question-description">
				<p>${description}</p>
			</div>
			<ul class="Question-users">
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
			await setEditQuestionForm(Question, users);
		});

		// Delete button
		const deleteBtn = document.createElement('button');
		deleteBtn.classList.add('destroy');
		deleteBtn.addEventListener('click', async () => {
			await setDeleteQuestionForm(Question);
		});

		btnContainer.appendChild(editBtn);
		btnContainer.appendChild(deleteBtn);

		cardContainer.appendChild(card);
		cardsBox.appendChild(cardContainer);
	});

	container.appendChild(cardsBox);
};

setQuestions();