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

/**
 * Get all Questions
 * @async
 * @returns Questions
 */
 const getAllQuestions = async () => {
	const res = await fetch(`${hostname}/api/questions`, {
		method: 'GET',
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
 * Fetches all Questions and displays them
 */
 const setQuestions = async () => {
	const { questions } = await getAllQuestions();
    console.log(questions);
};
setQuestions();


