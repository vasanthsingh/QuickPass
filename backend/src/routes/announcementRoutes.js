const express = require('express');
const router = express.Router();
const { getRoleAnnouncements } = require('../controller/announcementController');
const { verifyToken } = require('../middleware/authMiddleware');

// GET /api/announcements/me - Get announcements for authenticated user's role
router.get('/me', verifyToken, getRoleAnnouncements);

module.exports = router;
