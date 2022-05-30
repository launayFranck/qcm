import knex from './knexClient.js';

const findAll = async () => {
	const result = await knex('user').select();
	return result;
};

const findById = async (id) => {
	const result = await knex('user').select().where('id', '=', id);
	return result;
};

const findByUsername = async (username) => {
	//cindy
};

const findByEmail = async (email) => {
	const result = await knex('user').select().whereRaw('LOWERCASE(email) = ?', [email.toLowerCase()]);
	return result;
};

const create = async (payload) => {
	const result = await knex('user').insert(payload).returning();
	return result;
};

const update = async (payload) => {
	// cindy
};

const destroy = async (email) => {
	// cindy
};

export default {
	findAll,
	findById,
	findByUsername,
	findByEmail,
	create,
	update,
	destroy
};