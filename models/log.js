import knex from './knexClient.js';
import user from './user.js';

/**
 * Getting all logs in an array
 * @async
 * @returns {Array<logs>} all logs
 */
const findAll = async () => {
	try {
		const result = await knex.raw(`
			SELECT
				"log".id,
				"log".content,
				"log".created_at,
				"user".username AS "created_by"
			FROM "log"
			JOIN "user" ON "log".created_by = "user".id
			ORDER BY "log".created_at DESC
			LIMIT 7;
		`);

		return result.rows;
	} catch (err) {
		throw err;
	};
};

/**
 * Adds a log in the database
 * @async
 * @param {string} content the payload containing the properties to insert
 * @param {object} content the payload containing the properties to insert
 */
const create = async (payload) => {
	try {
		Object.keys(payload).forEach(property => {
			if (!["content", "created_by"].includes(property)) {
				console.log(`${property} : ${payload[property]}`);
				delete payload[property];
			};
		});
		const logResult = await knex('log').insert(payload).returning('*');
		return logResult;
	} catch (err) {
		console.error(err.message);
	};
};

/**
 * Deleting a log
 * @async
 * @param {number} id 
 * @returns {} deleted log
 */
const destroy = async (id) => {
	try {
		if (!Number.isInteger(parseInt(id))) {
			throw new Error(`${id} is incorrect`);
		};
		const exists = await knex('log').select('id').where({id});
		if (exists.length <= 0) {
			throw new Error(`${id} not found`);
		};
		const linkResponse = await knex('log_user').delete().where('log_id', '=', id).returning('*');
		const response = await knex('log').delete().where({id}).returning('*');
		return {
			log_user : linkResponse[0],
			log: response[0]
		};
	} catch (err) {
		throw err;
	};
};

export default {
	findAll,
	create,
	destroy
};