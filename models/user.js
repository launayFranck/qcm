import knex from './knexClient.js';

const findAll = async () => {
	const result = await knex('user').select();
	return result;
};

const findById = async (id) => {
	const result = await knex('user').select().where('id', '=', id);
	return result;
};

/**
 * Get a user by username in the database and returns in an object
 * @async
 * @param {string} username of a user
 * @returns {object} the wanted user 
 */
const findByUsername = async (username) => {
    username = username.trim();
	try {
		if (username === "") {
			throw new Error("Veuillez entrer un nom d'utilisateur valide.");
		};
		const result = await knex("user").select().whereRaw('LOWER(username) = ?', [username]).first();
        delete result.password;
        return result;
	} catch (err) {
		throw new Error(err.message);
	};
};

const findByEmail = async (email) => {
	const result = await knex('user').select().whereRaw('LOWERCASE(email) = ?', [email.toLowerCase()]);
	return result;
};

const create = async (payload) => {
	const result = await knex('user').insert(payload).returning();
	return result;
};

/**
 * Updating a user
 * @async
 * @param {number} id of a user
 * @param {object} payload with the new informations
 */
const update = async (id, payload) => {
    try {
		const verif = await knex('user').select().where({id});
		if (verif.length <= 0) {
			throw new Error(`id ${id} not found`);
		};
		return await knex('user').update(payload).where({id}).returning('*').first();
	} catch (err) {
		throw new Error(err.message);
	};
};

/**
 * Deleting a user
 * @async
 * @param {number} id 
 * @returns {} deleted user
 */
const destroy = async (id) => {
    try {
        if (!Number.isInteger(parseInt(id))) {
            throw new Error(`${id} is incorrect`);
        };
        const exists = await knex('user').select('id').where('id', '=', id);
        console.log(exists);
        if (exists.length <= 0) {
            throw new Error(`${id} not found`);
        };

        const response = await knex('user').delete().where('id', '=', id).returning('*').first();
        return response;
    } catch (err) {
        throw new Error(err.message);
    };
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