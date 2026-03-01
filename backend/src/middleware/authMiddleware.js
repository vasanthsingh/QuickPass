
// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Verify JWT Token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    // Accept token with or without "Bearer" prefix
    const actualToken = token && token.startsWith('Bearer ') ? token.slice(7) : token;

    if (!actualToken) {
        return res.status(401).json({ message: 'No token provided. Access denied.' });
    }

    try {
        const decoded = jwt.verify(actualToken, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ message: 'Admin access required' });
    }
};

// Check if user is warden
const isWarden = (req, res, next) => {
    if (req.user && req.user.role === 'Warden') {
        next();
    } else {
        res.status(403).json({ message: 'Warden access required' });
    }
};

module.exports = { verifyToken, isAdmin, isWarden };
