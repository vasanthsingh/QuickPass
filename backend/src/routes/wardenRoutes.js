const express = require('express');
const router = express.Router();

const {
    wardenLogin,
    getWardenProfile,
    updateWardenProfile,
    updateWardenPassword,
    getProfileRequestsByWarden,
    approveProfileRequestByWarden,
    rejectProfileRequestByWarden,
    createStudentByWarden,
    createSecurityByWarden,
    getSecurityDatabaseByWarden,
    deleteSecurityByWarden,
    getAllStudentsByWarden,
    getStudentDatabaseByWarden,
    getStudentByIdByWarden,
    updateStudentByWarden,
    deleteStudentByWarden
} = require('../controller/wardenController');
const {
    getPassRequestsForWarden,
    approvePassByWarden,
    rejectPassByWarden
} = require('../controller/passController');
const { uploadStudentPhoto } = require('../middleware/uploadMiddleware');

const { verifyToken, isWarden } = require('../middleware/authMiddleware');

// POST /api/warden/login - Warden login (Public)
router.post('/login', wardenLogin);

// GET /api/warden/profile - Get own profile (Warden only)
router.get('/profile', verifyToken, isWarden, getWardenProfile);

// PUT /api/warden/profile - Update own profile details (Warden only)
router.put('/profile', verifyToken, isWarden, updateWardenProfile);

// PUT /api/warden/update-password - Update own password (Warden only)
router.put('/update-password', verifyToken, isWarden, updateWardenPassword);

// GET /api/warden/profile-requests - Get profile change requests (Warden only)
router.get('/profile-requests', verifyToken, isWarden, getProfileRequestsByWarden);

// PUT /api/warden/profile-requests/:id/approve - Approve profile request (Warden only)
router.put('/profile-requests/:id/approve', verifyToken, isWarden, approveProfileRequestByWarden);

// PUT /api/warden/profile-requests/:id/reject - Reject profile request (Warden only)
router.put('/profile-requests/:id/reject', verifyToken, isWarden, rejectProfileRequestByWarden);

// POST /api/warden/students/add - Create student (Warden only)
router.post('/students/add', verifyToken, isWarden, uploadStudentPhoto.single('profilePhoto'), createStudentByWarden);

// POST /api/warden/security/add - Create security guard (Warden only)
router.post('/security/add', verifyToken, isWarden, createSecurityByWarden);

// GET /api/warden/security/database - Get security guard database table data (Warden only)
router.get('/security/database', verifyToken, isWarden, getSecurityDatabaseByWarden);

// DELETE /api/warden/security/:id - Delete security guard (Warden only)
router.delete('/security/:id', verifyToken, isWarden, deleteSecurityByWarden);

// GET /api/warden/students - Get all students (Warden only)
router.get('/students', verifyToken, isWarden, getAllStudentsByWarden);

// GET /api/warden/students/database - Get student database table data (Warden only)
router.get('/students/database', verifyToken, isWarden, getStudentDatabaseByWarden);

// GET /api/warden/students/:id - Get student by ID (Warden only)
router.get('/students/:id', verifyToken, isWarden, getStudentByIdByWarden);

// PUT /api/warden/students/:id - Update student (Warden only)
router.put('/students/:id', verifyToken, isWarden, updateStudentByWarden);

// DELETE /api/warden/students/:id - Delete student (Warden only)
router.delete('/students/:id', verifyToken, isWarden, deleteStudentByWarden);

// GET /api/warden/pass-requests - Pass requests for warden page
router.get('/pass-requests', verifyToken, isWarden, getPassRequestsForWarden);

// PUT /api/warden/pass-requests/:id/approve - Approve pass request (Warden only)
router.put('/pass-requests/:id/approve', verifyToken, isWarden, approvePassByWarden);

// PUT /api/warden/pass-requests/:id/reject - Reject pass request (Warden only)
router.put('/pass-requests/:id/reject', verifyToken, isWarden, rejectPassByWarden);

module.exports = router;
