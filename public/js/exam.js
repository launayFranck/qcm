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
}

// The listener for the insert examination form's submit event
document.querySelector('.insert-overlay.chapter-overlay form').addEventListener('submit', async (e) => {
	e.preventDefault();
	try {
		const payload = {
			title : document.querySelector('.insert-overlay.chapter-overlay .title').value,
			description : document.querySelector('.insert-overlay.chapter-overlay .description').value,
			examination_id : examId,
			position_number : parseInt(document.querySelector('.insert-overlay.chapter-overlay .position-number').value)
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
		console.log(insertDetails);
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
const setEditExaminationForm = async (examination) => {
	// Getting form and emptying charged users list
	const form = document.querySelector('.edit-overlay form');

	// Cloning the form to remove all the event listeners
	const formClone = form.cloneNode(true);

	// Replacing the previous form with the freshly created clone
	form.parentNode.replaceChild(formClone, form);

	const allowedProperties = ["title", "theme_id", "description", "duration", "always_available", "starts_at", "ends_at", "required_score"];

	formClone.querySelector(`.title`).value = examination.title;
	await addThemesInSelect(formClone.querySelector(`.theme-id`), examination.theme_id);
	formClone.querySelector(`.description`).value = examination.description;

	formClone.querySelector(`.duration`).value = formatInterval(examination.duration);
	formClone.querySelector(`.always-available`).checked = examination.always_available;
	formClone.querySelector(`.always-available`).addEventListener('click', () => {
		toggleAvailability(editExaminationBox);
	});
	// Setting the starts_at and ends_at input boxes disabled status on form load
	toggleAvailability(editExaminationBox, !examination.always_available);

	const startsAt = examination.starts_at ? formatDate(examination.starts_at, `$Y-$M-$D $H:$m`)  : null;
	const endsAt = examination.ends_at ? formatDate(examination.ends_at, `$Y-$M-$D $H:$m`) : null;

	formClone.querySelector(`.starts-at`).value = startsAt ? startsAt : '';
	formClone.querySelector(`.ends-at`).value = endsAt ? endsAt : '';
	formClone.querySelector(`.required-score`).value = examination.required_score;

	formClone.addEventListener('submit', async (e) => {
		e.preventDefault();
		try {
			const startsAt = document.querySelector('.edit-overlay .starts-at').value;
			const endsAt = document.querySelector('.edit-overlay .ends-at').value;

			let payload = {
				title : document.querySelector('.edit-overlay .title').value,
				theme_id : document.querySelector('.edit-overlay .theme-id').value,
				description : document.querySelector('.edit-overlay .description').value,
				duration : document.querySelector('.edit-overlay .duration').value,
				always_available : document.querySelector('.edit-overlay .always-available').checked,
				starts_at : startsAt ? formatDate(startsAt, `$Y-$M-$DT$H:$m:00.000Z`) : null,
				ends_at : endsAt ? formatDate(endsAt, `$Y-$M-$DT$H:$m:00.000Z`) : null,
				required_score : document.querySelector('.edit-overlay .required-score').value
			};

			// Forbidding null start and end dates if not always available
			if (!payload.always_available) {
				if (payload.starts_at === null) throw new Error('Veuillez spécifier la date de début !');
				if (payload.ends_at === null) throw new Error('Veuillez spécifier la date de fin !');
			};

			Object.keys(payload).forEach(property => {
				if (!allowedProperties.includes(property)) {
					throw new Error(`Property ${property} is not allowed`);
				};
				if (payload[property] === null) {
					delete payload[property];
					return;
				};
				if (payload[property] == examination[property]) {
					delete payload[property];
					return;
				};
			});

			if (payload.duration == formatInterval(examination.duration)) delete payload.duration;

			// Not updating if nothing to change
			if (Object.keys(payload).length < 1) throw new Error(`L'examen "${examination.title}" n'a pas été modifié`);

			const updateExaminationDetails = await updateExamination(examination.id, payload);
			if (updateExaminationDetails.error) throw new Error(updateExaminationDetails.error);
			
			await setExaminations();
			sendMessageToPanel(`L'examen "${examination.title}" a été modifié`, 'var(--color-good-message)');
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

		// Adding the exam info banner
		const examInfo = document.createElement('div');
		examInfo.classList.add('exam-info');
		const examTitle = document.createElement('h1');
		examTitle.textContent = examination.examination.title;
		examInfo.appendChild(examTitle);

		const examTheme = document.createElement('p');
		examTheme.classList.add('exam-theme');
		examTheme.textContent = examination.examination.theme;
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

		// Fetching all chapters linked to this exam
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

				// const insertQuestion = document.createElement('button');
				// insertQuestion.classList.add('insert-question');
				// insertQuestion.setAttribute('title', "Cliquez ici pour ajouter une question dans ce chapitre");
				// insertQuestion.addEventListener('click', () => {
				// 	console.log("Show insert question overlay here");
				// 	console.log(chapter.id);
				// });
				// buttonContainer.appendChild(insertQuestion);
	
				const editChapterBtn = document.createElement('button');
				editChapterBtn.classList.add('edit-chapter');
				editChapterBtn.setAttribute('title', "Cliquez ici pour éditer ce chapitre");
				editChapterBtn.addEventListener('click', (e) => {
					e.stopPropagation();
					console.log(chapter.id);
					displayOverlay(true, editChapterBox);
				});
				buttonContainer.appendChild(editChapterBtn);
	
				const deleteChapterBtn = document.createElement('button');
				deleteChapterBtn.classList.add('delete-chapter');
				editChapterBtn.setAttribute('title', "Cliquez ici pour supprimer ce chapitre");
				deleteChapterBtn.addEventListener('click', (e) => {
					e.stopPropagation();
					console.log(chapter.id);
					displayOverlay(true, deleteChapterBox);
				});
				buttonContainer.appendChild(deleteChapterBtn);

				chapterHeader.appendChild(buttonContainer);
				chapterBox.appendChild(chapterHeader);
	
				// Fetching all questions linked to this chapter
				const questions = await getQuestionsByChapterId(chapter.id);
				if (questions.error) throw new Error(questions.error);
				const questionsContainer = document.createElement('div');
				questionsContainer.classList.add('questions-container');

				if (questions.questions.length > 0) {
					// Looping on all questions and showing up all of them
					for (let question of questions.questions) {
						const questionBox = document.createElement('div');
						questionBox.classList.add('question-box');

						// The question header (question + buttons)
						const questionHeader = document.createElement('div');
						questionHeader.classList.add('question-header');
						questionHeader.innerHTML = `<p>${question.title}</p>`;
						
						const buttonContainer = document.createElement('div');
						buttonContainer.classList.add('btn-container');

						const deleteQuestion = document.createElement('button');
						deleteQuestion.classList.add('delete-question');
						deleteQuestion.addEventListener('click', () => {
							console.log(chapter.id);
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

						// Fetching all responses linked to this question
						const responses = await getResponsesByQuestionId(question.id);
						if (responses.error) throw new Error(responses.error);

						const responsesContainer = document.createElement('div');
						responsesContainer.classList.add('responses-container');
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
					// Chapter content display arrow
					const displayArrow = document.createElement('div');
					displayArrow.classList.add('display-arrow');
					chapterTitle.appendChild(displayArrow);

					questionsContainer.style.setProperty('display', 'none');
					chapterHeader.addEventListener('click', () => {
						const toggleChapterContent = (display) => {
							if (display != undefined) {
								if (display) {
									questionsContainer.style.setProperty('display', 'flex');
									displayArrow.style.transform = 'rotate(180deg)';
								} else {
									questionsContainer.style.setProperty('display', 'none');
									displayArrow.style.transform = 'rotate(0deg)';
								};
							} else {
								if (questionsContainer.style.getPropertyValue('display') === 'none') {
									questionsContainer.style.setProperty('display', 'flex');
									displayArrow.style.transform = 'rotate(180deg)';
								} else {
									questionsContainer.style.setProperty('display', 'none');
									displayArrow.style.transform = 'rotate(0deg)';
								};
							};
						};
						toggleChapterContent();
					});

					chapterBox.appendChild(questionsContainer);
				};
				chaptersContainer.appendChild(chapterBox);
			};
		};
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

		chaptersContainer.appendChild(insertChapterBtn);

	} catch (err) {
		console.log(err.message);
	};
};

buildExam(examId);