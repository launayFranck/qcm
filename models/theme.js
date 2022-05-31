import knex from './knexClient.js';

/**
 * Getting all themes in a array
 * @async
 * @returns {Array<themes>} all themes
 */
const findAll = async () => {
	try {
		const result = await knex('theme').select().orderBy('id');
		return result;
	} catch (err) {
		throw err;
	};
};

/**
 * Getting a theme with by its id
 * @async
 * @param {number} id the wanted id
 * @returns {theme} the theme
 */
const findById = async (id) => {
	try {
		const result = await knex('theme').select().where({id});
		return result;
	} catch (err) {
		throw err;
	};
};

/**
 * Getting a theme with by its id
 * @async
 * @param {number} id the wanted id
 * @returns {theme} the theme
 */
 const findByIdWithOwner = async (id) => {
	try {
		const result = await knex.raw(`
			SELECT
			"theme".title,
			"user".username AS "managed_by",
			"theme".created_at,
			"theme".updated_at,
			"user2".username AS "created_by",
			"user3".username AS "updated_by",
			"theme_user".created_at AS "link_created_at",
			"theme_user".updated_at AS "link_updated_at",
			"user4".username AS "link_created_by",
			"user5".username AS "link_updated_by"
			FROM "theme"
			JOIN "theme_user" ON "theme_user".theme_id = "theme".id
			JOIN "user" ON "theme_user".user_id = "user".id
			JOIN "user" AS "user2" ON "theme".created_by = "user2".id
			JOIN "user" AS "user3" ON "theme".updated_by = "user3".id
			JOIN "user" AS "user4" ON "theme_user".created_by = "user4".id
			JOIN "user" AS "user5" ON "theme_user".updated_by = "user5".id
			WHERE "theme".id = ?;   
		`, [id]);
		return result.rows;
	} catch (err) {
		throw err;
	};
};

/**
 * Get a theme by its name in the database and returns in an object
 * @async
 * @param {string} name
 * @returns {object} the wanted theme 
 */
const findByName = async (name) => {
	name = name.trim();
	try {
		if (name === "") {
			throw new Error("Veuillez entrer un nom d'utilisateur valide.");
		};
		const result = await knex("theme").select().whereRaw('LOWER(title) = ?', [name]).first();
		return result;
	} catch (err) {
		throw err;
	};
};

/**
 * Add a theme in the database
 * @async
 * @param {object} payload the payload containing the properties to insert
 */
const create = async (payload) => {
	try {
		const result = await knex('theme').insert(payload).returning('*');
		return result;
	} catch (err) {
		throw err;
	};
};

/**
 * Updating a theme
 * @async
 * @param {number} id of a theme
 * @param {object} payload with the new informations
 */
const update = async (id, payload) => {
	try {
		const verif = await knex('theme').select().where({id});
		if (verif.length <= 0) {
			throw new Error(`id ${id} not found`);
		};
		const result = await knex('theme').update(payload).where({id}).returning('*');
		return result[0];
	} catch (err) {
		throw err;
	};
};

/**
 * Deleting a theme
 * @async
 * @param {number} id 
 * @returns {} deleted theme
 */
const destroy = async (id) => {
	try {
		if (!Number.isInteger(parseInt(id))) {
			throw new Error(`${id} is incorrect`);
		};
		const exists = await knex('theme').select('id').where({id});
		if (exists.length <= 0) {
			throw new Error(`${id} not found`);
		};

		const response = await knex('theme').delete().where({id}).returning('*');
		return response[0];
	} catch (err) {
		throw err;
	};
};

export default {
	findAll,
	findById,
	findByIdWithOwner,
	findByName,
	create,
	update,
	destroy
};