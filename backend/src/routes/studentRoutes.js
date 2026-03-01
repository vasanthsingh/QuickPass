// routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const {
    studentLogin,
    updateStudentPassword,
    getStudentProfile,
    updateStudentProfile,
    createProfileChangeRequest,
    getMyProfileChangeRequests,
    getAllStudents,
    getStudentById
} = require('../controller/studentController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// POST /api/students/login - Student login (Public)
router.post('/login', studentLogin);

// GET /api/students/profile - Get own profile (Student only)
router.get('/profile', verifyToken, getStudentProfile);

// PUT /api/students/profile - Update own profile details (Student only)
router.put('/profile', verifyToken, updateStudentProfile);

// POST /api/students/profile-requests - Submit profile change request (Student only)
router.post('/profile-requests', verifyToken, createProfileChangeRequest);

// GET /api/students/profile-requests - Get own profile change requests (Student only)
router.get('/profile-requests', verifyToken, getMyProfileChangeRequests);

// PUT /api/students/update-password - Update own password (Student only)
router.put('/update-password', verifyToken, updateStudentPassword);

// GET /api/students/:id - Get student by ID (Admin only)
router.get('/:id', verifyToken, isAdmin, getStudentById);

module.exports = router;