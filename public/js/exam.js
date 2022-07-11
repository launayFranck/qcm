import { jwtDecode } from "./jwt-decode.js";
import { capitalize, formatDate, formatInterval, reverseFormatInterval, sendMessageToPanel, sortByProperty } from './utils.js';

const jwtDecoded = jwtDecode(localStorage.getItem('Authorization'));

const hostname = window.location.href.split(window.location.pathname)[0];
console.log(hostname);

// const getExaminationById = async (id) => {
//     const res = await fetch(`${hostname}/api/examinations/${id}`, {
// 		method: 'GET',
// 		credentials: 'include',
// 		cache: 'no-cache',
// 		headers: {
// 			'Content-Type': 'application/json',
// 			'Authorization': `Bearer ${localStorage.getItem('Authorization')}`
// 		}
// 	});
// 	return await res.json();
// };

// const getChaptersByExamId = async (id) => {
//     const res = await fetch(`${hostname}/api/chapters/examination/${id}`, {
// 		method: 'GET',
// 		credentials: 'include',
// 		cache: 'no-cache',
// 		headers: {
// 			'Content-Type': 'application/json',
// 			'Authorization': `Bearer ${localStorage.getItem('Authorization')}`
// 		}
// 	});
// 	return await res.json();
// };

// const getQuestionsByChapterId = async (id) => {
//     const res = await fetch(`${hostname}/api/questions/chapter/${id}`, {
// 		method: 'GET',
// 		credentials: 'include',
// 		cache: 'no-cache',
// 		headers: {
// 			'Content-Type': 'application/json',
// 			'Authorization': `Bearer ${localStorage.getItem('Authorization')}`
// 		}
// 	});
// 	return await res.json();
// };

// const getResponsesByQuestionId = (id) => {
//     const res = await fetch(`${hostname}/api/responses/question/${id}`, {
// 		method: 'GET',
// 		credentials: 'include',
// 		cache: 'no-cache',
// 		headers: {
// 			'Content-Type': 'application/json',
// 			'Authorization': `Bearer ${localStorage.getItem('Authorization')}`
// 		}
// 	});
// 	return await res.json();
// }

const buildExam = async (examId) => {
    // Getting the exam id (The number in the URL)

    console.log(examId);
    console.log(getExaminationById(examId));

    // Fetching all chapters linked to this exam
    const { chapters } = await getChaptersByExamId(examId);
    chapters.forEach(chapter => {
        // Fetching all questions linked to this chapter
        const { questions } = await getQuestionsByChapterId(chapter.id);
        questions.forEach(question => {
            const responses = await getResponsesByQuestionId(question.id);
        });
    });
};

buildExam(parseInt(window.location.pathname.split('/examinations/')[1]));