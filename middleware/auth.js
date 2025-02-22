const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token') || req.header('authorization');

    // Check if no token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Remove Bearer if present
        const tokenString = token.startsWith('Bearer ') ? token.slice(7) : token;

        // Verify token
        const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
        
        // Add user info to request
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
}; 