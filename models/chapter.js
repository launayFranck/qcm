import knex from './knexClient.js';

/**
 * Getting all chapters in a array
 * @async
 * @returns {Array<chapters>} all chapters
 */
const findAll = async () => {
	try {
		const result = await knex('chapter').select().orderBy('id');
		return result;
	} catch (err) {
		throw err;
	};
};

/**
 * Getting a chapter with by its id
 * @async
 * @param {number} id the wanted id
 * @returns {chapter} the chapter
 */
const findById = async (id) => {
	try {
		const result = await knex('chapter').select().where({id});
		return result;
	} catch (err) {
		throw err;
	};
};

/**
 * Getting a chapter with by the provided exam id
 * @async
 * @param {number} id the wanted id
 * @returns {chapter} the chapter
 */
 const findByExaminationId = async (id) => {
	try {
		const result = await knex('chapter').select().where({examination_id: id});
		return result;
	} catch (err) {
		throw err;
	};
};

/**
 * Add a chapter in the database
 * @async
 * @param {object} payload the payload containing the properties to insert
 */
const create = async (payload) => {
	try {
		const result = await knex('chapter').insert(payload).returning('*');
		return result;
	} catch (err) {
		throw err;
	};
};

/**
 * Updating a chapter
 * @async
 * @param {number} id of a chapter
 * @param {object} payload with the new informations
 */
const update = async (id, payload) => {
	try {
		const verif = await knex('chapter').select().where({id});
		if (verif.length <= 0) {
			throw new Error(`id ${id} not found`);
		};
		const result = await knex('chapter').update(payload).where({id}).returning('*');
		return result[0];
	} catch (err) {
		throw err;
	};
};

/**
 * Deleting a chapter
 * @async
 * @param {number} id 
 * @returns {} deleted chapter
 */
const destroy = async (id) => {
	try {
		if (!Number.isInteger(parseInt(id))) {
			throw new Error(`${id} is incorrect`);
		};
		const exists = await knex('chapter').select('id').where({id});
		if (exists.length <= 0) {
			throw new Error(`${id} not found`);
		};

		const response = await knex('chapter').delete().where({id}).returning('*');
		return response[0];
	} catch (err) {
		throw err;
	};
};

export default {
	findAll,
	findById,
	findByExaminationId,
	create,
	update,
	destroy
};