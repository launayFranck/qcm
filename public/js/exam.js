import { jwtDecode } from "./jwt-decode.js";
import { capitalize, displayOverlay, formatDate, formatInterval, reverseFormatInterval, sendMessageToPanel, sortByProperty } from './utils.js';

const jwtDecoded = jwtDecode(localStorage.getItem('Authorization'));

const hostname = window.location.href.split(window.location.pathname)[0];
const examId = parseInt(window.location.pathname.split('/examinations/')[1]);

// Overlay stuff
const overlayBg = document.querySelector(".overlay-bg");
const insertChapterBox = document.querySelector(".insert-overlay.chapter-overlay");
const detailsChapterBox = document.querySelector(".details-overlay.chapter-overlay");
const editChapterBox = document.querySelector(".edit-overlay.chapter-overlay");
const deleteChapterBox = document.querySelector(".delete-overlay.chapter-overlay");

const insertQuestionBox = document.querySelector(".insert-overlay.question-overlay");
const deleteQuestionBox = document.querySelector(".insert-overlay.question-overlay");

overlayBg.addEventListener('click', () => {
	displayOverlay(false);
});

document.querySelectorAll('.overlay-closer').forEach(overlayCloser => {
	overlayCloser.addEventListener('click', () => {
		displayOverlay(false);
	});
});

/**
 * Fetches an examination by its id
 * @param {number} id The id of the desired examination
 * @returns The desired examination
 */
