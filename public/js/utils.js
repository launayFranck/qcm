/**
 * Capitalizes a string
 * @param {string} str The string to capitalize
 * @returns {string} The capitalized string
 */
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Turns a timestamp into a formatted date string
 * @param {date} timestamp The timestamp we wish to convert
 * @returns {string} A date with the following format : DD/MM/YYYY
 */
const formatDate = (timestamp) => {
	const formatted = new Date(timestamp);

	const year = formatted.getFullYear();
	const month = ((formatted.getMonth()).toString()).length < 2 ? `0${formatted.getMonth()}` : formatted.getMonth();
	const date = ((formatted.getDate()).toString()).length < 2 ? `0${formatted.getDate()}` : formatted.getDate();

	return `${date}/${month}/${year}`;
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

export {
    capitalize,
    formatDate,
    sendMessageToPanel
};