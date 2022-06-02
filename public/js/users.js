const hostname = window.location.href.split(window.location.pathname)[0];

const insertUser = async (data) => {
	const res = await fetch(`${hostname}/api/users`, {
		method: 'POST',
		credentials:'include',
		cache:'no-cache',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	});
	return await res.json();
};

const deleteUser = async (id) => {
	const res = await fetch(`${hostname}/api/users/${id}`, {
		method: 'DELETE',
		credentials:'include',
		cache:'no-cache',
		headers: {
			'Content-Type': 'application/json'
		}
	});
	return await res.json();
};

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

// const deleteBtn = async (id, username) => {
// 	const prompt = window.confirm(`Souhaitez-vous réellement supprimer ${username} ?`);
// 	if (prompt) {
// 		await deleteUser(id);
// 		await setUsers();
// 	};
// };

(async () => {
	const username = document.getElementsByName('username')[0];
	const firstname = document.getElementsByName('firstname')[0];
	const lastname = document.getElementsByName('lastname')[0];
	const email = document.getElementsByName('email')[0];
	const phone = document.getElementsByName('phone')[0];
	const password = document.getElementsByName('password')[0];
	const role = document.getElementsByName('role')[0];

	document.querySelector('form').addEventListener('submit', async (e) => {
		e.preventDefault();

		const insertDetails = await insertUser({
			username : username.value,
			firstname : firstname.value,
			lastname : lastname.value,
			email : email.value,
			phone : phone.value,
			password : password.value,
			role : role.value
		});
		if (insertDetails.error) alert(insertDetails.error);
		await setUsers();
		document.querySelector('form').reset();
	});

	/**
	 * Generating a username in the username input based on the first and last names
	 */
	const generateUsername = () => {
		username.value = firstname.value.charAt(0).toLowerCase() + lastname.value.toLowerCase();
	};

	// Auto generating username based on firstname and lastname when any is written
	firstname.addEventListener('input', generateUsername);
	lastname.addEventListener('input', generateUsername);

	// Removing auto generating username if username is specified by admin
	username.addEventListener('input', () => {
		if (username.value === '') {
			firstname.addEventListener('input', generateUsername);
			lastname.addEventListener('input', generateUsername);
		} else {
			firstname.removeEventListener('input', generateUsername);
			lastname.removeEventListener('input', generateUsername);
		}
	});
})();

/**
 * Get all users
 * @async
 * @returns users
 */
const getAllUsers = async () => {
	const res = await fetch(`${hostname}/api/users`, {
		method: 'GET',
		credentials:'include',
		cache:'no-cache',
		headers: {
			'Content-Type': 'application/json'
		}
	});
	return await res.json();
};

/**
 * Count users and users by role
 * @async
 * @returns number of users
 */
const countAllUsers = async () => {
	const res = await fetch(`${hostname}/api/users/count`, {
		method: 'GET',
		credentials:'include',
		cache:'no-cache',
		headers: {
			'Content-Type': 'application/json'
		}
	});
	return await res.json();
};

/**
 * Capitalizes a string
 * @param {string} x The string to capitalize
 * @returns The capitalized string
 */
const capitalize = (x) => x.charAt(0).toUpperCase() + x.slice(1);

