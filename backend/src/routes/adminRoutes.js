// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const {
    createAdmin,
    adminLogin,
    wardenLogin,
    securityLogin,
    getAllAdmins,
    getAdminById,
    updateAdmin,
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
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// POST /api/admin/login - Admin login (Public)
router.post('/login', adminLogin);

// POST /api/admin/wardens/login - Warden login (Public)
router.post('/wardens/login', wardenLogin);

// POST /api/admin/security/login - Security guard login (Public)
router.post('/security/login', securityLogin);

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

// GET /api/admin/:id - Get admin by ID (Admin only)
router.get('/:id', verifyToken, isAdmin, getAdminById);

// PUT /api/admin/:id - Update admin profile (Authenticated)
router.put('/:id', verifyToken, updateAdmin);

// DELETE /api/admin/:id - Delete admin (Admin only)
router.delete('/:id', verifyToken, isAdmin, deleteAdmin);

module.exports = router;
