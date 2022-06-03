const hostname = window.location.href.split(window.location.pathname)[0];

const path = window.location.pathname.split('/');
const id = path[path.length - 1];

const getUser = async (id) => {
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
            const updateUserDetails = await updateUser(id, payload);
            window.location = "/users";
        } catch (err) {
            console.log(err.message);
        };
    });
})();

document.querySelector(".cancel-btn").addEventListener('click', () => {
    window.location = "/users";
});


