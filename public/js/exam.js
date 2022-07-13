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
		examContainer.innerHTML = '';
		examContainer.innerHTML += `
			<div class="exam-info">
				<h1>${examination.examination.title}</h1>
				<p>${examination.examination.theme}</p>
			</div>
		`;
		const chaptersContainer = document.createElement('div');
		chaptersContainer.classList.add('chapters-container');

		examContainer.appendChild(chaptersContainer);

		// Fetching all chapters linked to this exam
		const chapters = await getChaptersByExamId(examId);
		if (chapters.error) throw new Error(chapters.error);

		chapters.chapters.forEach(async (chapter) => {
			const chapterBox = document.createElement('div');
			chapterBox.classList.add('chapter-box');
			const chapterHeader = document.createElement('div');
			chapterHeader.classList.add('chapter-header');
			chapterHeader.innerHTML = `
				<span>${chapter.position_number}</span>
				<h2>${chapter.title}</h2>
			`;
			const buttonContainer = document.createElement('div');
			buttonContainer.classList.add('btn-container');

			const editChapter = document.createElement('button');
			editChapter.classList.add('edit-chapter');
			editChapter.addEventListener('click', () => {
				console.log(chapter.id);
			});
			buttonContainer.appendChild(editChapter);

			const deleteChapter = document.createElement('button');
			deleteChapter.classList.add('delete-chapter');
			deleteChapter.addEventListener('click', () => {
				console.log(chapter.id);
			});
			buttonContainer.appendChild(deleteChapter);

			chapterHeader.appendChild(buttonContainer);
			chapterBox.appendChild(chapterHeader);
			chaptersContainer.appendChild(chapterBox);
			


			// chaptersContainer.appendChild()
			// Fetching all questions linked to this chapter
			const questions = await getQuestionsByChapterId(chapter.id);
			if (questions.error) throw new Error(questions.error);
			if (questions.questions.length < 1) return;

			const questionsContainer = document.createElement('div');
			questionsContainer.classList.add('questions-container');

			questions.questions.forEach(async (question) => {
				const questionBox = document.createElement('div');
				questionBox.classList.add('question-box');
				const questionHeader = document.createElement('div');
				questionHeader.classList.add('question-header');



				const responses = await getResponsesByQuestionId(question.id);
				if (responses.error) throw new Error(responses.error);
				if (responses.responses.length < 1) return;

				
			});
		});

	} catch (err) {
		console.log(err.message);
	};
};

buildExam(parseInt(window.location.pathname.split('/examinations/')[1]));