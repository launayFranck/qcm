import jwt from 'jsonwebtoken';

/**
 * Authenticate token middleware
 * @param {object} req 
 * @param {object} res 
 * @param {function} next
 */
function authenticateToken(req, res, next) {
	const authHeader = req.headers['authorization']; // Bearer Token
	const token = authHeader && authHeader.split(' ')[1];
	if (token == null) return res.status(401).json({error: 'Null token'});
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
		if (error) return res.status(403).json({error: error.message});
		req.user = user;
		next();
	});
};

export {authenticateToken};