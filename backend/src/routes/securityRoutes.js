const express = require('express');
const router = express.Router();

const {
    securityLogin,
    updateSecurityPassword,
    scanPassQr,
    getRecentScans
} = require('../controller/securityController');
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/security/login - Security login (Public)
router.post('/login', securityLogin);

// PUT /api/security/update-password - Update own password (Security only)
router.put('/update-password', verifyToken, updateSecurityPassword);

// POST /api/security/scan - Validate/scan pass QR for outgoing/incoming
router.post('/scan', verifyToken, scanPassQr);

// GET /api/security/scans/recent?limit=10 - Get recent scan activity for logged-in guard
router.get('/scans/recent', verifyToken, getRecentScans);

module.exports = router;