const getExaminationById = async (id) => {
	const res = await fetch(`${hostname}/api/examinations/${id}`, {
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
 * Inserts a chapter into the DB
 * @param {object} payload An object containing the properties to insert
 * @returns {object} The created chapter
 */
const insertChapter = async (payload) => {
	const res = await fetch(`${hostname}/api/chapters`, {
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
 * Edits a chapter into the DB
 * @param {object} payload An object containing the properties to insert
 * @returns {object} The created chapter
 */
const updateChapter = async (id, payload) => {
	const res = await fetch(`${hostname}/api/chapters/${id}`, {
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
 * Fetches chapters linked to a specific examination
 * @param {number} id The id of the examination from which to get all chapters
 * @returns {Array{object}} The chapters linked to the specified exam
 */
const getChaptersByExamId = async (id) => {
	const res = await fetch(`${hostname}/api/chapters/examination/${id}`, {
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
 * Deletes a chapter from the DB
 * @param {object} id the chapter to delete
 * @returns {object} The deleted chapter
 */
 const deleteChapter = async (id) => {
	const res = await fetch(`${hostname}/api/chapters/${id}`, {
		method: 'DELETE',
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
 * Fetches all questions linked to a specific chapter
 * @param {number} id The id of the chapter from which to get all questions
 * @returns {Array<object>} The questions linked to the specified chapter
 */
const getQuestionsByChapterId = async (id) => {
	const res = await fetch(`${hostname}/api/questions/chapter/${id}`, {
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

const getQuestionsByThemeId = async (themeId) => {
	const res = await fetch(`${hostname}/api/questions/theme/${themeId}`, {
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
 * Fetches all responses linked to a specific question
 * @param {number} id The id of the question from which to get all responses
 * @returns {Array<object>} The responses linked to the specified question
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

const addQuestionsInSelect = async (select, themeId) => {
	console.log(themeId);
	const { questions } = await getQuestionsByThemeId(themeId);
	console.log(questions);

	select.innerHTML = `<option value="" disabled ${themeId ? '' : 'selected'}>-- Sélectionnez un thème</option>`;
	select.innerHTML += sortByProperty(questions, 'title').map((question) => `<option value="${question.id}" ${themeId ? question.theme_id == themeId ? 'selected' : '' : ''}>${question.title}</option>`).join('');
};

// The listener for the insert examination form's submit event
document.querySelector('.insert-overlay.chapter-overlay form').addEventListener('submit', async (e) => {
	e.preventDefault();
	try {
		const payload = {
			title : document.querySelector('.insert-overlay.chapter-overlay .title').value.trim(),
			description : (document.querySelector('.insert-overlay.chapter-overlay .description').value.trim()).replace(/(\r\n|\r|\n)/g, '<br>'),
			examination_id : examId,
			position_number : parseInt(document.querySelector('.insert-overlay.chapter-overlay .position-number').value.trim())
		};

		// Content checking
		if ((payload.title.toString()).length < 1) throw new Error('Le titre ne peut être nul !');
		if ((payload.position_number.toString().length < 1)) throw new Error('La position ne peut être nulle !');
		if ((payload.examination_id.toString().length < 1)) throw new Error("L'id de l'examen ne peut être nul !");

		const ints = Array.from(document.querySelectorAll('.chapter-position')).map(position => parseInt(position.innerText));

		// forEach(position => {
		// 	if (parseInt(position.innerText) === payload.position_number) {
		// 		throw new Error(`La position ${payload.position_number} est déjà utilisée !`)
		// 	}
		// })

		// console.log(payload);
		const insertDetails = await insertChapter(payload);
		if (insertDetails.error) throw new Error(insertDetails.error);

		sendMessageToPanel(`Le chapitre "${insertDetails.chapter.title}" a été créé`, 'var(--color-good-message)');
		await buildExam();
		displayOverlay(false);
		e.target.reset();
	} catch (err) {
		sendMessageToPanel(err.message, 'var(--color-bad-message)');
	};
});

/**
 * Set details about the themes
 * @param {array} examinations 
 */
const setDetails = async (examinations) => {
	const stats = [
		{
			name : `Nombre d'examens`,
			value : examinations.length
		},
		{
			name : "Examen le plus ancien",
			value : examinations.sort((a, b) => a.created_at > b.created_at ? 1 : -1)[0].title
		},
		{
			name :  "Examen le plus récent",
			value : examinations.sort((a, b) => a.created_at < b.created_at ? 1 : -1)[0].title
		},
		{
			name :  "Examen a la plus courte durée",
			value : examinations.sort((a, b) => parseInt(formatInterval(a.duration, '$t')) > parseInt(formatInterval(b.duration, '$t')) ? 1 : -1)[0].title
		},
		{
			name :  "Examen a la plus longue durée",
			value : examinations.sort((a, b) => parseInt(formatInterval(a.duration, '$t')) < parseInt(formatInterval(b.duration, '$t')) ? 1 : -1)[0].title
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
 * Sets the edit-overlay form so it depends on which examination we're editing
 * @param {object} examination The examination on which to base the edit form depending on what we're editing
 */
const setEditChapterForm = async (chapter) => {
	// Getting form and emptying charged users list
	const form = document.querySelector('.edit-overlay.chapter-overlay form');

	// Cloning the form to remove all the event listeners
	const formClone = form.cloneNode(true);

	// Replacing the previous form with the freshly created clone
	form.parentNode.replaceChild(formClone, form);

	const allowedProperties = ["position_number", "title", "description"];

	formClone.querySelector(`.position-number`).value = chapter.position_number;
	formClone.querySelector(`.title`).value = chapter.title;
	formClone.querySelector(`.description`).value = chapter.description;

	formClone.addEventListener('submit', async (e) => {
		e.preventDefault();
		try {
			let payload = {
				position_number : document.querySelector('.edit-overlay .position-number').value,
				title : document.querySelector('.edit-overlay .title').value,
				description : document.querySelector('.edit-overlay .description').value,
			};

			// Not updating if nothing to change
			if (Object.keys(payload).length < 1) throw new Error(`Le chapitre "${chapter.title}" n'a pas été modifié`);
			const updateChapterDetails = await updateChapter(chapter.id, payload);
			if (updateChapterDetails.error) throw new Error(updateChapterDetails.error);
			
			await buildExam();
			sendMessageToPanel(`Le chapitre "${chapter.title}" a été modifié`, 'var(--color-good-message)');
			displayOverlay(false);


		} catch (err) {
			sendMessageToPanel(err.message, 'var(--color-bad-message)');
		};
	});

	displayOverlay(true, editChapterBox);
};

/**
 * Creates a form on which we'd base on a chapter to set up the deletion depending on it
 * @param {object} chapter The chapter to delete
 */
const setDeleteChapterForm = async (chapter) => {
	document.querySelector('.delete-query').innerText = `Souhaitez-vous vraiment supprimer ${chapter.title} ?`;

	const deleteChapterBtn = document.querySelector('.delete-overlay .delete-btn');
	const deleteChapterBtnClone = deleteChapterBtn.cloneNode(true);

	deleteChapterBtnClone.addEventListener('click', async (e) => {
		e.preventDefault;

		try {
			const deleteDetails = await deleteChapter(chapter.id);

			if (deleteDetails.error) throw new Error(deleteDetails.error);

			await buildExam();
			sendMessageToPanel(`Le chapitre "${chapter.title}" a été supprimé`, 'var(--color-good-message)');
			displayOverlay(false);
		} catch (err) {
			sendMessageToPanel(err.message, 'var(--color-bad-message)');
		};
	});

	deleteChapterBtn.parentElement.replaceChild(deleteChapterBtnClone, deleteChapterBtn);

	displayOverlay(true, deleteChapterBox);
};

const setInsertQuestionForm = async (id) => {
	console.log("setInsertQuestionForm");
	console.log(id);
	// const formClone = insertQuestionBox.querySelector('form');
};

/**
 * Builds the exam section depending on an examination's id
 * @param {number} examId The id of the exam on which to base the page's content
 */
const buildExam = async (examId) => {
	if (examId === undefined) examId = parseInt(window.location.pathname.split('/examinations/')[1]);
	try {
		// Fetching the examination
		const examination = await getExaminationById(examId);
		if (examination.error) throw new Error(examination.error);
		// console.log(examination.examination);
		const examContainer = document.querySelector('#exam-container');
		examContainer.innerHTML = '';

		console.log(insertQuestionBox.querySelector('select'));
		console.log(examination.examination);
		await addQuestionsInSelect(insertQuestionBox.querySelector('select'), examination.examination.theme_id);

		// Adding the exam info banner
		const examInfo = document.createElement('div');
		examInfo.classList.add('exam-info');
		const examTitle = document.createElement('h1');
		examTitle.textContent = examination.examination.title;
		examInfo.appendChild(examTitle);

		const examTheme = document.createElement('p');
		examTheme.classList.add('exam-theme');
		examTheme.textContent = examination.examination.theme_title;
		examInfo.appendChild(examTheme);

		examContainer.appendChild(examInfo);

		// Adding the quick nav bar
		const quickNav = document.createElement('ul');
		quickNav.classList.add('quick-nav');
		examContainer.appendChild(quickNav);

		// Adding the chapters container
		const chaptersContainer = document.createElement('div');
		chaptersContainer.classList.add('chapters-container');
		examContainer.appendChild(chaptersContainer);

		const insertChapterBtn = document.createElement('button');
		insertChapterBtn.classList.add('insert-chapter-btn');
		insertChapterBtn.classList.add('dotted-btn');
		insertChapterBtn.innerText = '+';
		insertChapterBtn.addEventListener('click', () => {
			const setDefaultPositionNumber = (i = 1) => {
				const existingPositionNumbers = Array.from(document.querySelectorAll('.chapter-position')).map(position => parseInt(position.innerText));
				while (existingPositionNumbers.includes(i)) {
					i++;
				};
				document.querySelector('.insert-overlay.chapter-overlay .position-number').value = i;
			};
			setDefaultPositionNumber();
			displayOverlay(true, insertChapterBox);
		});

		// The button to insert a new chapter (top)
		chaptersContainer.appendChild(insertChapterBtn);

		// --- Chapters part
		const chapters = await getChaptersByExamId(examId);
		if (chapters.error) throw new Error(chapters.error);
		if (chapters.chapters.length > 0) {
			// Looping on all chapters and showing up all of them
			for (let chapter of chapters.chapters) {
				const chapterBox = document.createElement('div');
				chapterBox.classList.add('chapter-box');
				chapterBox.setAttribute('id', `chapter-${chapter.id}`);

				// Creating the quickNav link
				quickNav.innerHTML += `
					<li>
						<a href="#chapter-${chapter.id}">${chapter.position_number}. ${chapter.title}</a>
					</li>
				`;

				// Defining chapter header (orange box)
				const chapterHeader = document.createElement('div');
				chapterHeader.classList.add('chapter-header');

				const chapterPosition = document.createElement('span');
				chapterPosition.classList.add('chapter-position');
				chapterPosition.innerText = chapter.position_number;
				chapterHeader.appendChild(chapterPosition);

				const chapterTitle = document.createElement('h2');
				chapterTitle.classList.add('chapter-title');
				chapterTitle.innerText = chapter.title;
				chapterHeader.appendChild(chapterTitle);

				// The button container
				const buttonContainer = document.createElement('div');
				buttonContainer.classList.add('btn-container');

				const insertQuestion = document.createElement('button');
				insertQuestion.classList.add('insert-question');
				insertQuestion.setAttribute('title', "Cliquez ici pour ajouter une question dans ce chapitre");
				insertQuestion.addEventListener('click', (e) => {
					e.stopPropagation();
					setInsertQuestionForm(chapter.id);
					displayOverlay(true, insertQuestionBox);
				});
				buttonContainer.appendChild(insertQuestion);
	
				const editChapterBtn = document.createElement('button');
				editChapterBtn.classList.add('edit-chapter');
				editChapterBtn.setAttribute('title', "Cliquez ici pour éditer ce chapitre");
				editChapterBtn.addEventListener('click', (e) => {
					e.stopPropagation();
					setEditChapterForm(chapter);
					displayOverlay(true, editChapterBox);
				});
				buttonContainer.appendChild(editChapterBtn);

				const deleteChapterBtn = document.createElement('button');
				deleteChapterBtn.classList.add('delete-chapter');
				editChapterBtn.setAttribute('title', "Cliquez ici pour supprimer ce chapitre");
				deleteChapterBtn.addEventListener('click', (e) => {
					e.stopPropagation();
					setDeleteChapterForm(chapter);
					displayOverlay(true, deleteChapterBox);
				});
				buttonContainer.appendChild(deleteChapterBtn);

				chapterHeader.appendChild(buttonContainer);
				chapterBox.appendChild(chapterHeader);

				const chapterBody = document.createElement('div');
				chapterBody.classList.add('chapter-body');

				// Chapter description part
				if (chapter.description) {
					const chapterDescription = document.createElement('div');
					chapterDescription.classList.add('description');
					chapterDescription.innerHTML = `
						${((chapter.description.split('<br>')).map(txt => `<p>${txt.trim()}</p>`)).join('')}
					`;
					chapterBody.appendChild(chapterDescription);

					const hr = document.createElement('hr');
					chapterBody.appendChild(hr);
				};

				// --- Questions part
				const questionsContainer = document.createElement('div');
				questionsContainer.classList.add('questions-container');

				const questions = await getQuestionsByChapterId(chapter.id);
				if (questions.error) throw new Error(questions.error);

				if (questions.questions.length > 0) {
					// Looping on all questions and showing up all of them
					for (let question of questions.questions) {
						const questionBox = document.createElement('div');
						questionBox.classList.add('question-box');

						// The question header (question + buttons)
						const questionHeader = document.createElement('div');
						questionHeader.classList.add('question-header');
						questionHeader.innerHTML = `
							<div class="question-title">
								${((question.title.split('<br>')).map(txt => `<p>${txt.trim()}</p>`)).join('')}
							</div>`;
						
						const buttonContainer = document.createElement('div');
						buttonContainer.classList.add('btn-container');

						const deleteQuestion = document.createElement('button');
						deleteQuestion.classList.add('delete-question');
						deleteQuestion.addEventListener('click', () => {
							// console.log(chapter.id);
						});
						buttonContainer.appendChild(deleteQuestion);

						questionHeader.appendChild(buttonContainer);
						questionBox.appendChild(questionHeader);

						// The question correction after the question header
						const questionCorrection = document.createElement('div');
						questionCorrection.classList.add('correction-row');
						questionCorrection.innerHTML = `
							<b>Correction :</b>
							<p>${question.correction}</p>
						`;
						questionBox.appendChild(questionCorrection);

						// The hr after the question correction
						const hr = document.createElement('hr');
						questionBox.appendChild(hr);

						// --- Responses part
						const responsesContainer = document.createElement('div');
						responsesContainer.classList.add('responses-container');

						const responses = await getResponsesByQuestionId(question.id);
						if (responses.error) throw new Error(responses.error);

						if (responses.responses.length > 0) {
							// Looping on all responses and showing up all of them
							for (let response of responses.responses) {
								// console.log(response);
								const responseBox = document.createElement('div');
								responseBox.classList.add('response-box');

								responseBox.innerHTML = `
									<div class='response-${JSON.stringify(response.correct)}'></div>
									<p>${response.title}</p>
								`;
								responsesContainer.appendChild(responseBox);
							};

							questionBox.appendChild(responsesContainer);
						} else {
							responsesContainer.innerHTML = `
								<div class="empty-content-message">
									<div class="warning-sign"></div>
									<p>Cette question ne contient pas de réponses.</p>
								</div>
							`;
							questionBox.appendChild(responsesContainer);
						};
						questionsContainer.appendChild(questionBox);
					};
					chapterBody.appendChild(questionsContainer);
				} else {
					questionsContainer.innerHTML = `
						<div class="empty-content-message">
							<div class="warning-sign"></div>
							<p>Ce chapitre ne contient pas de questions.</p>
						</div>
					`;
					chapterBody.appendChild(questionsContainer);
				};

				// Chapter content display arrow
				const displayArrow = document.createElement('div');
				displayArrow.classList.add('display-arrow');
				chapterTitle.appendChild(displayArrow);

				chapterBody.style.setProperty('display', 'none');
				chapterHeader.addEventListener('click', () => {
					const toggleChapterContent = (display) => {
						if (display != undefined) {
							if (display) {
								chapterBody.style.setProperty('display', 'flex');
								displayArrow.style.transform = 'rotate(180deg)';
							} else {
								chapterBody.style.setProperty('display', 'none');
								displayArrow.style.transform = 'rotate(0deg)';
							};
						} else {
							if (chapterBody.style.getPropertyValue('display') === 'none') {
								chapterBody.style.setProperty('display', 'flex');
								displayArrow.style.transform = 'rotate(180deg)';
							} else {
								chapterBody.style.setProperty('display', 'none');
								displayArrow.style.transform = 'rotate(0deg)';
							};
						};
					};
					toggleChapterContent();
				});
				chapterBox.appendChild(chapterBody);
				chaptersContainer.appendChild(chapterBox);
			};
		};
		// The button to insert a new chapter (bottom)
		// const bottomInsertChapterBtn = insertChapterBtn;
		// chaptersContainer.appendChild(bottomInsertChapterBtn);
	} catch (err) {
		console.log(err.message);
	};
};

buildExam(examId);