import {jwtDecode} from "./jwt-decode.js";

const api_url = 'http://localhost:3000/api';

if (localStorage.getItem('jwt')) {
    const jwtDecoded = jwtDecode(localStorage.getItem('jwt'));

    const h1 = document.createElement('h1');
    h1.innerText = `Bienvenue, ${jwtDecoded.firstname} ${jwtDecoded.lastname}`;

    const p = document.createElement('p');
    p.innerText = `Votre email est ${jwtDecoded.email}`;

    const btn = document.createElement('button');
    btn.onclick = deleteToken();

    document.body.appendChild(h1);
    document.body.appendChild(p);
    document.body.appendChild(btn);
} else {
    window.location.href = "/login.html";
};