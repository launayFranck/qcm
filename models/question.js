import knex from './knexClient.js';

/**
 * Getting all questions in a array
 * @async
 * @returns {Array<questions>} all questions
 */
const findAll = async () => {
	try {
		const result = await knex('question').select().orderBy('id');
		return result;
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
        console.log(result);
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
 */
const create = async (payload) => {
	try {
		const result = await knex('question').insert(payload).returning('*');
		return result;
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
const update = async (id, payload) => {
	try {
		const verif = await knex('question').select().where({id});
		if (verif.length <= 0) {
			throw new Error(`id ${id} not found`);
		};
		const result = await knex('question').update(payload).where({id}).returning('*');
		return result[0];
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

		const response = await knex('question').delete().where({id}).returning('*');
		return response[0];
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