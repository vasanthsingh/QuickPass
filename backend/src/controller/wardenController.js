const Student = require('../models/studentModel');
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

// @desc    Update warden password
// @access  Private - Warden self
const updateWardenPassword = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'Warden') {
            return res.status(403).json({ message: 'Warden access required' });
        }

        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'currentPassword and newPassword are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long' });
        }

        if (confirmPassword !== undefined && newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'newPassword and confirmPassword do not match' });
        }

        const warden = await Warden.findById(req.user.id);
        if (!warden) {
            return res.status(404).json({ message: 'Warden not found' });
        }

        const isCurrentPasswordValid = await bcryptjs.compare(currentPassword, warden.password);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const salt = await bcryptjs.genSalt(10);
        warden.password = await bcryptjs.hash(newPassword, salt);
        await warden.save();

        return res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Get warden profile
// @access  Private - Warden self
const getWardenProfile = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'Warden') {
            return res.status(403).json({ message: 'Warden access required' });
        }

        const warden = await Warden.findById(req.user.id).select('-password');
        if (!warden) {
            return res.status(404).json({ message: 'Warden not found' });
        }

        return res.json({
            message: 'Warden profile retrieved successfully',
            profile: {
                id: warden._id,
                fullName: warden.fullName,
                wardenId: warden.wardenId,
                email: warden.email,
                phoneNumber: warden.phoneNumber,
                assignedHostel: warden.assignedHostel,
                officeLocation: warden.officeLocation || null,
                isActive: warden.isActive,
                createdAt: warden.createdAt
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Update warden profile details
// @access  Private - Warden self
const updateWardenProfile = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'Warden') {
            return res.status(403).json({ message: 'Warden access required' });
        }

        const { fullName, email, phoneNumber, assignedHostel, officeLocation } = req.body;

        const warden = await Warden.findById(req.user.id);
        if (!warden) {
            return res.status(404).json({ message: 'Warden not found' });
        }

        if (email !== undefined && email !== warden.email) {
            const emailExists = await Warden.findOne({ email, _id: { $ne: warden._id } });
            if (emailExists) {
                return res.status(400).json({ message: 'Warden with this email already exists' });
            }
            warden.email = email;
        }

        if (fullName !== undefined) warden.fullName = fullName;
        if (phoneNumber !== undefined) warden.phoneNumber = phoneNumber;
        if (assignedHostel !== undefined) warden.assignedHostel = assignedHostel;
        if (officeLocation !== undefined) warden.officeLocation = officeLocation;

        await warden.save();

        return res.json({
            message: 'Warden profile updated successfully',
            profile: {
                id: warden._id,
                fullName: warden.fullName,
                wardenId: warden.wardenId,
                email: warden.email,
                phoneNumber: warden.phoneNumber,
                assignedHostel: warden.assignedHostel,
                officeLocation: warden.officeLocation || null,
                isActive: warden.isActive,
                createdAt: warden.createdAt
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: formatMongoError(err) });
    }
};

// @desc    Create a new student
// @access  Private - Warden only
const createStudentByWarden = async (req, res) => {
    try {
        const {
            fullName,
            rollNumber,
            studentPhone,
            parentPhone,
            studentEmail,
            parentEmail,
            hostelBlock,
            roomNumber,
            year,
            branch,
            password
        } = req.body;

        if (!fullName || !rollNumber || !studentPhone || !parentPhone || !hostelBlock || !roomNumber) {
            return res.status(400).json({
                message: 'fullName, rollNumber, studentPhone, parentPhone, hostelBlock and roomNumber are required'
            });
        }

        const existingStudent = await Student.findOne({ rollNumber });
        if (existingStudent) {
            return res.status(400).json({ message: 'Student with this rollNumber already exists' });
        }

        const plainPassword = password || '123456';
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(plainPassword, salt);

        const student = await Student.create({
            fullName,
            rollNumber,
            studentPhone,
            parentPhone,
            studentEmail,
            parentEmail,
            hostelBlock,
            roomNumber,
            year,
            branch,
            password: hashedPassword
        });

        return res.status(201).json({
            message: 'Student created successfully',
            student: {
                id: student._id,
                fullName: student.fullName,
                rollNumber: student.rollNumber,
                studentPhone: student.studentPhone,
                parentPhone: student.parentPhone,
                studentEmail: student.studentEmail,
                parentEmail: student.parentEmail,
                hostelBlock: student.hostelBlock,
                roomNumber: student.roomNumber,
                year: student.year,
                branch: student.branch,
                isDefaulter: student.isDefaulter
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: formatMongoError(err) });
    }
};

// @desc    Create security guard
// @access  Private - Warden only
const createSecurityByWarden = async (req, res) => {
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

// @desc    Delete security guard
// @access  Private - Warden only
const deleteSecurityByWarden = async (req, res) => {
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

// @desc    Get all students
// @access  Private - Warden only
const getAllStudentsByWarden = async (req, res) => {
    try {
        const students = await Student.find().select('-password');
        return res.json({
            message: 'Students retrieved successfully',
            count: students.length,
            students
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Get student database view for warden panel
// @access  Private - Warden only
const getStudentDatabaseByWarden = async (req, res) => {
    try {
        const search = (req.query.search || '').trim();

        const filter = {};
        if (search) {
            filter.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { rollNumber: { $regex: search, $options: 'i' } },
                { studentPhone: { $regex: search, $options: 'i' } },
                { studentEmail: { $regex: search, $options: 'i' } },
                { roomNumber: { $regex: search, $options: 'i' } },
                { hostelBlock: { $regex: search, $options: 'i' } }
            ];
        }

        const students = await Student.find(filter)
            .select('fullName rollNumber roomNumber hostelBlock studentPhone studentEmail isDefaulter')
            .sort({ createdAt: -1 });

        const rows = students.map((student) => ({
            id: student._id,
            studentInfo: {
                fullName: student.fullName,
                rollNumber: student.rollNumber
            },
            room: {
                roomNumber: student.roomNumber,
                hostelBlock: student.hostelBlock,
                display: `${student.hostelBlock}-${student.roomNumber}`
            },
            contact: {
                phone: student.studentPhone,
                email: student.studentEmail || null
            },
            status: student.isDefaulter ? 'Defaulter' : 'Active',
            isDefaulter: student.isDefaulter
        }));

        const activeCount = rows.filter((row) => !row.isDefaulter).length;
        const defaulterCount = rows.filter((row) => row.isDefaulter).length;

        return res.json({
            message: 'Student database retrieved successfully',
            totalStudents: rows.length,
            activeCount,
            defaulterCount,
            search,
            students: rows
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Get student by ID
// @access  Private - Warden only
const getStudentByIdByWarden = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).select('-password');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        return res.json({
            message: 'Student retrieved successfully',
            student
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Update student
// @access  Private - Warden only
const updateStudentByWarden = async (req, res) => {
    try {
        const {
            fullName,
            studentPhone,
            parentPhone,
            studentEmail,
            parentEmail,
            hostelBlock,
            roomNumber,
            year,
            branch,
            password,
            isDefaulter
        } = req.body;

        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (fullName !== undefined) student.fullName = fullName;
        if (studentPhone !== undefined) student.studentPhone = studentPhone;
        if (parentPhone !== undefined) student.parentPhone = parentPhone;
        if (studentEmail !== undefined) student.studentEmail = studentEmail;
        if (parentEmail !== undefined) student.parentEmail = parentEmail;
        if (hostelBlock !== undefined) student.hostelBlock = hostelBlock;
        if (roomNumber !== undefined) student.roomNumber = roomNumber;
        if (year !== undefined) student.year = year;
        if (branch !== undefined) student.branch = branch;
        if (isDefaulter !== undefined) student.isDefaulter = isDefaulter;

        if (password) {
            const salt = await bcryptjs.genSalt(10);
            student.password = await bcryptjs.hash(password, salt);
        }

        await student.save();

        return res.json({
            message: 'Student updated successfully',
            student: {
                id: student._id,
                fullName: student.fullName,
                rollNumber: student.rollNumber,
                studentPhone: student.studentPhone,
                parentPhone: student.parentPhone,
                studentEmail: student.studentEmail,
                parentEmail: student.parentEmail,
                hostelBlock: student.hostelBlock,
                roomNumber: student.roomNumber,
                year: student.year,
                branch: student.branch,
                isDefaulter: student.isDefaulter
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: formatMongoError(err) });
    }
};

// @desc    Delete student
// @access  Private - Warden only
const deleteStudentByWarden = async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        return res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = {
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
};
