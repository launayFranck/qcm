import knex from './knexClient.js';

const findAll = async () => {
	try {
		const result = await knex.raw(`
			SELECT
				"examination".id,
				"examination".title,
				"examination".description,
				"examination".theme_id,
				"theme".title AS "theme_title",
				"examination".duration,
				"examination".always_available,
				"examination".starts_at,
				"examination".ends_at,
				"examination".required_score,
				"examination".active,
				"examination".created_at,
				"examination".updated_at,
				"creator".username AS created_by,
				"updator".username AS updated_by
			FROM "examination"
			JOIN "theme" ON "examination".theme_id = "theme".id
			JOIN "user" AS "creator" ON "examination".created_by = "creator".id
			JOIN "user" AS "updator" ON "examination".created_by = "updator".id;
		`);
		return result.rows;
	} catch (err) {
		throw err;
	};
};

const findById = async (id) => {
	try {
		const result = await knex('examination').select().where({id}).first();
		return result;
	} catch (err) {
		throw err;
	};
};

const create = async (payload, user) => {
	try {
		payload.created_by = user.id;
		payload.updated_by = user.id;

		const result = await knex('examination').insert(payload).returning('*');
		return result[0];
	} catch (err) {
		throw err;
	};
};

const update = async (id, payload) => {
	try {
		const result = await knex('examination').update(payload).where({id}).returning('*');
		return result[0];
	} catch (err) {
		throw err;
	};
};

/**
 * Deleting an examination
 * @async
 * @param {number} id 
 * @returns {} deleted examination
 */
 const destroy = async (id, token) => {
	try {
		if (!Number.isInteger(parseInt(id))) {
			throw new Error(`${id} is incorrect`);
		};

		// Checking the existence of the requested examination
		const verif = await knex('examination').select('id', 'title').where({id});
		if (verif.length <= 0) throw new Error(`${id} not found`);

		const chapterResponse = await knex('chapter').delete().where('id', '=', id);
		const response = await knex('examination').delete().where({id}).returning('*');

		// const logResult = await log.create({
		// 	content : `$1 a supprimé le thème ${verif[0].title}`,
		// 	created_by : token.id
		// });

		return {
			examination: response[0], 
			chapter: chapterResponse
		};
	} catch (err) {
		throw err;
	};
};

export default {
	findAll,
	findById,
	create,
	update,
	destroy
};