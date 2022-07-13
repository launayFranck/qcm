import knex from './knexClient.js';

/**
 * Getting all responses in a array
 * @async
 * @returns {Array<responses>} all responses
 */
const findAll = async () => {
	try {
		const result = await knex('response').select().orderBy('id');
		return result;
	} catch (err) {
		throw err;
	};
};

/**
 * Getting a response with by its id
 * @async
 * @param {number} id the wanted id
 * @returns {response} the response
 */
const findById = async (id) => {
	try {
		const result = await knex('response').select().where({id});
		return result;
	} catch (err) {
		throw err;
	};
};

/**
 * Getting all the responses by question id
 * @async
 * @param {number} id the wanted id
 * @returns {response} the response
 */
 const findByQuestionId = async (id) => {
	try {
		const result = await knex('response').join('question', 'question.id', '=', 'response.question_id').select('response.title', 'response.correct', 'response.created_at', 'response.updated_at', 'response.created_by', 'response.updated_by').where('question.id','=', id);
        console.log(result);
		return result;
	} catch (err) {
		throw err;
	};
};
 
/**
 * Get a response by its name in the database and returns in an object
 * @async
 * @param {string} name
 * @returns {object} the wanted response 
 */
const findByName = async (name) => {
	name = name.trim();
	try {
		if (name === "") {
			throw new Error("Veuillez entrer une réponse valide.");
		};
		const result = await knex("response").select().whereRaw('LOWER(title) = ?', [name]).first();
		return result;
	} catch (err) {
		throw err;
	};
};

/**
 * Add a response in the database
 * @async
 * @param {object} payload the payload containing the properties to insert
 */
const create = async (payload) => {
	try {
		const result = await knex('response').insert(payload).returning('*');
		return result;
	} catch (err) {
		throw err;
	};
};

/**
 * Updating a response
 * @async
 * @param {number} id of a response
 * @param {object} payload with the new informations
 */
const update = async (id, payload) => {
	try {
		const verif = await knex('response').select().where({id});
		if (verif.length <= 0) {
			throw new Error(`id ${id} not found`);
		};
		const result = await knex('response').update(payload).where({id}).returning('*');
		return result[0];
	} catch (err) {
		throw err;
	};
};

/**
 * Deleting a response
 * @async
 * @param {number} id 
 * @returns {} deleted response
 */
const destroy = async (id) => {
	try {
		if (!Number.isInteger(parseInt(id))) {
			throw new Error(`${id} is incorrect`);
		};
		const exists = await knex('response').select('id').where({id});
		if (exists.length <= 0) {
			throw new Error(`${id} not found`);
		};

		const response = await knex('response').delete().where({id}).returning('*');
		return response[0];
	} catch (err) {
		throw err;
	};
};

export default {
	findAll,
	findById,
    findByQuestionId,
	findByName,
	create,
	update,
	destroy
};