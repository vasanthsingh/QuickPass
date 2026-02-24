// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const {
    createAdmin,
    adminLogin,
    getAllAdmins,
    getAdminById,
    updateAdmin,
    deleteAdmin,
    getDashboardStats
} = require('../controller/adminController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Public routes
// @route   POST /api/admin/login
// @desc    Admin login
router.post('/login', adminLogin);

// Protected routes (require authentication)
// @route   GET /api/admin/dashboard
// @desc    Get dashboard stats
router.get('/dashboard', verifyToken, isAdmin, getDashboardStats);

// @route   GET /api/admin
// @desc    Get all admins (Admin only)
router.get('/', verifyToken, isAdmin, getAllAdmins);

// @route   POST /api/admin/create
// @desc    Create new admin (Admin only)
router.post('/create', verifyToken, isAdmin, createAdmin);

// @route   GET /api/admin/:id
// @desc    Get admin by ID
router.get('/:id', verifyToken, isAdmin, getAdminById);

// @route   PUT /api/admin/:id
// @desc    Update admin profile
router.put('/:id', verifyToken, updateAdmin);

// @route   DELETE /api/admin/:id
// @desc    Delete admin (Admin only)
router.delete('/:id', verifyToken, isAdmin, deleteAdmin);

module.exports = router;
