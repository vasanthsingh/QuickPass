const express = require('express');
const router = express.Router();

const { securityLogin, updateSecurityPassword } = require('../controller/securityController');
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/security/login - Security login (Public)
router.post('/login', securityLogin);

// PUT /api/security/update-password - Update own password (Security only)
router.put('/update-password', verifyToken, updateSecurityPassword);

module.exports = router;