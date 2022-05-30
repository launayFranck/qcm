function b64DecodeUnicode(str) {
	return decodeURIComponent(
		atob(str).replace(/(.)/g, function (m, p) {
			let code = p.charCodeAt(0).toString(16).toUpperCase();
			if (code.length < 2) {
				code = "0" + code;
			}
			return "%" + code;
		})
	);
};

function base64_url_decode(str) {
	let output = str.replace(/-/g, "+").replace(/_/g, "/");
	switch (output.length % 4) {
		case 0:
			break;
		case 2:
			output += "==";
			break;
		case 3:
			output += "=";
			break;
		default:
			throw "Illegal base64url string!";
	};

	try {
		return b64DecodeUnicode(output);
	} catch (err) {
		return atob(output);
	};
}

/**
 * Decode token
 * @param {string} token 
 * @param {object} options 
 * @returns {object}
 */
export function jwtDecode(token, options) {
	options = options || {};
	let pos = options.header === true ? 0 : 1;
	try {
		return JSON.parse(base64_url_decode(token.split(".")[pos]));
	} catch (e) {
		console.log(e.message);
	};
};
