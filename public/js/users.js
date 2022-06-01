const hostname = window.location.href.split(window.location.pathname)[0];

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

(async () => {
	const usersSection = document.querySelector('#users-section');

	// Fetching users
	const {users} = await getAllUsers();
	users.sort((a, b) => (a.role > b.role ? 1 : -1));

	// Filtering distinct roles
	let roles = {};
	users.forEach(user => {
		roles[user.role] = user.name;
	});
	console.log(roles);
	const rolesIds = Object.keys(roles);

	const capitalize = (x) => {
		return x.charAt(0).toUpperCase() + x.slice(1);
	};
	
	// Showing up users sorted by role
	usersSection.innerHTML = '';
	rolesIds.forEach(roleId => {
		const newRoleBox = document.createElement('section');
		newRoleBox.classList.add('role-box');
		newRoleBox.innerHTML = `
			<div class="role-header">
				<h1>${capitalize(roles[roleId])}</h1>
			</div>
		`;
		for (let user of users.filter(user => user.role == roleId)) {
			newRoleBox.innerHTML += `
				<article style="border: solid .5px #c4c4c4">
					<div>
						<h2>${user.username}</h2>
						<p>${user.firstname} ${user.lastname}</p>
						<p>${user.email}</p>
					</div>
				</article>
			`;
		};
		usersSection.appendChild(newRoleBox)
	});
})();