import knex from './knexClient.js';

/**
 * Getting all themes in an array
 * @async
 * @returns {Array<themes>} all themes
 */
const findAll = async () => {
	try {
		const tmp = await knex.raw(`
			SELECT
				"theme".id AS "theme_id",
				"theme".title AS "theme_title",
				"theme".description AS "theme_description",
				"user".username AS "theme_user",
				"theme".created_at AS "theme_created_at",
				"theme".updated_at AS "theme_updated_at",
				"creator".username AS "theme_created_by",
				"updator".username AS "theme_updated_by",
				"user".id AS "user_id",
				"link_creator".username AS link_created_by,
				"link_updator".username AS link_updated_by
			FROM "theme_user"
			JOIN "theme" ON theme_user.theme_id = "theme".id
			JOIN "user" ON theme_user.user_id = "user".id
			JOIN "user" AS "creator" ON theme.created_by = "creator".id
			JOIN "user" AS "updator" ON theme.updated_by = "updator".id
			JOIN "user" AS "link_creator" ON theme_user.created_by = "link_creator".id
			JOIN "user" AS "link_updator" ON theme_user.updated_by = "link_updator".id
		`);

		// Regrouper par propriété
		function groupArrayOfObjects(list, key) {
			return list.reduce(function(rv, x) {
				(rv[x[key]] = rv[x[key]] || []).push(x);
				return rv;
			}, {});
		};
		const groupedThemes = groupArrayOfObjects(tmp.rows, "theme_id"); // Regrouper par thème
		const result = Object.keys(groupedThemes).map(group => {
			const theme = {
				id : groupedThemes[group][0].theme_id,
				title : groupedThemes[group][0].theme_title,
				description : groupedThemes[group][0].theme_description,
				created_at : groupedThemes[group][0].theme_created_at,
				updated_at : groupedThemes[group][0].theme_updated_at,
				created_by : groupedThemes[group][0].theme_created_by,
				updated_by : groupedThemes[group][0].theme_updated_by,
				users : groupedThemes[group].map(theme => {
					return {
						id : theme.user_id,
						name : theme.theme_user,
						link_created_by : theme.link_created_by,
						link_updated_by : theme.link_updated_by
					};
				})
			};

			return theme;
		});

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
const create = async (payload, user) => {
	payload.created_by = user.id;
	payload.updated_by = user.id;

	const { users } = payload;

	// Delete empty string properties
	Object.keys(payload).forEach(property => {
		if (payload[property].length < 1) {
			delete payload[property];
		};
	});

	// Removing unallowed properties from payload
	Object.keys(payload).forEach(property => {
		if (!['title', 'description', 'created_by', 'updated_by'].includes(property)) {
			delete payload[property];
		};
	});

	try {
		const verif = await knex('theme').select('title').where('title', '=', payload.title);
		console.log(verif);
		console.log(verif.length);
		if (verif.length > 0) throw new Error(`Le thème ${payload.title} existe déjà`);

		const themeResult = await knex('theme').insert(payload).returning('*');

		const usersData = users.map(user => {
			return {
				user_id : user,
				theme_id : themeResult[0].id,
				created_by : themeResult[0].created_by,
				updated_by : themeResult[0].updated_by
			};
		});
		console.log(usersData);
		
		const userResult = await knex('theme_user').insert(usersData).returning('*');
		return {
			theme : themeResult[0],
			users : userResult
		};
	} catch (err) {
		return err;
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
		const linkResponse = await knex('theme_user').delete().where('theme_id', '=', id).returning('*');
		const response = await knex('theme').delete().where({id}).returning('*');
		return {
			theme_user : linkResponse[0],
			theme: response[0]
		};
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