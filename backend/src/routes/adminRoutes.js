// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const {
    createAdmin,
    adminLogin,
    getAllAdmins,
    getAdminById,
    updateAdmin,
    updateAdminPassword,
    deleteAdmin,
    getDashboardStats,
    createWarden,
    getAllWardens,
    getWardenById,
    updateWarden,
    deleteWarden,
    createSecurity,
    getAllSecurity,
    getSecurityById,
    updateSecurity,
    deleteSecurity
} = require('../controller/adminController');
const {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent
} = require('../controller/studentController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// POST /api/admin/login - Admin login (Public)
router.post('/login', adminLogin);

// GET /api/admin/dashboard - Get dashboard stats (Admin only)
router.get('/dashboard', verifyToken, isAdmin, getDashboardStats);

// GET /api/admin - Get all admins (Admin only)
router.get('/', verifyToken, isAdmin, getAllAdmins);

// POST /api/admin/create - Create new admin (Public)
router.post('/create', createAdmin);

// POST /api/admin/wardens - Create warden (Admin only)
router.post('/wardens', verifyToken, isAdmin, createWarden);

// GET /api/admin/wardens - Get all wardens (Admin only)
router.get('/wardens', verifyToken, isAdmin, getAllWardens);

// GET /api/admin/wardens/:id - Get warden by ID (Admin only)
router.get('/wardens/:id', verifyToken, isAdmin, getWardenById);

// PUT /api/admin/wardens/:id - Update warden (Admin only)
router.put('/wardens/:id', verifyToken, isAdmin, updateWarden);

// DELETE /api/admin/wardens/:id - Delete warden (Admin only)
router.delete('/wardens/:id', verifyToken, isAdmin, deleteWarden);

// POST /api/admin/security - Create security guard (Admin only)
router.post('/security', verifyToken, isAdmin, createSecurity);

// GET /api/admin/security - Get all security guards (Admin only)
router.get('/security', verifyToken, isAdmin, getAllSecurity);

// GET /api/admin/security/:id - Get security guard by ID (Admin only)
router.get('/security/:id', verifyToken, isAdmin, getSecurityById);

// PUT /api/admin/security/:id - Update security guard (Admin only)
router.put('/security/:id', verifyToken, isAdmin, updateSecurity);

// DELETE /api/admin/security/:id - Delete security guard (Admin only)
router.delete('/security/:id', verifyToken, isAdmin, deleteSecurity);

// POST /api/admin/students - Create student (Admin only)
router.post('/students', verifyToken, isAdmin, createStudent);

// GET /api/admin/students - Get all students (Admin only)
router.get('/students', verifyToken, isAdmin, getAllStudents);

// GET /api/admin/students/:id - Get student by ID (Admin only)
router.get('/students/:id', verifyToken, isAdmin, getStudentById);

// PUT /api/admin/students/:id - Update student (Admin only)
router.put('/students/:id', verifyToken, isAdmin, updateStudent);

// DELETE /api/admin/students/:id - Delete student (Admin only)
router.delete('/students/:id', verifyToken, isAdmin, deleteStudent);

// PUT /api/admin/update-password - Update own password (Admin only)
router.put('/update-password', verifyToken, isAdmin, updateAdminPassword);

// GET /api/admin/:id - Get admin by ID (Admin only)
router.get('/:id', verifyToken, isAdmin, getAdminById);

// PUT /api/admin/:id - Update admin profile (Authenticated)
router.put('/:id', verifyToken, updateAdmin);

// DELETE /api/admin/:id - Delete admin (Admin only)
router.delete('/:id', verifyToken, isAdmin, deleteAdmin);

module.exports = router;
