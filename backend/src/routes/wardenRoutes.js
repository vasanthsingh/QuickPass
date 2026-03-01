const express = require('express');
const router = express.Router();

const {
    wardenLogin,
    getWardenProfile,
    updateWardenProfile,
    updateWardenPassword,
    createStudentByWarden,
    createSecurityByWarden,
    deleteSecurityByWarden,
    getAllStudentsByWarden,
    getStudentDatabaseByWarden,
    getStudentByIdByWarden,
    updateStudentByWarden,
    deleteStudentByWarden
} = require('../controller/wardenController');

const { verifyToken, isWarden } = require('../middleware/authMiddleware');

// POST /api/warden/login - Warden login (Public)
router.post('/login', wardenLogin);

// GET /api/warden/profile - Get own profile (Warden only)
router.get('/profile', verifyToken, isWarden, getWardenProfile);

// PUT /api/warden/profile - Update own profile details (Warden only)
router.put('/profile', verifyToken, isWarden, updateWardenProfile);

// PUT /api/warden/update-password - Update own password (Warden only)
router.put('/update-password', verifyToken, isWarden, updateWardenPassword);

// POST /api/warden/students/add - Create student (Warden only)
router.post('/students/add', verifyToken, isWarden, createStudentByWarden);

// POST /api/warden/security/add - Create security guard (Warden only)
router.post('/security/add', verifyToken, isWarden, createSecurityByWarden);

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

module.exports = router;
