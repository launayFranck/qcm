const updateUser = async (id, payload) => {
	const res = await fetch(`${hostname}/api/users/${id}`, {
		method: 'PUT',
		credentials:'include',
		cache:'no-cache',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload)
	});
	return await res.json();
};

(async () => {
	const username = document.getElementsByName('username')[0];
	const firstname = document.getElementsByName('firstname')[0];
	const lastname = document.getElementsByName('lastname')[0];
	const email = document.getElementsByName('email')[0];
	const phone = document.getElementsByName('phone')[0];
	const password = document.getElementsByName('password')[0];
	const role = document.getElementsByName('role')[0];

	const {users} = await getUser(id);

	username.value = users.username;
	firstname.value = users.firstname;
	lastname.value = users.lastname;
	email.value = users.email;
	phone.value = users.phone;
	role.value = users.role;

	document.querySelector('form').addEventListener('submit', async (e) => {
		e.preventDefault();
		const values = {
			username : username.value.toString(),
			firstname : firstname.value.toString(),
			lastname : lastname.value.toString(),
			email : email.value.toString(),
			phone : phone.value.toString(),
			password : password.value.toString(),
			role : role.value.toString()
		};
		// console.log(values);
		let payload = {};
		Object.keys(values).forEach(property => {
			if (values[property] != users[property] && values[property] !== "") {
				payload[property] = values[property];
			};
		});

		try {
			// Not updating if nothing to change
			if (Object.keys(payload).length < 1) throw new Error('Nothing to change');

			const updateUserDetails = await updateUser(id, payload);
			console.log(updateUserDetails);
		} catch (err) {
			console.log(err.message);
		};

		window.location = "/users";
	});
})();