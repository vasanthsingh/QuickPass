const Guard = require('../models/securityModel');
const Pass = require('../models/passModel');
const GateLog = require('../models/gatelogModel');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const parseScanDirection = (input) => {
    const normalized = String(input || '').trim().toUpperCase();

    if (['OUT', 'OUTGOING', 'EXIT'].includes(normalized)) return 'OUT';
    if (['IN', 'INCOMING', 'ENTRY'].includes(normalized)) return 'IN';
    return null;
};

const buildScanDetails = (pass, direction) => ({
    passId: pass._id,
    passType: pass.passType,
    status: pass.status,
    student: {
        id: pass.studentId?._id,
        fullName: pass.studentId?.fullName,
        rollNumber: pass.studentId?.rollNumber,
        hostelBlock: pass.studentId?.hostelBlock,
        roomNumber: pass.studentId?.roomNumber
    },
    route: {
        fromDate: pass.fromDate,
        fromTime: pass.fromTime,
        toDate: pass.toDate,
        toTime: pass.toTime,
        destination: pass.destination,
        reason: pass.reason
    },
    movement: direction
});

const parseTimeToMinutes = (value) => {
    if (!value || typeof value !== 'string') return NaN;
    const match = value.match(/^(\d{2}):(\d{2})$/);
    if (!match) return NaN;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return NaN;
    return (hours * 60) + minutes;
};

const buildDateTime = (dateInput, timeInput) => {
    const baseDate = new Date(dateInput);
    if (Number.isNaN(baseDate.getTime())) return null;

    const minutes = parseTimeToMinutes(timeInput);
    if (Number.isNaN(minutes)) return null;

    const date = new Date(baseDate);
    date.setHours(0, 0, 0, 0);
    date.setMinutes(minutes);
    return date;
};

const getPassWindow = (pass) => ({
    startAt: buildDateTime(pass?.fromDate, pass?.fromTime),
    endAt: buildDateTime(pass?.toDate, pass?.toTime)
});

const buildWarning = (code, message) => ({ code, message });

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

