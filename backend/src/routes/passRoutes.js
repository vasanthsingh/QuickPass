const express = require('express');
const router = express.Router();

const {
    applyDayPass,
    applyHomePass,
    guardianRespondToHomePass,
    getPassRequestsForWarden,
    approvePassByWarden,
    rejectPassByWarden,
    getMyPassRequests,
    cancelMyPassRequest
} = require('../controller/passController');

const { verifyToken, isWarden } = require('../middleware/authMiddleware');

// POST /api/passes/day - Apply for day pass (Student only)
router.post('/day', verifyToken, applyDayPass);

// POST /api/passes/home - Apply for home pass (Student only)
router.post('/home', verifyToken, applyHomePass);

// GET /api/passes/guardian/respond?token=...&action=accept|reject - Guardian decision (Public)
router.get('/guardian/respond', guardianRespondToHomePass);

// POST /api/passes/guardian/respond - Guardian decision (Public)
router.post('/guardian/respond', guardianRespondToHomePass);

// GET /api/passes/me - Get own pass requests (Student only)
router.get('/me', verifyToken, getMyPassRequests);

// PUT /api/passes/:id/cancel - Cancel own pending pass request (Student only)
router.put('/:id/cancel', verifyToken, cancelMyPassRequest);

// GET /api/passes/warden/requests - Get pass requests for warden page
router.get('/warden/requests', verifyToken, isWarden, getPassRequestsForWarden);

// PUT /api/passes/warden/requests/:id/approve - Warden approve pass
router.put('/warden/requests/:id/approve', verifyToken, isWarden, approvePassByWarden);

// PUT /api/passes/warden/requests/:id/reject - Warden reject pass
router.put('/warden/requests/:id/reject', verifyToken, isWarden, rejectPassByWarden);

module.exports = router;
