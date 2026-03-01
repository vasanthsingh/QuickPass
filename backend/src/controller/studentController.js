const Student = require('../models/studentModel');
const ProfileRequest = require('../models/profileRequestModel');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const formatMongoError = (err) => {
    if (err && err.code === 11000) {
        const duplicateField = Object.keys(err.keyPattern || {})[0] || 'field';
        return `${duplicateField} already exists`;
    }
    return err.message;
};

// @desc    Create a new student
// @access  Private - Admin only
const createStudent = async (req, res) => {
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

// @desc    Student login
// @access  Public
const studentLogin = async (req, res) => {
    try {
        const { rollNumber, password } = req.body;

        if (!rollNumber || !password) {
            return res.status(400).json({ message: 'rollNumber and password are required' });
        }

        const student = await Student.findOne({ rollNumber });
        if (!student) {
            return res.status(401).json({ message: 'Invalid rollNumber or password' });
        }

        const isPasswordValid = await bcryptjs.compare(password, student.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid rollNumber or password' });
        }

        const token = jwt.sign(
            { id: student._id, rollNumber: student.rollNumber, role: 'Student' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        return res.json({
            message: 'Student login successful',
            token,
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
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Update student password
// @access  Private - Student self
const updateStudentPassword = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'Student') {
            return res.status(403).json({ message: 'Student access required' });
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

        const student = await Student.findById(req.user.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const isCurrentPasswordValid = await bcryptjs.compare(currentPassword, student.password);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const salt = await bcryptjs.genSalt(10);
        student.password = await bcryptjs.hash(newPassword, salt);
        await student.save();

        return res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Get own student profile
// @access  Private - Student self
const getStudentProfile = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'Student') {
            return res.status(403).json({ message: 'Student access required' });
        }

        const student = await Student.findById(req.user.id).select('-password');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        return res.json({
            message: 'Student profile retrieved successfully',
            profile: {
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
                isDefaulter: student.isDefaulter,
                createdAt: student.createdAt
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Update own student profile details
// @access  Private - Student self
const updateStudentProfile = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'Student') {
            return res.status(403).json({ message: 'Student access required' });
        }

        const {
            fullName,
            studentPhone,
            parentPhone,
            studentEmail,
            parentEmail,
            year,
            branch
        } = req.body;

        const student = await Student.findById(req.user.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const hasAnyField = [
            fullName,
            studentPhone,
            parentPhone,
            studentEmail,
            parentEmail,
            year,
            branch
        ].some((value) => value !== undefined);

        if (!hasAnyField) {
            return res.status(400).json({
                message: 'At least one of fullName, studentPhone, parentPhone, studentEmail, parentEmail, year or branch is required'
            });
        }

        if (fullName !== undefined) student.fullName = fullName;
        if (studentPhone !== undefined) student.studentPhone = studentPhone;
        if (parentPhone !== undefined) student.parentPhone = parentPhone;
        if (studentEmail !== undefined) student.studentEmail = studentEmail;
        if (parentEmail !== undefined) student.parentEmail = parentEmail;
        if (year !== undefined) student.year = year;
        if (branch !== undefined) student.branch = branch;

        await student.save();

        return res.json({
            message: 'Student profile updated successfully',
            profile: {
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
                isDefaulter: student.isDefaulter,
                createdAt: student.createdAt
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: formatMongoError(err) });
    }
};

// @desc    Create profile change request
// @access  Private - Student self
const createProfileChangeRequest = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'Student') {
            return res.status(403).json({ message: 'Student access required' });
        }

        const student = await Student.findById(req.user.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const allowedFields = {
            fullName: 'Full Name',
            studentPhone: 'Phone Number',
            studentEmail: 'Student Email',
            parentPhone: 'Guardian Phone',
            parentEmail: 'Guardian Email',
            year: 'Year',
            branch: 'Branch'
        };

        let changes = Array.isArray(req.body.changes) ? req.body.changes : [];

        if (changes.length === 0 && req.body.updates && typeof req.body.updates === 'object') {
            changes = Object.entries(req.body.updates)
                .filter(([field, newValue]) => allowedFields[field] && newValue !== undefined)
                .map(([field, newValue]) => ({
                    field,
                    label: allowedFields[field],
                    oldValue: student[field] !== undefined && student[field] !== null ? String(student[field]) : '',
                    newValue: String(newValue)
                }));
        }

        if (!Array.isArray(changes) || changes.length === 0) {
            return res.status(400).json({
                message: 'Provide changes array or updates object with at least one editable field'
            });
        }

        const normalizedChanges = changes
            .filter((change) => change && allowedFields[change.field])
            .map((change) => ({
                field: change.field,
                label: change.label || allowedFields[change.field],
                oldValue: change.oldValue !== undefined
                    ? String(change.oldValue)
                    : (student[change.field] !== undefined && student[change.field] !== null ? String(student[change.field]) : ''),
                newValue: String(change.newValue || '')
            }))
            .filter((change) => change.newValue.trim() !== '');

        if (normalizedChanges.length === 0) {
            return res.status(400).json({ message: 'No valid profile changes found' });
        }

        const profileRequest = await ProfileRequest.create({
            studentId: student._id,
            changes: normalizedChanges
        });

        return res.status(201).json({
            message: 'Profile change request submitted successfully',
            request: profileRequest
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: formatMongoError(err) });
    }
};

// @desc    Get own profile change requests
// @access  Private - Student self
const getMyProfileChangeRequests = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'Student') {
            return res.status(403).json({ message: 'Student access required' });
        }

        const requests = await ProfileRequest.find({ studentId: req.user.id })
            .sort({ requestDate: -1 });

        return res.json({
            message: 'Profile change requests retrieved successfully',
            count: requests.length,
            requests
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Get all students
// @access  Private - Admin only
const getAllStudents = async (req, res) => {
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

// @desc    Get student by ID
// @access  Private - Admin only
const getStudentById = async (req, res) => {
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
// @access  Private - Admin only
const updateStudent = async (req, res) => {
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
// @access  Private - Admin only
const deleteStudent = async (req, res) => {
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
    createStudent,
    studentLogin,
    updateStudentPassword,
    getStudentProfile,
    updateStudentProfile,
    createProfileChangeRequest,
    getMyProfileChangeRequests,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent
};
