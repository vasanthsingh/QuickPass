// controller/adminController.js
const Admin = require('../models/adminModel');
const Warden = require('../models/wardenModel');
const Guard = require('../models/securityModel');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const formatMongoError = (err) => {
    if (err && err.code === 11000) {
        const duplicateField = Object.keys(err.keyPattern || {})[0] || 'field';
        return `${duplicateField} already exists`;
    }
    return err.message;
};

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

// @desc    Warden login
// @access  Public
const wardenLogin = async (req, res) => {
    try {
        const { wardenId, password } = req.body;

        if (!wardenId || !password) {
            return res.status(400).json({ message: 'wardenId and password are required' });
        }

        const warden = await Warden.findOne({ wardenId });
        if (!warden) {
            return res.status(401).json({ message: 'Invalid wardenId or password' });
        }

        const isPasswordValid = await bcryptjs.compare(password, warden.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid wardenId or password' });
        }

        const token = jwt.sign(
            { id: warden._id, wardenId: warden.wardenId, role: 'Warden' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        return res.json({
            message: 'Warden login successful',
            token,
            warden: {
                id: warden._id,
                fullName: warden.fullName,
                wardenId: warden.wardenId,
                email: warden.email,
                phoneNumber: warden.phoneNumber,
                assignedHostel: warden.assignedHostel,
                isActive: warden.isActive
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Security guard login
// @access  Public
const securityLogin = async (req, res) => {
    try {
        const { guardId, password } = req.body;

        if (!guardId || !password) {
            return res.status(400).json({ message: 'guardId and password are required' });
        }

        const guard = await Guard.findOne({ guardId });
        if (!guard) {
            return res.status(401).json({ message: 'Invalid guardId or password' });
        }

        const isPasswordValid = await bcryptjs.compare(password, guard.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid guardId or password' });
        }

        const token = jwt.sign(
            { id: guard._id, guardId: guard.guardId, role: 'Security' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        return res.json({
            message: 'Security login successful',
            token,
            security: {
                id: guard._id,
                fullName: guard.fullName,
                guardId: guard.guardId,
                phoneNumber: guard.phoneNumber,
                email: guard.email,
                assignedGate: guard.assignedGate,
                shiftTime: guard.shiftTime,
                status: guard.status,
                dateJoined: guard.dateJoined
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
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

// @desc    Create warden
// @access  Private - Admin only
const createWarden = async (req, res) => {
    try {
        const { fullName, wardenId, email, password, phoneNumber, assignedHostel, isActive } = req.body;

        if (!fullName || !wardenId || !email || !password || !phoneNumber || !assignedHostel) {
            return res.status(400).json({
                message: 'fullName, wardenId, email, password, phoneNumber and assignedHostel are required'
            });
        }

        const existingWarden = await Warden.findOne({
            $or: [{ wardenId }, { email }]
        });

        if (existingWarden) {
            return res.status(400).json({ message: 'Warden with this wardenId or email already exists' });
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        const warden = await Warden.create({
            fullName,
            wardenId,
            email,
            password: hashedPassword,
            phoneNumber,
            assignedHostel,
            isActive
        });

        return res.status(201).json({
            message: 'Warden created successfully',
            warden: {
                id: warden._id,
                fullName: warden.fullName,
                wardenId: warden.wardenId,
                email: warden.email,
                phoneNumber: warden.phoneNumber,
                assignedHostel: warden.assignedHostel,
                isActive: warden.isActive
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: formatMongoError(err) });
    }
};

// @desc    Get all wardens
// @access  Private - Admin only
const getAllWardens = async (req, res) => {
    try {
        const wardens = await Warden.find().select('-password');
        return res.json({
            message: 'Wardens retrieved successfully',
            count: wardens.length,
            wardens
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Get warden by ID
// @access  Private - Admin only
const getWardenById = async (req, res) => {
    try {
        const warden = await Warden.findById(req.params.id).select('-password');
        if (!warden) {
            return res.status(404).json({ message: 'Warden not found' });
        }

        return res.json({
            message: 'Warden retrieved successfully',
            warden
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Update warden
// @access  Private - Admin only
const updateWarden = async (req, res) => {
    try {
        const { fullName, email, password, phoneNumber, assignedHostel, isActive } = req.body;

        const warden = await Warden.findById(req.params.id);
        if (!warden) {
            return res.status(404).json({ message: 'Warden not found' });
        }

        if (fullName !== undefined) warden.fullName = fullName;
        if (email !== undefined) warden.email = email;
        if (phoneNumber !== undefined) warden.phoneNumber = phoneNumber;
        if (assignedHostel !== undefined) warden.assignedHostel = assignedHostel;
        if (isActive !== undefined) warden.isActive = isActive;

        if (password) {
            const salt = await bcryptjs.genSalt(10);
            warden.password = await bcryptjs.hash(password, salt);
        }

        await warden.save();

        return res.json({
            message: 'Warden updated successfully',
            warden: {
                id: warden._id,
                fullName: warden.fullName,
                wardenId: warden.wardenId,
                email: warden.email,
                phoneNumber: warden.phoneNumber,
                assignedHostel: warden.assignedHostel,
                isActive: warden.isActive
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: formatMongoError(err) });
    }
};

// @desc    Delete warden
// @access  Private - Admin only
const deleteWarden = async (req, res) => {
    try {
        const warden = await Warden.findByIdAndDelete(req.params.id);
        if (!warden) {
            return res.status(404).json({ message: 'Warden not found' });
        }

        return res.json({ message: 'Warden deleted successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Create security guard
// @access  Private - Admin only
const createSecurity = async (req, res) => {
    try {
        const {
            fullName,
            guardId,
            password,
            phoneNumber,
            email,
            assignedGate,
            shiftTime,
            status,
            dateJoined
        } = req.body;

        if (!fullName || !guardId || !password || !phoneNumber || !assignedGate || !dateJoined) {
            return res.status(400).json({
                message: 'fullName, guardId, password, phoneNumber, assignedGate and dateJoined are required'
            });
        }

        const existingGuard = await Guard.findOne({
            $or: [{ guardId }, ...(email ? [{ email }] : [])]
        });

        if (existingGuard) {
            return res.status(400).json({ message: 'Security guard with this guardId or email already exists' });
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        const guard = await Guard.create({
            fullName,
            guardId,
            password: hashedPassword,
            phoneNumber,
            email,
            assignedGate,
            shiftTime,
            status,
            dateJoined
        });

        return res.status(201).json({
            message: 'Security guard created successfully',
            security: {
                id: guard._id,
                fullName: guard.fullName,
                guardId: guard.guardId,
                phoneNumber: guard.phoneNumber,
                email: guard.email,
                assignedGate: guard.assignedGate,
                shiftTime: guard.shiftTime,
                status: guard.status,
                dateJoined: guard.dateJoined
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: formatMongoError(err) });
    }
};

// @desc    Get all security guards
// @access  Private - Admin only
const getAllSecurity = async (req, res) => {
    try {
        const security = await Guard.find().select('-password');
        return res.json({
            message: 'Security guards retrieved successfully',
            count: security.length,
            security
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Get security guard by ID
// @access  Private - Admin only
const getSecurityById = async (req, res) => {
    try {
        const guard = await Guard.findById(req.params.id).select('-password');
        if (!guard) {
            return res.status(404).json({ message: 'Security guard not found' });
        }

        return res.json({
            message: 'Security guard retrieved successfully',
            security: guard
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Update security guard
// @access  Private - Admin only
const updateSecurity = async (req, res) => {
    try {
        const { fullName, password, phoneNumber, email, assignedGate, shiftTime, status, dateJoined } = req.body;

        const guard = await Guard.findById(req.params.id);
        if (!guard) {
            return res.status(404).json({ message: 'Security guard not found' });
        }

        if (fullName !== undefined) guard.fullName = fullName;
        if (phoneNumber !== undefined) guard.phoneNumber = phoneNumber;
        if (email !== undefined) guard.email = email;
        if (assignedGate !== undefined) guard.assignedGate = assignedGate;
        if (shiftTime !== undefined) guard.shiftTime = shiftTime;
        if (status !== undefined) guard.status = status;
        if (dateJoined !== undefined) guard.dateJoined = dateJoined;

        if (password) {
            const salt = await bcryptjs.genSalt(10);
            guard.password = await bcryptjs.hash(password, salt);
        }

        await guard.save();

        return res.json({
            message: 'Security guard updated successfully',
            security: {
                id: guard._id,
                fullName: guard.fullName,
                guardId: guard.guardId,
                phoneNumber: guard.phoneNumber,
                email: guard.email,
                assignedGate: guard.assignedGate,
                shiftTime: guard.shiftTime,
                status: guard.status,
                dateJoined: guard.dateJoined
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: formatMongoError(err) });
    }
};

// @desc    Delete security guard
// @access  Private - Admin only
const deleteSecurity = async (req, res) => {
    try {
        const guard = await Guard.findByIdAndDelete(req.params.id);
        if (!guard) {
            return res.status(404).json({ message: 'Security guard not found' });
        }

        return res.json({ message: 'Security guard deleted successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = {
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
};
