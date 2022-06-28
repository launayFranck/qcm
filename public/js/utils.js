/**
 * Capitalizes a string
 * @param {string} str The string to capitalize
 * @param {boolean} capitalizeAllWords Defines if each word from the string must be capitalized
 * @returns {string} The capitalized string
 */
const capitalize = (str, capitalizeAllWords = false) => {
	const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

	if (capitalizeAllWords) return str.split(' ').map(str => cap(str)).join('');
	else return cap(str);
};

/**
 * Turns a timestamp into a formatted date string
 * @param {date} timestamp The timestamp we wish to convert
 * @param {string} format The string to use as a template for the formatted date. Can include $Y (year), $M (month), $D (date), $d (day), $H (hours), $m (minutes), $s (seconds). E.g. : "$Y/$M/$D at $H/$m".
 * @returns {string} A date with the following format : "DD/MM/YYYY"
 */
const formatDate = (timestamp, format = '$D/$M/$Y à $H:$m') => {
	const formatted = new Date(timestamp);

	const year = formatted.getFullYear();
	const month = ((formatted.getMonth()).toString()).length < 2 ? `0${formatted.getMonth() + 1}` : formatted.getMonth() + 1;
	const date = ((formatted.getDate()).toString()).length < 2 ? `0${formatted.getDate()}` : formatted.getDate();
	const day = (() => {
		const lang = (document.querySelector('html').getAttribute('lang')).toUpperCase();
		const days = {
			EN : {
				0 : 'Sunday',
				1 : 'Monday',
				2 : 'Tuesday',
				3 : 'Wednesday',
				4 : 'Thursday',
				5 : 'Friday',
				6 : 'Saturday',
				default : 'Unknown day'
			},
			FR : {
				0 : 'Dimanche',
				1 : 'Lundi',
				2 : 'Mardi',
				3 : 'Mercredi',
				4 : 'Jeudi',
				5 : 'Vendredi',
				6 : 'Samedi',
				default : 'Jour inconnu'
			}
		};
		
		return days[lang] ?
			days[lang][formatted.getDay()] ?
				days[lang][formatted.getDay()]
				:
				days[lang].default
			:
			days.EN.default
		;
	})();
	
	const hours = ((formatted.getHours()).toString()).length < 2 ? `0${formatted.getHours()}` : formatted.getHours();
	const minutes = ((formatted.getMinutes()).toString()).length < 2 ? `0${formatted.getMinutes()}` : formatted.getMinutes();
	const seconds = ((formatted.getSeconds()).toString()).length < 2 ? `0${formatted.getSeconds()}` : formatted.getSeconds();

	let tmp = format;
	tmp = tmp.replace('$Y', year);
	tmp = tmp.replace('$M', month);
	tmp = tmp.replace('$D', date);
	tmp = tmp.replace('$d', day);
	tmp = tmp.replace('$H', hours);
	tmp = tmp.replace('$m', minutes);
	tmp = tmp.replace('$s', seconds);

	return tmp;
};

/**
 * Formats a phone number. E.g. : '0123456789' will be turned to '01.23.45.67.89'
 * @param {string} phone The phone number to format
 * @param {string} char The character used between every 2 characters from the phone number
 * @returns {string} The formatted phone number
 */
const formatPhone = (phone, char = '.') => {
	return phone.match(/.{1,2}/g).join(char);
};

/**
 * Function used to display a message in the top-left corner of the page (navbar not included)
 * @param {string} msg The message to send to the message panel
 * @param {string} color The color in which the message box will be painted
 */
const sendMessageToPanel = async (msg, color) => {
	const messageBox = document.createElement('div');
	messageBox.style.setProperty('background-color', color);
	messageBox.classList.add('message-box');

	const message = document.createElement('p');
	message.innerText = msg;

	messageBox.append(message);

	const messagePanel = document.querySelector('.message-panel')
	messagePanel.append(messageBox);

	setTimeout(() => {
		messagePanel.removeChild(messageBox);
	}, 5000);
};

/**
 * Sorts an array of objects by one of the objects' property
 * @param {array} array The array containing objects to sort
 * @param {string} property The name of the property to use as a filter
 * @param {boolean} ascending Specifies the order of the required informations
 * @returns {Array<object>} The sorted array
 */
 const sortByProperty = (array, property, ascending = true) => {
	try {
		const res = array.sort((a, b) => (a[property].toLowerCase() > b[property].toLowerCase() ?
			(ascending ? 1 : -1)
			:
			(ascending ? -1 : 1)
		));
		// const res = array.sort((a, b) => {
		// 	const aX = Array.isArray(a[property]) ? a[property].length : a[property].toLowerCase();
		// 	const bX = Array.isArray(b[property]) ? b[property].length : b[property].toLowerCase();

		// 	const result = aX > bX ? (ascending ? 1 : -1) : (ascending ? -1 : 1);
			
		// 	console.log(aX, bX, result);
		// 	return result;
		// });

		return res;
	} catch (err) {
		console.error(err.message);
		return array;
	};
};

const validateEmail = (str) => str.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);

export {
    capitalize,
    formatDate,
    formatPhone,
    sendMessageToPanel,
	sortByProperty,
	validateEmail
};

