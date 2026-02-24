// controller/adminController.js
const Admin = require('../models/adminModel');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new admin (Admin only)
// @access  Private - Admin only
const createAdmin = async (req, res) => {
    try {
        const { username, password, email, name } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // Check if admin already exists
        let admin = await Admin.findOne({ username });
        if (admin) {
            return res.status(400).json({ message: 'Admin with this username already exists' });
        }

        // Hash password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        // Create new admin
        admin = new Admin({
            username,
            password: hashedPassword,
            email,
            name,
            role: 'Admin',
            createdAt: new Date()
        });

        await admin.save();

        res.status(201).json({
            message: 'Admin created successfully',
            admin: { id: admin._id, username: admin.username, email: admin.email, role: admin.role }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Admin login
// @access  Public
const adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // Find admin
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Check password
        const isPasswordValid = await bcryptjs.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: admin._id, username: admin.username, role: admin.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            admin: { id: admin._id, username: admin.username, email: admin.email, role: admin.role }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Get all admins
// @access  Private - Admin only
const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find().select('-password');
        res.json({
            message: 'Admins retrieved successfully',
            count: admins.length,
            admins
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Get admin by ID
// @access  Private - Admin or own profile
const getAdminById = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id).select('-password');
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.json({ message: 'Admin retrieved successfully', admin });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Update admin profile
// @access  Private - Self or Admin
const updateAdmin = async (req, res) => {
    try {
        const { email, name, password } = req.body;

        let admin = await Admin.findById(req.params.id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Update allowed fields
        if (email) admin.email = email;
        if (name) admin.name = name;

        // If password update is requested
        if (password) {
            const salt = await bcryptjs.genSalt(10);
            admin.password = await bcryptjs.hash(password, salt);
        }

        admin.updatedAt = new Date();
        await admin.save();

        res.json({
            message: 'Admin updated successfully',
            admin: { id: admin._id, username: admin.username, email: admin.email, role: admin.role }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Delete admin
// @access  Private - Admin only
const deleteAdmin = async (req, res) => {
    try {
        const admin = await Admin.findByIdAndDelete(req.params.id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.json({ message: 'Admin deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Get admin dashboard stats
// @access  Private - Admin only
const getDashboardStats = async (req, res) => {
    try {
        const totalAdmins = await Admin.countDocuments();
        const lastUpdated = new Date();

        res.json({
            message: 'Dashboard stats retrieved',
            stats: {
                totalAdmins,
                lastUpdated
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = {
    createAdmin,
    adminLogin,
    getAllAdmins,
    getAdminById,
    updateAdmin,
    deleteAdmin,
    getDashboardStats
};