const setUsers = async () => {
	const usersContainer = document.querySelector('#users-container');

	// Display informations for the admin
	const { users : number } = await countAllUsers();
	try {
		document.querySelector('.users-number').innerText = number.users_number;
		document.querySelector('.admins-number').innerText = number.admins_number;
		document.querySelector('.managers-number').innerText = number.managers_number;
		document.querySelector('.formers-number').innerText = number.formers_number;
		document.querySelector('.interns-number').innerText = number.interns_number;
	} catch (err) {
		console.error(err.message);
	}
	

	// Fetching users
	const {users} = await getAllUsers();
	users.sort((a, b) => (a.role > b.role ? 1 : -1));

	// Filtering distinct roles
	let roles = {};
	users.forEach(user => {
		roles[user.role] = user.name;
	});
	const rolesIds = Object.keys(roles);

	/**
	 * Sorts an array of objects by one of the objects' property
	 * @param {array} array The array containing objects to sort
	 * @param {string} property The name of the property to use as a filter
	 * @param {boolean} ascending Specifies the order of the required informations
	 * @returns {array<object>} The sorted array
	 */
	const sortByProperty = (array, property, ascending = true) => {
		try {
			const res = array.sort((a, b) => (a[property].toLowerCase() > b[property].toLowerCase() ?
				(ascending ? 1 : -1)
				:
				(ascending ? -1 : 1)
			));
			return res;
		} catch (err) {
			console.error(err.message);
			return array;
		};
	};
	
	// Showing up users sorted by role
	const displayUsers = () => {
		usersContainer.innerHTML = '';
		rolesIds.forEach(roleId => {
			const newRoleBox = document.createElement('section');
			newRoleBox.setAttribute('id', roles[roleId]);
			newRoleBox.classList.add('role-box');
			newRoleBox.innerHTML = `
				<div class="role-header">
					<h1>${capitalize((() => {
						switch (roles[roleId]) {
							case "admin" :
								return "administrateurs";
							case "manager" :
								return "gestionnaires";
							case "former" :
								return "formateurs";
							case "intern" :
								return "stagiaires";
							default :
								return "utilisateurs";
						}
					})())}</h1>
				</div>
			`;
	
			const orderProperty = document.getElementsByName('property')[0].value;
			const orderAscending = JSON.parse(document.getElementsByName('ascending')[0].value);
	
			for (let user of sortByProperty(users.filter(user => user.role == roleId), orderProperty, orderAscending)) {
				newRoleBox.innerHTML += `
					<article>
						<div class="user-box">
							<h2>${user.username}</h2>
							<p>${user.firstname} ${user.lastname}</p>
							<p>${user.email}</p>
							<p>Membre depuis le ${(() => {
								const joined = new Date(user.created_at);
								const year = joined.getFullYear();
								const month = joined.getMonth() + 1;
								const day = joined.getDate();
	
								const formatNb = (nb) => {
									return (nb.toString()).length < 2 ? `0${nb}` : nb;
								};
	
								return `${formatNb(day)}/${formatNb(month)}/${year}`;
							})()}</p>
						</div>
						<div class="btn-container">
							<div class="toggle-switch">
								<label class="switch">
									<input type="checkbox" data-id=${user.id} ${user.activated ? "checked=''" : ""}>
									<span class="slider round"></span>
								</label>
							</div>
							<button class="edit" data-id="${user.id}"></button>
							<button class="destroy" data-id="${user.id}"></button>
						</div>
					</article>
				`;
				console.log(user.activated);
			};
			usersContainer.appendChild(newRoleBox)
		});
		document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
			console.log(checkbox);
			checkbox.addEventListener('change', async (e) => {
				const id = e.target.getAttribute('data-id');
				const activated = e.target.checked ? true : false;

				console.log(id);
				console.log(activated);
				const updateUserDetails = await updateUser(id, {activated})
				console.log(updateUserDetails);
			  });
		});
		document.querySelectorAll('.edit').forEach(edit => {
			edit.addEventListener('click', async () => {
				const id = edit.getAttribute('data-id');
				window.location = `/users/edit/${id}`;
			});
		});

		document.querySelectorAll('.destroy').forEach(destroy => {
			destroy.addEventListener('click', async () => {
				const id = destroy.getAttribute('data-id');
				const username = (destroy.parentElement.parentElement.querySelector('h2')).textContent;
				const answer = confirm(`Voulez-vous vraiment supprimer l'utilisateur ${username} ?`);
				if (answer) {
					const deleteDetails = await deleteUser(id);
					console.log(deleteDetails);
					await setUsers();
				};
			});
		});
	};
	displayUsers(); 

	document.querySelectorAll('.order-select').forEach(select => {
		select.addEventListener('change', displayUsers);
	});
};

setUsers();