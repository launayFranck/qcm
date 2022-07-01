import knex from './knexClient.js';

const findAll = async () => {
	try {
		const result = await knex.raw(`
			SELECT
				"examination".id,
				"examination".title,
				"examination".description,
				"examination".duration,
				"examination".starts_at,
				"examination".ends_at,
				"examination".required_score,
				"examination".active,
				"examination".created_at,
				"examination".updated_at,
				"creator".username AS created_by,
				"updator".username AS updated_by
			FROM "examination"
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

const create = async (payload) => {
	try {
		const result = await knex('examination').insert(payload).returning('*');
		return result[0];
	} catch (err) {
		throw err;
	};
};

const update = async (id, payload) => {
	console.log(id, payload)
	try {
		const result = await knex('examination').update(payload).where({id}).returning('*');
		return result[0];
	} catch (err) {
		throw err;
	};
};

const destroy = async (id) => {
	try {
		const result = await knex('examination').destroy().where({id}).returning('*');
		return result[0];
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