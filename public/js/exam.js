import { jwtDecode } from "./jwt-decode.js";
import { capitalize, formatDate, formatInterval, reverseFormatInterval, sendMessageToPanel, sortByProperty } from './utils.js';

const jwtDecoded = jwtDecode(localStorage.getItem('Authorization'));

const hostname = window.location.href.split(window.location.pathname)[0];
console.log(hostname);

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

const buildExam = async (examId) => {
	try {
		// Fetching the examination
		const examination = await getExaminationById(examId);
		if (examination.error) throw new Error(examination.error);
		// console.log(examination.examination);
		const examContainer = document.querySelector('#exam-container');

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

				const insertQuestion = document.createElement('button');
				insertQuestion.classList.add('insert-question');
				insertQuestion.setAttribute('title', "Cliquez ici pour ajouter une question dans ce chapitre");
				insertQuestion.addEventListener('click', () => {
					console.log("Show insert question overlay here");
					console.log(chapter.id);
				});
				buttonContainer.appendChild(insertQuestion);
	
				const editChapter = document.createElement('button');
				editChapter.classList.add('edit-chapter');
				editChapter.setAttribute('title', "Cliquez ici pour éditer ce chapitre");
				editChapter.addEventListener('click', () => {
					console.log("Show edit chapter overlay here");
					console.log(chapter.id);
				});
				buttonContainer.appendChild(editChapter);
	
				const deleteChapter = document.createElement('button');
				deleteChapter.classList.add('delete-chapter');
				editChapter.setAttribute('title', "Cliquez ici pour supprimer ce chapitre");
				deleteChapter.addEventListener('click', () => {
					console.log("Show delete chapter overlay here");
					console.log(chapter.id);
				});
				buttonContainer.appendChild(deleteChapter);

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
						console.log(question);
						const questionBox = document.createElement('div');
						questionBox.classList.add('question-box');
						// The question header (question + buttons)
						const questionHeader = document.createElement('div');
						questionHeader.classList.add('question-header');
						questionHeader.innerHTML = `<p>${question.title}</p>`;
						
						const buttonContainer = document.createElement('div');
						buttonContainer.classList.add('btn-container');

						const editQuestion = document.createElement('button');
						editQuestion.classList.add('edit-question');
						editQuestion.addEventListener('click', () => {
							console.log(chapter.id);
						});
						buttonContainer.appendChild(editQuestion);
			
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
								console.log(response);
								const responseBox = document.createElement('div');
								responseBox.classList.add('response-box');

								responseBox.innerHTML = `
									<div class='response-${JSON.stringify(response.correct)}'></div>
									<p>${response.title}</p>
								`;
								responsesContainer.appendChild(responseBox);
							};

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
	} catch (err) {
		console.log(err.message);
	};
};

buildExam(parseInt(window.location.pathname.split('/examinations/')[1]));