// @desc    Validate and scan outpass QR at gate (outgoing or incoming)
// @access  Private - Security only
const scanPassQr = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'Security') {
            return res.status(403).json({ message: 'Security access required' });
        }

        const { qrToken, direction, passId } = req.body || {};
        const normalizedDirection = parseScanDirection(direction);

        if ((!qrToken && !passId) || !normalizedDirection) {
            return res.status(400).json({
                valid: false,
                message: 'Provide qrToken or passId and direction (OUT or IN)'
            });
        }

        const qrSecret = process.env.PASS_QR_SECRET || process.env.JWT_SECRET || 'your-secret-key';
        let tokenToVerify = qrToken;
        let pass = null;

        if (!tokenToVerify && passId) {
            pass = await Pass.findById(passId).populate('studentId', 'fullName rollNumber hostelBlock roomNumber');
            if (!pass) {
                return res.status(404).json({ valid: false, message: 'Pass not found for provided pass ID' });
            }

            if (!pass.qrToken) {
                return res.status(400).json({ valid: false, message: 'No QR token available for provided pass ID' });
            }

            tokenToVerify = pass.qrToken;
        }

        let decoded;

        try {
            decoded = jwt.verify(tokenToVerify, qrSecret);
        } catch (err) {
            return res.status(400).json({ valid: false, message: 'Invalid or expired QR code' });
        }

        if (!decoded || decoded.type !== 'OUTPASS_QR' || !decoded.passId) {
            return res.status(400).json({ valid: false, message: 'Invalid QR payload' });
        }

        if (!pass) {
            pass = await Pass.findById(decoded.passId).populate('studentId', 'fullName rollNumber hostelBlock roomNumber');
        }

        if (!pass) {
            return res.status(404).json({ valid: false, message: 'Pass not found for scanned QR' });
        }

        if (passId && String(pass._id) !== String(passId)) {
            return res.status(400).json({ valid: false, message: 'Provided pass ID does not match QR data' });
        }

        if (!pass.qrToken || pass.qrToken !== tokenToVerify) {
            return res.status(400).json({ valid: false, message: 'QR does not match latest approved outpass' });
        }

        const guard = await Guard.findById(req.user.id).select('assignedGate');
        const gateNumber = guard?.assignedGate || 'Gate';

        const now = new Date();
        const warnings = [];
        const { startAt, endAt } = getPassWindow(pass);

        if (normalizedDirection === 'OUT') {
            if (pass.status !== 'Approved') {
                return res.status(400).json({
                    valid: false,
                    message: `Outgoing scan not allowed for pass status ${pass.status}`,
                    details: buildScanDetails(pass, 'OUT'),
                    warnings
                });
            }

            if (startAt && now < startAt) {
                return res.status(400).json({
                    valid: false,
                    message: 'Pass is not yet active for outing (too early scan)',
                    details: buildScanDetails(pass, 'OUT'),
                    warnings: [buildWarning('TOO_EARLY', 'Outing is allowed only after the scheduled start time.')]
                });
            }

            if (endAt && now > endAt) {
                pass.status = 'Expired';
                await pass.save();

                return res.status(400).json({
                    valid: false,
                    message: 'Pass has expired. Outgoing is not allowed.',
                    details: buildScanDetails(pass, 'OUT'),
                    warnings: [buildWarning('PASS_EXPIRED', 'Scheduled pass window has ended.')]
                });
            }

            pass.status = 'Out';
            pass.actualOutTime = new Date();
            await pass.save();

            await GateLog.create({
                passId: pass._id,
                studentId: pass.studentId?._id || pass.studentId,
                guardId: req.user.id,
                action: 'Check OUT',
                gateNumber
            });

            return res.json({
                valid: true,
                message: 'Valid QR. Student marked as OUT successfully.',
                details: buildScanDetails(pass, 'OUT'),
                warnings
            });
        }

        if (pass.status !== 'Out') {
            return res.status(400).json({
                valid: false,
                message: `Incoming scan not allowed for pass status ${pass.status}`,
                details: buildScanDetails(pass, 'IN'),
                warnings
            });
        }

        if (endAt && now > endAt) {
            warnings.push(buildWarning('LATE_RETURN', 'Student is returning after scheduled return time.'));
        }

        pass.status = 'Completed';
        pass.actualInTime = new Date();
        await pass.save();

        await GateLog.create({
            passId: pass._id,
            studentId: pass.studentId?._id || pass.studentId,
            guardId: req.user.id,
            action: 'Check IN',
            gateNumber
        });

        return res.json({
            valid: true,
            message: 'Valid QR. Student marked as IN successfully.',
            details: buildScanDetails(pass, 'IN'),
            warnings
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ valid: false, message: 'Server error', error: err.message });
    }
};

// @desc    Get recent scan activity for security dashboard
// @access  Private - Security only
const getRecentScans = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'Security') {
            return res.status(403).json({ message: 'Security access required' });
        }

        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
        const logs = await GateLog.find({ guardId: req.user.id })
            .sort({ timestamp: -1 })
            .limit(limit)
            .populate('studentId', 'fullName rollNumber')
            .populate('passId', 'passType status');

        return res.json({
            message: 'Recent scans fetched successfully',
            count: logs.length,
            scans: logs.map((item) => ({
                id: item._id,
                action: item.action,
                gateNumber: item.gateNumber,
                timestamp: item.timestamp,
                student: {
                    fullName: item.studentId?.fullName || 'N/A',
                    rollNumber: item.studentId?.rollNumber || 'N/A'
                },
                pass: {
                    passType: item.passId?.passType || 'Pass',
                    status: item.passId?.status || 'N/A'
                }
            }))
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = {
    securityLogin,
    updateSecurityPassword,
    scanPassQr,
    getRecentScans
};
