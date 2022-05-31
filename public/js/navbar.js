const hostname = window.location.href.split(window.location.pathname)[0];

// • Delete Refresh token to logout
async function deleteToken() {
	const res = await fetch(`${hostname}/api/auth/refresh_token`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json'
		},
		mode: 'cors',
		credentials: 'include'
	});
	return await res.json();
};

/**
 * Log out
 */
const logout = async () => {
	console.log('Logout');
	try {
		const deleteDetails = await deleteToken();
		console.log(deleteDetails);
	} catch (err) {
		console.log(err);
	};
	localStorage.removeItem('Authorization');
	window.location = '/login';
};

document.querySelector('.logoutBtn').addEventListener('click', logout);
