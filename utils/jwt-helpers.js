// • Module Import
import jwt from 'jsonwebtoken';

/**
 * Creates accessToken and refreshToken 
 * @param {object} user
 * @returns {object} tokens
 */
function jwtTokens(user) {
	const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '20s'});
	const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '5m'});
	return ({accessToken, refreshToken});
};

export {jwtTokens};