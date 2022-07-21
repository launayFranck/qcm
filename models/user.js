import knex from './knexClient.js';
import bcrypt from 'bcrypt';

/**
 * Finds all the users
 * @returns {array<object>} Returns all the users from the DB
 */
const findAll = async () => {
	try {
		const result = await knex('user').join('role', 'user.role', '=', 'role.id').select(
			"user.id",
			"user.username",
			"user.firstname",
			"user.lastname",
			"user.email",
			"user.phone",
			"user.role",
			"role.name",
			"user.activated",
			"user.created_at",
			"user.updated_at"
		);
		return result;
	} catch (err) {
		throw err;
	};
};

/**
 * Count all users and users by roles
 * @async
 * @returns {object} Returns all the users from the DB
 */
const countAllByRole = async () => {
	try {
		const result = await knex.raw(`
			SELECT
				COUNT(*) AS users_number,
				SUM(CASE WHEN "user".role = 1 THEN 1 ELSE 0 END) AS admins_number,
				SUM(CASE WHEN "user".role = 2 THEN 1 ELSE 0 END) AS managers_number,
				SUM(CASE WHEN "user".role = 3 THEN 1 ELSE 0 END) AS formers_number,
				SUM(CASE WHEN "user".role = 4 THEN 1 ELSE 0 END) AS interns_number
			FROM "user";
		`);
		return result.rows[0];
	} catch (err) {
		throw err;
	};
};

const findAllWithThemeRights = async () => {
	try {
		const result = await knex.raw(`
			SELECT
				"user".id,
				"user".username,
				"user".firstname,
				"user".lastname,
				"user".email,
				"user".phone,
				"user".role,
				"role".name AS "role_name",
				"user".activated,
				"user".created_at,
				"user".updated_at
			FROM "user"
			JOIN "role" ON "user".role = "role".id
			WHERE "user".role = 1 OR "user".role = 2
			ORDER BY username;
		`);
		return result.rows;
	} catch (err) {
		throw err;
	}
}

/**
 * Find a user by its id
 * @param {number} id An integer used to find a specific user in the DB
 * @returns 
 */
const findById = async (id) => {
	try {
		const result = await knex('user').join('role', 'user.role', '=', 'role.id').select(
			"user.id",
			"user.username",
			"user.firstname",
			"user.lastname",
			"user.email",
			"user.phone",
			"user.role",
			"role.name",
			"user.activated",
			"user.created_at",
			"user.updated_at"
		).where('user.id', '=', id).first();
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
	try {
		if (username === "") {
			throw new Error("Veuillez entrer un nom d'utilisateur valide.");
		};
		const result = await knex("user").select(
			"id",
			"username",
			"firstname",
			"lastname",
			"email",
			"phone",
			"role",
			"activated",
			"created_at",
			"updated_at"
		).whereRaw('LOWER(username) = ?', [username.trim()]).first();
        delete result.password;
        return result;
	} catch (err) {
		throw err;
	};
};

/**
 * Find a user by its email address
 * @param {string} email The email to use as a filter
 * @param {boolean} strict Defines if the email should be exact or approximative
 * @returns 
 */
const findByEmail = async (email, strict = true) => {
	try {
		if (strict) {
			const result = await knex('user').select(
				"id",
				"username",
				"firstname",
				"lastname",
				"email",
				"phone",
				"role",
				"activated",
				"created_at",
				"updated_at"
			).whereRaw("LOWER(email) = LOWER(?)", [email]);
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

/**
 * Creating a new user
 * @param {object} payload Contains the properties to add to the DB
 * @returns 
 */
const create = async (payload) => {
	try {
		// Verifying and forbidding unauthorized property
		Object.keys(payload).forEach(property => {
			if (!["username", "firstname", "lastname", "email", "phone", "password", "role"].includes(property)) {
				throw new Error(`Forbidden property : ${property}`);
			};
		});

		// Hashing password and setting role if undefined
		payload.username = payload.username.toLowerCase();
		payload.email = payload.email.toLowerCase();
		payload.password = await bcrypt.hash(payload.password, 10);
		payload.role = payload.role || 4;

		// Verifying that no user is already registered with the same username or email
		const verif = await knex('user').select('id').whereRaw('username = ? OR email = ?', [payload.username, payload.email]);
		if (verif.length > 0) throw new Error('Username or email already taken');

		const result = await knex('user').insert(payload).returning(
			"id",
			"username",
			"firstname",
			"lastname",
			"email",
			"phone",
			"role",
			"activated",
			"created_at",
			"updated_at"
		);
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
		payload.updated_at = new Date();

		// Hashage du password si password il y a
		if (payload.password) payload.password = await bcrypt.hash(payload.password, 10);

		const response = await knex('user').update(payload).where({id}).returning(
			"id",
			"username",
			"firstname",
			"lastname",
			"email",
			"phone",
			"role",
			"activated",
			"created_at",
			"updated_at"
		);
		return response[0];
	} catch (err) {
		throw err;
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
        if (exists.length <= 0) {
            throw new Error(`${id} not found`);
        };

        const response = await knex('user').delete().where('id', '=', id).returning(
			"id",
			"username",
			"firstname",
			"lastname",
			"email",
			"phone",
			"role",
			"activated",
			"created_at",
			"updated_at"
		);
        return response[0];
    } catch (err) {
        throw err;
    };
};

export default {
	findAll,
	countAllByRole,
	findAllWithThemeRights,
	findById,
	findByUsername,
	findByEmail,
	create,
	update,
	destroy
};