import { jwtDecode } from "./jwt-decode.js";
import { formatDate, formatPhone, sendMessageToPanel } from "./utils.js";
const hostname = window.location.href.split(window.location.pathname)[0];

// if (!localStorage.getItem('Authorization') || jwtDecode(localStorage.getItem('Authorization')).role !== 1) {
// 	window.location = "/";
// };

const getUserById = async (id) => {
	const res = await fetch(`${hostname}/api/users/${id}`, {
		method: 'GET',
		credentials:'include',
		cache:'no-cache',
		headers: {
			'Content-Type': 'application/json'
		}
	});
	return await res.json();
};

const getLogs = async () => {
	const res = await fetch(`${hostname}/api/logs`, {
		method: 'GET',
		credentials:'include',
		cache:'no-cache',
		headers: {
			'Content-Type': 'application/json'
		}
	});
	return await res.json();
};

const setDetails = (user) => {
	try {
		const datas = [
			{
				name: "Prénom",
				value: user.firstname,
			},
			{
				name: "Nom",
				value: user.lastname,
			},
			{
				name: "Username",
				value: user.username,
			},
			{
				name: "Email",
				value: user.email,
			},
			{
				name: "Téléphone",
				value: formatPhone(user.phone),
			},
			{
				name: "Créé le",
				value: formatDate(user.created_at, '$D/$M/$Y à $H:$m'),
			},
			{
				name: "Mis à jour le",
				value: formatDate(user.updated_at, '$D/$M/$Y à $H:$m'),
			}
		];
	
		const detailsContainer = document.querySelector('.user-details .container-body');
		detailsContainer.innerHTML = "";
		datas.forEach((data, i) => {
			console.log(i, data.name);
			detailsContainer.innerHTML += `
				<div class="row${(i % 2) ? ' darkened' : ''}">
					<p>${data.name}</p>
					<hr>
					<span>${data.value}</span>
				</div>
			`;
		});
	} catch (err) {
		sendMessageToPanel(err.message, 'var(--color-bad-message)');
	};
};

const setActivity = (activity) => {
	try {
		const datas = [
			{
				message : `gdepardieu a supprimé l'utilisateur hkovert`,
				created_at : `2022-06-21 23:58`
			},
			{
				message : `adreemurr a créé l'utilisateur cclavier`,
				created_at : `2022-06-21 23:51`
			},
			{
				message : `admin a supprimé le thème Managerz`,
				created_at : `2022-06-21 23:55`
			},
			{
				message : `cclavier a mis à jour l'utilisateur cclavier`,
				created_at : `2022-06-21 23:59`
			}
		];
		const activityContainer = document.querySelector('.user-activity .container-body');
		activityContainer.innerHTML = "";
		datas.sort((a, b) => new Date(a.created_at) > new Date(b.created_at) ? -1 : 1).forEach((data, i) => {
			activityContainer.innerHTML += `
				<div class="row${i % 2 ? ' darkened' : ''}">
					<p>${data.message}</p>
					<hr>
					<span>${formatDate(data.created_at, '$D/$M/$Y à $H:$m')}</span>
				</div>
			`;
		});
	} catch (err) {
		sendMessageToPanel(err.message, 'var(--color-bad-message)');
	};
}

// Create html elements if Authorized
(async () => {
	try {
		const jwtDecoded = jwtDecode(localStorage.getItem('Authorization'));
		const {users : user} = await getUserById(jwtDecoded.id);

		console.table(user);

		setDetails(user);
		setActivity();
		
		document.querySelector('.user-welcome .firstname').innerText = jwtDecoded.firstname;
	} catch (err) {
		sendMessageToPanel(err.message, 'var(--color-bad-message)');
	}
})();
