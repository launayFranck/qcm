import knex from './knexClient.js';

const findAll = async () => {
	try {
		const result = await knex('examination').select();
		return result;
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
	try {
		const result = await knex('examination').update(payload).where({id}).returning('*');
		return result;
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