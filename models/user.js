import knex from './knexClient.js';
import bcrypt from 'bcrypt';

const findAll = async () => {
	try {
		const result = await knex('user').select(
			"id",
			"username",
			"firstname",
			"lastname",
			"email",
			"phone",
			"role",
			"created_at",
			"updated_at"
		);
		return result;
	} catch (err) {
		throw err;
	};
};

const findById = async (id) => {
	try {
		const result = await knex('user').select(
			"id",
			"username",
			"firstname",
			"lastname",
			"email",
			"phone",
			"role",
			"created_at",
			"updated_at"
		).where('id', '=', id).first();
		return result;
	} catch (err) {
		throw err;
	}
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

const findByEmail = async (email, strict = true) => {
	try {
		if (strict) {
			const result = await knex('user').select().whereRaw("LOWER(email) = LOWER(?)", [email]);
			console.log(result.length);
			if (result.length < 1) throw new Error(`User not found with email ${email}`);

			return result[0];
		} else {
			const result = await knex('user').select().whereRaw("LOWER(email) LIKE LOWER(?)", [`%${email.replace("'", '')}%`]);
			if (result.length < 1) throw new Error(`Users not found`);
			return result;
		};
	} catch (err) {
		throw err;
	};
};

const create = async (payload) => {
	try {
		// Verifying and forbidding unauthorized property
		Object.keys(payload).forEach(property => {
			if (!["username", "firstname", "lastname", "email", "phone", "password", "role"].includes(property)) {
				throw new Error(`Forbidden property : ${property}`);
			};
		});

		// Hashing password and setting role if undefined
		payload.password = await bcrypt.hash(payload.password, 10);
		payload.role = payload.role || 4;

		// Verifying that no user is already registered with the same username or email
		const verif = await knex('user').select('id').whereRaw('username = ? OR email = ?', [payload.username.toLowerCase(), payload.email.toLowerCase()]);
		if (verif.length > 0) throw new Error('Username or email already taken');

		const result = await knex('user').insert(payload).returning('*');
		return result[0];
	} catch (err) {
		throw err;
	};
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