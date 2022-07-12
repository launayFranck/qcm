/**
 * Capitalizes a string
 * @param {string} str The string to capitalize
 * @param {boolean} allWords Defines if each word from the string must be capitalized
 * @returns {string} The capitalized string
 */
const capitalize = (str, allWords = false) => {
	try {
		const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

		if (allWords) return str.split(' ').map(str => cap(str)).join('');
		else return cap(str);
	} catch (err) {
		console.error(`Couldn't apply a capitalization to the given element.\n${err.message}`);
		return str;
	};
};

/**
 * Used to convert a date into a legit timestamp
 * @param {date} dateVar The variable containing a date
 * @returns {string} The newly generated timestamp based on the given date
 */
const convertToTimestamp = (dateVar = new Date()) => {
	const year = dateVar.getFullYear();
	const month = formatNumber(dateVar.getMonth() + 1);
	const date = formatNumber(dateVar.getDate());
	const hours = formatNumber(dateVar.getHours());
	const minutes = formatNumber(dateVar.getMinutes());

	return `${year}-${month}-${date}T${hours}:${minutes}`;
};

/**
 * Turns a timestamp into a formatted date string
 * @param {date} timestamp The timestamp we wish to convert
 * @param {string} format The string to use as a template for the formatted date. Can include $Y (year), $M (month), $D (date), $d (day), $H (hours), $m (minutes), $s (seconds). E.g. : "$Y/$M/$D at $H/$m".
 * @returns {string} A date with the following format : "DD/MM/YYYY"
 */
const formatDate = (timestamp, format = '$D/$M/$Y à $H:$m') => {
	try {
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
	} catch (err) {
		console.error(`Couldn't convert the given date to a string.\n${err.message}`);
		return timestamp;
	};
};

/**
 * Turns an object containing hours, minutes and/or seconds properties into a string
 * E.g.: { hours: 1, minutes: 30 } => '01:30'
 * @param {object} interval The object containing hours, minutes or seconds properties. E.g.: { minutes : 50 }
 * @param {string} format The appearance of the returned string, can contain $H for hours, $m for minutes and/or $s for seconds. E.g.: '$H:$m:$s'
 * @returns {string} The formatted interval, now a string
 */
const formatInterval = (interval, format = '$H:$m') => {
	try {
		let tmp = format;
		tmp = tmp.includes('$H') ? tmp.replaceAll('$H', interval.hours ? formatNumber(interval.hours) : '00') : tmp;
		tmp = tmp.includes('$m') ? tmp.replaceAll('$m', interval.minutes ? formatNumber(interval.minutes) : '00') : tmp;
		tmp = tmp.includes('$s') ? tmp.replaceAll('$s', interval.seconds ? formatNumber(interval.seconds) : '00') : tmp;
		return tmp;
	} catch (err) {
		console.error(err.message);
	};
};

/**
 * Converts a number to a string and adds zeros before it if the string's required length isn't satisfied
 * @param {number} number The number to format
 * @param {number} length The amount of characters the string must be
 * @returns {string} The number converted to a string
 */
const formatNumber = (number, length = 2) => {
	return (number.toString()).length < length ? `${(() => {
		let zeroStr = '';
		for (let i = 0; i < (length - (number.toString()).length); i++) {
			zeroStr += '0';
		};
		return zeroStr;
	})()}${number}` : number;
};

/**
 * Formats a phone number. E.g. : '0123456789' will be turned to '01.23.45.67.89'
 * @param {string} phone The phone number to format
 * @param {string} char The character used between every 2 characters from the phone number
 * @returns {string} The formatted phone number
 */
const formatPhone = (phone, char = ' ') => {
	try {
		return phone.match(/.{1,2}/g).join(char);
	} catch (err) {
		console.error(`Couldn't format phone number`);
		return phone;
	};
};

/**
	 * Turns a string into an object containing hours, minutes and/or seconds properties
	 * E.g.: '01:30' => { hours: 1, minutes: 30 }
	 * @param {string} format The appearance of the returned string, can contain $H for hours, $m for minutes and/or $s for seconds. E.g.: '$H:$m:$s'
	 * @param {object} str The string containing hours, minutes or seconds. E.g.: "01:30"
	 * @returns {string} The formatted interval, now an object
	 */
 const reverseFormatInterval = (str) => {
	try {
		const string = (str.split(':')).map(s => parseInt(s));

		const properties = ["hours", "minutes", "seconds"];

		let tmp = {};
		for (let i = 0; i < string.length; i++) {
			if (string[i] != 0) tmp[properties[i]] = string[i];
		};
		
		return tmp;
	} catch (err) {
		console.error(err.message);
	};
};

/**
 * Function used to display a message in the top-left corner of the page (navbar not included)
 * @param {string} msg The message to send to the message panel
 * @param {string} color The color in which the message box will be painted
 */
const sendMessageToPanel = async (msg, color) => {
	try {
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
	} catch (err) {
		console.error(`Couldn't send message to the message panel.\n${err.message}`);
	};
};

/**
 * Sorts an array of objects by one of the objects' property
 * @param {array} array The array containing objects to sort
 * @param {string} property The name of the property to use as a filter
 * @param {boolean} asc Specifies the order of the required informations
 * @returns {Array<object>} The sorted array
 */
 const sortByProperty = (array, property, asc = true) => {
	try {
		/**
		 * Turns a value into an easy sortable value
		 * @param {any} el The value to convert in order to making it "sortable"
		 * @returns {any} The converted value
		 */
		const makeSortable = (el) => {
			return Array.isArray(el) ? el.length : el.toLowerCase();
		};
		
		const res = array.sort((a, b) => makeSortable(a[property]) > makeSortable(b[property]) ?
			(asc ? 1 : -1) : (asc ? -1 : 1)
		);

		return res;
	} catch (err) {
		console.error(`Couldn't sort by property.\n${err.message}`);
		return array;
	};
};

/**
 * Verifies if the given string is a legit email address
 * @param {string} str The email address we want to verify
 * @returns {boolean} Returns true if the given email is a correct email address
 */
const validateEmail = (str) => str.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);

export {
    capitalize,
	convertToTimestamp,
    formatDate,
	formatInterval,
	formatNumber,
    formatPhone,
	reverseFormatInterval,
    sendMessageToPanel,
	sortByProperty,
	validateEmail
};
