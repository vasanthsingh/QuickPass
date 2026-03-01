const Guard = require('../models/securityModel');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

// @desc    Update security password
// @access  Private - Security self
const updateSecurityPassword = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'Security') {
            return res.status(403).json({ message: 'Security access required' });
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

        const guard = await Guard.findById(req.user.id);
        if (!guard) {
            return res.status(404).json({ message: 'Security guard not found' });
        }

        const isCurrentPasswordValid = await bcryptjs.compare(currentPassword, guard.password);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const salt = await bcryptjs.genSalt(10);
        guard.password = await bcryptjs.hash(newPassword, salt);
        await guard.save();

        return res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = {
    securityLogin,
    updateSecurityPassword
};
