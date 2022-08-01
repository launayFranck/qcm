import knex from './knexClient.js';
import log from './log.js';

/**
 * Getting all questions in a array
 * @async
 * @returns {Array<questions>} all questions
 */
const findAll = async () => {
	try {
		// const result = await knex('question').select().orderBy('id');
		const result = await knex.raw(`
			SELECT
				"question".id,
				"question".title,
				"question".chapter_id,
				"question".theme_id,
				"theme".title AS theme_title,
				"question".score,
				"question".correction,
				"question".active,
				"question".created_at,
				"question".updated_at,
				"creator".username AS "created_by",
				"updator".username AS "updated_by"
			FROM "question"
			JOIN "theme" ON "question".theme_id = "theme".id
			JOIN "user" AS "creator" ON "question".created_by = "creator".id
			JOIN "user" as "updator" ON "question".updated_by = "updator".id
			ORDER BY "created_at";
		`);
		for (const [i, question] of result.rows.entries()) {
			const responses = await knex('response').select().where('question_id', '=', question.id);
			result.rows[i].responses = responses;
		};

		return result.rows;
	} catch (err) {
		throw err;
	};
};

/**
 * Getting a question with by its id
 * @async
 * @param {number} id the wanted id
 * @returns {question} the question
 */
const findById = async (id) => {
	try {
		const result = await knex('question').select().where({id});
		return result;
	} catch (err) {
		throw err;
	};
};

/**
 * Getting all the questions by chapter id
 * @async
 * @param {number} id the wanted id
 * @returns {question} the question
 */
 const findByChapterId = async (id) => {
	try {
		const result = await knex('question').join('chapter', 'chapter.id', '=', 'question.chapter_id').select(
			'question.id',
			'question.title',
			'question.score',
			'question.correction',
			'question.active',
			'question.chapter_id',
			'question.created_at',
			'question.updated_at',
			'question.created_by',
			'question.updated_by'
		).where('question.chapter_id', '=', id);
		return result;
	} catch (err) {
		throw err;
	};
};
 
/**
 * Get a question by its name in the database and returns in an object
 * @async
 * @param {string} name
 * @returns {object} the wanted question 
 */
const findByName = async (name) => {
	name = name.trim();
	try {
		if (name === "") {
			throw new Error("Veuillez entrer un nom de question valide.");
		};
		const result = await knex("question").select().whereRaw('LOWER(title) = ?', [name]).first();
		return result;
	} catch (err) {
		throw err;
	};
};

/**
 * Add a question in the database
 * @async
 * @param {object} payload the payload containing the properties to insert
 * @param {object} token the token containing the logged user's infos
 */
const create = async (payload, token) => {
	payload.created_by = token.id;
	payload.updated_by = token.id;

	const { responses } = payload;

	// Removing unallowed properties from payload
	Object.keys(payload).forEach(property => {
		if (!['title', 'correction', 'theme_id', 'created_by', 'updated_by'].includes(property)) {
			delete payload[property];
		};
	});

	// Delete empty string properties
	Object.keys(payload).forEach(property => {
		console.log(payload[property]);
		if (payload[property].length < 1) {
			delete payload[property];
		};
	});
	console.log(payload);

	try {
		const questionResult = await knex('question').insert(payload).returning('*');

		const responsesPayload = responses.map(response => {
			return {
				title : response.title,
				correct : response.correct,
				question_id : questionResult[0].id,
				created_by : questionResult[0].created_by,
				updated_by : questionResult[0].updated_by
			};
		});
		
		const responsesResult = await knex('response').insert(responsesPayload).returning('*');

		const logResult = await log.create({
			content : `$1 a créé la question ${payload.title}`,
			created_by : token.id
		});
		
		return {
			question : questionResult[0],
			responses : responsesResult
		};
	} catch (err) {
		throw err;
	};
};

/**
 * Updating a question
 * @async
 * @param {number} id of a question
 * @param {object} payload with the new informations
 */
const update = async (id, payload, token) => {
	try {
		payload.updated_at = new Date();
		payload.updated_by = token.id;

		const { responses } = payload;
		delete payload["responses"];

		const verif = await knex('question').select().where({id});
		if (verif.length <= 0) {
			throw new Error(`id ${id} not found`);
		};
		const questionResult = await knex('question').update(payload).where({id}).returning('*');

		const responsesPayload = responses.map(response => {
			return {
				title : response.title,
				correct : response.correct,
				question_id : id,
				created_by : token.id,
				updated_by : token.id
			};
		});

		const deletingResponses = await knex('response').delete().where('question_id', '=', id);
		const responsesResult = await knex('response').insert(responsesPayload).where('question_id', '=', id);

		return {
			question : questionResult[0],
			oldResponses : deletingResponses,
			responses : responsesResult
		};
	} catch (err) {
		throw err;
	};
};

/**
 * Deleting a question
 * @async
 * @param {number} id 
 * @returns {} deleted question
 */
const destroy = async (id) => {
	try {
		if (!Number.isInteger(parseInt(id))) {
			throw new Error(`${id} is incorrect`);
		};
		const exists = await knex('question').select('id').where({id});
		if (exists.length <= 0) {
			throw new Error(`${id} not found`);
		};

		const responseResult = await knex('response').delete().where({question_id : id}).returning('*');
		const questionResult = await knex('question').delete().where({id}).returning('*');

		return {
			question: questionResult[0],
			responses: responseResult
		}
	} catch (err) {
		throw err;
	};
};

export default {
	findAll,
	findById,
    findByChapterId,
	findByName,
	create,
	update,
	destroy
};