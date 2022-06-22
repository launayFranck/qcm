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
	try {
		console.log(path);
		// const deleteDetails = await deleteToken();
		// console.log(deleteDetails);

		localStorage.removeItem('Authorization');

		// const res = await fetch(`${hostname}/logout`, {
		// 	method: "GET",
		// });
		// console.log(res);
		// window.location = res.url;
	} catch (err) {
		console.log(err);
	};
};

document.querySelector('.logoutBtn').addEventListener('click', logout);
