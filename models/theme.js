import knex from './knexClient.js';
import log from './log.js';

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
				"user".role AS "theme_user_role_id",
				"theme".created_at AS "theme_created_at",
				"theme".updated_at AS "theme_updated_at",
				"creator".username AS "theme_created_by",
				"updator".username AS "theme_updated_by",
				"user".id AS "user_id",
				"link_creator".username AS link_created_by,
				"link_updator".username AS link_updated_by
			FROM "theme_user"
			JOIN "theme" ON "theme_user".theme_id = "theme".id
			JOIN "user" ON "theme_user".user_id = "user".id
			JOIN "user" AS "creator" ON "theme".created_by = "creator".id
			JOIN "user" AS "updator" ON "theme".updated_by = "updator".id
			JOIN "user" AS "link_creator" ON "theme_user".created_by = "link_creator".id
			JOIN "user" AS "link_updator" ON "theme_user".updated_by = "link_updator".id
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
				users : (groupedThemes[group].map(theme => {
					return {
						id : theme.user_id,
						name : theme.theme_user,
						link_created_by : theme.link_created_by,
						link_updated_by : theme.link_updated_by
					};
				})).sort((a, b) => a.name > b.name ? 1 : -1)
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
 * @param {object} token the token containing the logged user's infos
 */
const create = async (payload, token) => {
	payload.created_by = token.id;
	payload.updated_by = token.id;

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
		if (verif.length > 0) {
			throw new Error(`Le thème ${payload.title} existe déjà`);
		};

		const themeResult = await knex('theme').insert(payload).returning('*');

		const usersPayload = users.map(user => {
			return {
				user_id : user,
				theme_id : themeResult[0].id,
				created_by : themeResult[0].created_by,
				updated_by : themeResult[0].updated_by
			};
		});
		
		const userResult = await knex('theme_user').insert(usersPayload).returning('*');

		const logResult = await log.create({
			content : `$1 a créé le thème ${payload.title}`,
			created_by : token.id
		});
		
		return {
			theme : themeResult[0],
			users : userResult
		};
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
const update = async (id, payload, token) => {
	try {
		if (!payload.charges) throw new Error('Le thème doit être attribué à au moins un utilisateur.');
		if (payload.charges.length < 1) throw new Error('Le thème doit être attribué à au moins un utilisateur.');

		let charges = payload.charges.map(charge => parseInt(charge));

		// Suppression des propriétés non autorisées
		Object.keys(payload).forEach(property => {
			if (!['title', 'description'].includes(property)) {
				delete payload[property];
			};
		});
		const themePayload = Object.keys(payload).length > 0 ? payload : undefined;

		// Vérification de l'existence du thème à modifier
		const verif = await knex('theme').select('id', 'title').where({id});
		if (verif.length < 1) throw new Error(`Le thème avec l'ID ${id} n'existe pas`);

		// Getting all users in charge for the specified theme
		const themeUsers = (await knex('theme_user').select().where({theme_id : id})).map(themeUser => themeUser.user_id);

		// Filtering charged users depending on what action to do with them
		const toUpdate = themeUsers.filter(x => charges.indexOf(x) === themeUsers.indexOf(x));
		const toInsert = charges.filter(x => themeUsers.indexOf(x) === -1);
		const toDestroy = themeUsers.filter(x => charges.indexOf(x) === -1);

		// --- Requests
		const result = {};

		if (toUpdate.length > 0) {
			result.update = [];
			try {
				for (const update of toUpdate) {
					const linkQuery = await knex('theme_user').update({
						updated_at : new Date(),
						updated_by : token.id
					}).where({id : update}).returning('*');
					result.update.push(linkQuery[0]);
				};
			} catch (err) {
				result.update = err;
			};
		};

		if (toInsert.length > 0) {
			result.insert = [];
			try {
				for (const insert of toInsert) {
					const linkQuery = await knex('theme_user').insert({
						user_id : insert,
						theme_id : id,
						created_by : token.id,
						updated_by : token.id
					}).returning('*');
					result.insert.push(linkQuery[0]);
				};
			} catch (err) {
				result.insert = err;
			};
		};

		if (toDestroy.length > 0) {
			result.destroy = [];
			try {
				for (const destroy of toDestroy) {
					const linkQuery = await knex('theme_user').delete().where({
						user_id : destroy,
						theme_id : id
					}).returning('*');
					result.destroy.push(linkQuery[0]);
				};
			} catch (err) {
				result.insert = err;
			};
		};

		// Si le thème a été modifié (title, description)
		if (themePayload) {
			themePayload.updated_at = new Date();
			themePayload.updated_by = token.id;
			try {
				const themeQuery = await knex('theme').update(themePayload).where({id}).returning('*');
				result.theme = themeQuery[0];
			} catch (err) {
				result.theme = err;
			};
		};

		const logResult = await log.create({
			content : `$1 a modifié le thème ${verif[0].title}`,
			created_by : token.id
		});

		return result;
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
const destroy = async (id, token) => {
	try {
		if (!Number.isInteger(parseInt(id))) {
			throw new Error(`${id} is incorrect`);
		};

		// Checking the existence of the requested theme
		const verif = await knex('theme').select('id', 'title').where({id});
		if (verif.length <= 0) throw new Error(`${id} not found`);

		const linkResponse = await knex('theme_user').delete().where('theme_id', '=', id).returning('*');
		const response = await knex('theme').delete().where({id}).returning('*');

		const logResult = await log.create({
			content : `$1 a supprimé le thème ${verif[0].title}`,
			created_by : token.id
		});

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