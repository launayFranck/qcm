import knex from './knexClient.js';

const findAll = async () => {
	const result = await knex('user').select();
	delete result.password;
	return result;
};

const findById = async (id) => {
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
};

const findByUsername = async (username) => {
	//cindy
};

const findByEmail = async (email) => {
	const result = await knex('user').select().whereRaw('LOWER(email) = ?', [email.toLowerCase()]).first();
	return result;
};

const create = async (payload) => {
	// Barrière de sécurité
	Object.keys(payload).forEach(property => {
		if (!["username", "firstname", "lastname", "email", "phone", "password", "role"].includes(property)) {
			throw new Error(`Forbidden property : ${property}`);
		};
	});

	payload = {
		username : payload.username,
		firstname : payload.firstname,
		lastname : payload.lastname,
		email : payload.email,
		phone : payload.phone,
		password : await bcrypt.hash(payload.password, 10),
		role : payload.role || 4
	};

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