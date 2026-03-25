const Pass = require('../models/passModel');
const Student = require('../models/studentModel');
const SystemSetting = require('../models/systemSettingModel');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { sendGuardianApprovalSms } = require('../utils/smsService');

const DAY_PASS_START_MINUTES = 5 * 60;   // 05:00
const DAY_PASS_END_MINUTES = 21 * 60;    // 21:00

const getApiBaseUrl = (req) => {
    return process.env.PUBLIC_API_BASE_URL || `${req.protocol}://${req.get('host')}`;
};

const parseTimeToMinutes = (time) => {
    if (!time || typeof time !== 'string') return NaN;
    const match = time.match(/^(\d{2}):(\d{2})$/);
    if (!match) return NaN;

    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return NaN;

    return (hours * 60) + minutes;
};

const buildDateTime = (dateInput, timeInput) => {
    const parsedDate = new Date(dateInput);
    if (Number.isNaN(parsedDate.getTime())) return null;

    const minutes = parseTimeToMinutes(timeInput);
    if (Number.isNaN(minutes)) return null;

    const result = new Date(parsedDate);
    result.setHours(0, 0, 0, 0);
    result.setMinutes(minutes);

    return result;
};

const normalizeDate = (dateInput) => {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return null;
    date.setHours(0, 0, 0, 0);
    return date;
};

const buildPassEndDateTime = (pass) => {
    const result = buildDateTime(pass?.toDate, pass?.toTime);
    return result || null;
};

const generatePassQrToken = (pass) => {
    const qrSecret = process.env.PASS_QR_SECRET || process.env.JWT_SECRET || 'your-secret-key';
    const endDateTime = buildPassEndDateTime(pass);

    // Token remains valid at least 1 hour so guards can still complete flow around edge times.
    const nowSeconds = Math.floor(Date.now() / 1000);
    const expirySeconds = endDateTime ? Math.floor(endDateTime.getTime() / 1000) + (60 * 60) : nowSeconds + (24 * 60 * 60);
    const safeExpirySeconds = Math.max(expirySeconds, nowSeconds + (60 * 60));

    return jwt.sign(
        {
            type: 'OUTPASS_QR',
            passId: String(pass._id),
            studentId: String(pass.studentId)
        },
        qrSecret,
        {
            expiresIn: safeExpirySeconds - nowSeconds
        }
    );
};

const hasBlockingPass = async (studentId) => {
    const blockingStatuses = ['Pending', 'Approved', 'Out'];
    const existing = await Pass.findOne({
        studentId,
        status: { $in: blockingStatuses }
    }).sort({ createdAt: -1 });

    return existing;
};

const isPassRequestEnabled = async () => {
    const setting = await SystemSetting.findOne({ key: 'global' });
    if (!setting) return true;
    return setting.passRequestsEnabled !== false;
};

const generateGuardianLinks = (req, token) => {
    const baseUrl = getApiBaseUrl(req);
    const encodedToken = encodeURIComponent(token);
    return {
        decision: `${baseUrl}/api/passes/guardian/decision?token=${encodedToken}`,
        approve: `${baseUrl}/api/passes/guardian/respond?token=${encodedToken}&action=approve`,
        reject: `${baseUrl}/api/passes/guardian/respond?token=${encodedToken}&action=reject`
    };
};

// @desc    Guardian decision page with Approve / Reject options
// @access  Public
const guardianDecisionPage = async (req, res) => {
    try {
        const token = req.query.token;
        if (!token) {
            return sendGuardianDecisionResponse(req, res, {
                message: 'Approval token is required',
                success: false
            }, 400);
        }

        const pass = await Pass.findOne({
            guardianApprovalToken: token,
            passType: 'Home Pass',
            status: 'Pending',
            guardianApprovalStatus: 'Pending'
        }).populate('studentId', 'fullName rollNumber');

        if (!pass) {
            return sendGuardianDecisionResponse(req, res, {
                message: 'This link is invalid or already used.',
                success: false
            }, 404);
        }

        const guardianLinks = generateGuardianLinks(req, token);
        return res.send(`
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Guardian Approval</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; background: #f6f7fb; color: #1f2937; }
        .wrap { max-width: 560px; margin: 42px auto; background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); }
        h1 { margin: 0 0 8px; font-size: 24px; }
        p { margin: 6px 0; line-height: 1.5; }
        .meta { margin-top: 12px; color: #4b5563; font-size: 14px; }
        .actions { display: flex; gap: 10px; margin-top: 18px; }
        .btn { text-decoration: none; padding: 10px 14px; border-radius: 8px; font-weight: 700; color: #fff; }
        .btn-approve { background: #0a7a3f; }
        .btn-reject { background: #b91c1c; }
    </style>
</head>
<body>
    <div class="wrap">
        <h1>Guardian Decision Required</h1>
        <p>Please review and choose one option for this outpass request.</p>
        <div class="meta">
            <p><strong>Student:</strong> ${pass.studentId?.fullName || 'Student'}</p>
            <p><strong>Roll No:</strong> ${pass.studentId?.rollNumber || '-'}</p>
            <p><strong>Destination:</strong> ${pass.destination}</p>
            <p><strong>Reason:</strong> ${pass.reason}</p>
        </div>
        <div class="actions">
            <a class="btn btn-approve" href="${guardianLinks.approve}">Approve</a>
            <a class="btn btn-reject" href="${guardianLinks.reject}">Reject</a>
        </div>
    </div>
</body>
</html>`);
    } catch (err) {
        console.error(err);
        return sendGuardianDecisionResponse(req, res, {
            message: 'Server error',
            success: false
        }, 500);
    }
};

const sendGuardianDecisionResponse = (req, res, { message, success }, statusCode = 200) => {
    if (req.method === 'GET') {
        const color = success ? '#0a7a3f' : '#9b1c1c';
        const title = success ? 'Decision saved' : 'Unable to process decision';
        return res.status(statusCode).send(`
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Guardian Approval</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; background: #f6f7fb; color: #1f2937; }
        .wrap { max-width: 560px; margin: 48px auto; background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); }
        h1 { margin: 0 0 10px; color: ${color}; font-size: 22px; }
        p { margin: 0; line-height: 1.5; }
    </style>
</head>
<body>
    <div class="wrap">
        <h1>${title}</h1>
        <p>${message}</p>
    </div>
</body>
</html>`);
    }

    return res.status(statusCode).json({ message });
};

const getStudentFromToken = async (req, res) => {
    if (!req.user || req.user.role !== 'Student') {
        res.status(403).json({ message: 'Student access required' });
        return null;
    }

    const student = await Student.findById(req.user.id);
    if (!student) {
        res.status(404).json({ message: 'Student not found' });
        return null;
    }

    if (student.isDefaulter) {
        res.status(403).json({ message: 'Defaulters are not allowed to apply for pass' });
        return null;
    }

    return student;
};

// @desc    Apply for Day Pass
// @access  Private - Student only
const applyDayPass = async (req, res) => {
    try {
        const passRequestEnabled = await isPassRequestEnabled();
        if (!passRequestEnabled) {
            return res.status(403).json({
                message: 'Pass requests are temporarily disabled by administration'
            });
        }

        const student = await getStudentFromToken(req, res);
        if (!student) return;

        const {
            dateOfOuting,
            fromDate,
            outTime,
            fromTime,
            inTime,
            toTime,
            destination,
            purpose,
            reason,
            modeOfTransport,
            transportMode
        } = req.body;

        const selectedDate = dateOfOuting || fromDate;
        const selectedOutTime = outTime || fromTime;
        const selectedInTime = inTime || toTime;
        const selectedReason = reason || purpose;
        const selectedTransportMode = transportMode || modeOfTransport;

        if (!selectedDate || !selectedOutTime || !selectedInTime || !destination || !selectedReason) {
            return res.status(400).json({
                message: 'dateOfOuting, outTime, inTime, destination and reason are required for Day Pass'
            });
        }

        const outingDate = normalizeDate(selectedDate);
        const outMinutes = parseTimeToMinutes(selectedOutTime);
        const inMinutes = parseTimeToMinutes(selectedInTime);

        if (!outingDate || Number.isNaN(outMinutes) || Number.isNaN(inMinutes)) {
            return res.status(400).json({ message: 'Invalid date or time format. Use YYYY-MM-DD and HH:MM' });
        }

        if (outMinutes < DAY_PASS_START_MINUTES) {
            return res.status(400).json({ message: 'Day Pass outTime cannot be before 05:00' });
        }

        if (inMinutes > DAY_PASS_END_MINUTES) {
            return res.status(400).json({ message: 'Day Pass inTime cannot be after 21:00' });
        }

        if (inMinutes <= outMinutes) {
            return res.status(400).json({ message: 'inTime must be greater than outTime for Day Pass' });
        }

        const now = new Date();
        const outDateTime = buildDateTime(outingDate, selectedOutTime);
        if (!outDateTime || outDateTime <= now) {
            return res.status(400).json({ message: 'Day Pass outTime must be later than current time' });
        }

        const blockingPass = await hasBlockingPass(student._id);
        if (blockingPass) {
            return res.status(400).json({
                message: 'You already have an active pass request',
                activePassId: blockingPass._id,
                activePassStatus: blockingPass.status
            });
        }

        const createdPass = await Pass.create({
            studentId: student._id,
            passType: 'Day Pass',
            fromDate: outingDate,
            fromTime: selectedOutTime,
            toDate: outingDate,
            toTime: selectedInTime,
            destination,
            reason: selectedReason,
            transportMode: selectedTransportMode,
            isGuardianApproved: true,
            guardianApprovalStatus: 'NotRequired',
            status: 'Pending'
        });

        return res.status(201).json({
            message: 'Day Pass request submitted successfully',
            pass: createdPass
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Apply for Home Pass
// @access  Private - Student only
const applyHomePass = async (req, res) => {
    try {
        const passRequestEnabled = await isPassRequestEnabled();
        if (!passRequestEnabled) {
            return res.status(403).json({
                message: 'Pass requests are temporarily disabled by administration'
            });
        }

        const student = await getStudentFromToken(req, res);
        if (!student) return;

        const {
            leavingDate,
            leavingOn,
            fromDate,
            leavingTime,
            outTime,
            fromTime,
            returningDate,
            returningOn,
            toDate,
            returningTime,
            inTime,
            toTime,
            destination,
            reason,
            purpose,
            modeOfTransport,
            transportMode
        } = req.body;

        const selectedFromDate = leavingDate || leavingOn || fromDate;
        const selectedFromTime = leavingTime || outTime || fromTime;
        const selectedToDate = returningDate || returningOn || toDate;
        const selectedToTime = returningTime || inTime || toTime;
        const selectedReason = reason || purpose;
        const selectedTransportMode = transportMode || modeOfTransport;

        if (!student.parentPhone) {
            return res.status(400).json({
                message: 'Guardian phone number is required for Home Pass approval'
            });
        }

        if (!selectedFromDate || !selectedFromTime || !selectedToDate || !selectedToTime || !destination || !selectedReason) {
            return res.status(400).json({
                message: 'leavingDate, leavingTime, returningDate, returningTime, destination and reason are required for Home Pass'
            });
        }

        const leaveDate = normalizeDate(selectedFromDate);
        const returnDate = normalizeDate(selectedToDate);

        if (!leaveDate || !returnDate) {
            return res.status(400).json({ message: 'Invalid leavingDate or returningDate format. Use YYYY-MM-DD' });
        }

        const leaveDateTime = buildDateTime(leaveDate, selectedFromTime);
        const returnDateTime = buildDateTime(returnDate, selectedToTime);

        if (!leaveDateTime || !returnDateTime) {
            return res.status(400).json({ message: 'Invalid time format. Use HH:MM' });
        }

        const now = new Date();
        if (leaveDateTime <= now) {
            return res.status(400).json({ message: 'Home Pass leaving time must be later than current time' });
        }

        if (returnDateTime <= leaveDateTime) {
            return res.status(400).json({ message: 'Home Pass return time must be after leaving time' });
        }

        const blockingPass = await hasBlockingPass(student._id);
        if (blockingPass) {
            return res.status(400).json({
                message: 'You already have an active pass request',
                activePassId: blockingPass._id,
                activePassStatus: blockingPass.status
            });
        }

        const guardianApprovalToken = crypto.randomBytes(24).toString('hex');
        const guardianLinks = generateGuardianLinks(req, guardianApprovalToken);

        const createdPass = await Pass.create({
            studentId: student._id,
            passType: 'Home Pass',
            fromDate: leaveDate,
            fromTime: selectedFromTime,
            toDate: returnDate,
            toTime: selectedToTime,
            destination,
            reason: selectedReason,
            transportMode: selectedTransportMode,
            isGuardianApproved: false,
            guardianApprovalStatus: 'Pending',
            guardianApprovalToken,
            status: 'Pending'
        });

        const smsDispatch = await sendGuardianApprovalSms({
            guardianPhone: student.parentPhone,
            studentName: student.fullName,
            decisionLink: guardianLinks.decision
        });

        if (smsDispatch.requiresManualShare) {
            await Pass.findByIdAndDelete(createdPass._id);
            return res.status(503).json({
                message: 'Direct guardian delivery is not configured. Enable an SMS provider to send approval link directly to parent mobile number.'
            });
        }

        if (!smsDispatch.sent) {
            await Pass.findByIdAndDelete(createdPass._id);
            return res.status(502).json({
                message: 'Failed to send guardian approval link directly to parent phone number.',
                reason: smsDispatch.reason || 'Provider delivery failed'
            });
        }

        const dispatchMessage = 'Home Pass request submitted successfully. Approval link was sent directly to guardian mobile number.';

        const safeDispatch = {
            sent: smsDispatch.sent,
            provider: smsDispatch.provider,
            to: smsDispatch.to
        };

        return res.status(201).json({
            message: dispatchMessage,
            pass: createdPass,
            guardianApproval: {
                phoneNumber: student.parentPhone,
                channel: smsDispatch.provider || 'unknown',
                smsDispatch: safeDispatch
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Guardian accepts/rejects Home Pass via link
// @access  Public
const guardianRespondToHomePass = async (req, res) => {
    try {
        const requestBody = req.body || {};
        const token = req.query.token || requestBody.token;
        const action = String(req.query.action || requestBody.action || '').toLowerCase();
        const reason = requestBody.reason;

        if (!token || !action) {
            return res.status(400).json({ message: 'token and action are required' });
        }

        if (!['accept', 'approve', 'reject'].includes(action)) {
            return sendGuardianDecisionResponse(req, res, {
                message: 'action must be approve or reject',
                success: false
            }, 400);
        }

        const pass = await Pass.findOne({
            guardianApprovalToken: token,
            passType: 'Home Pass',
            status: 'Pending',
            guardianApprovalStatus: 'Pending'
        });

        if (!pass) {
            return sendGuardianDecisionResponse(req, res, {
                message: 'Invalid or already used guardian approval link',
                success: false
            }, 404);
        }

        pass.guardianApprovalAt = new Date();
        pass.guardianApprovalToken = undefined;

        if (action === 'accept' || action === 'approve') {
            pass.isGuardianApproved = true;
            pass.guardianApprovalStatus = 'Approved';
            pass.guardianRejectionReason = undefined;

            await pass.save();
            return sendGuardianDecisionResponse(req, res, {
                message: 'Guardian approved successfully. Warden can now review this pass.',
                success: true
            });
        }

        pass.isGuardianApproved = false;
        pass.guardianApprovalStatus = 'Rejected';
        pass.guardianRejectionReason = reason || 'Rejected by guardian';
        pass.status = 'Rejected';
        pass.rejectionReason = pass.guardianRejectionReason;

        await pass.save();
        return sendGuardianDecisionResponse(req, res, {
            message: 'Guardian rejected this pass request',
            success: true
        });
    } catch (err) {
        console.error(err);
        return sendGuardianDecisionResponse(req, res, {
            message: 'Server error',
            success: false
        }, 500);
    }
};

// @desc    Get pass requests for warden page
// @access  Private - Warden only
const getPassRequestsForWarden = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'Warden') {
            return res.status(403).json({ message: 'Warden access required' });
        }

        const status = req.query.status || 'Pending';
        const passType = req.query.passType;

        let filter = { status };

        if (status === 'Pending') {
            // Warden should review Home Pass only after guardian has approved it.
            filter = {
                status: 'Pending',
                $or: [
                    { passType: 'Day Pass' },
                    { passType: 'Home Pass', isGuardianApproved: true }
                ]
            };
        }

        if (passType) {
            if (status === 'Pending' && passType === 'Home Pass') {
                filter = {
                    status: 'Pending',
                    passType: 'Home Pass',
                    isGuardianApproved: true
                };
            } else {
                filter.passType = passType;
            }
        }

        const requests = await Pass.find(filter)
            .populate('studentId', 'fullName rollNumber hostelBlock roomNumber parentPhone')
            .sort({ createdAt: -1 });

        return res.json({
            message: 'Pass requests retrieved successfully',
            count: requests.length,
            requests
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Approve pass request by warden
// @access  Private - Warden only
const approvePassByWarden = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'Warden') {
            return res.status(403).json({ message: 'Warden access required' });
        }

        const pass = await Pass.findById(req.params.id);
        if (!pass) {
            return res.status(404).json({ message: 'Pass request not found' });
        }

        if (pass.status !== 'Pending') {
            return res.status(400).json({ message: 'Only pending pass requests can be approved' });
        }

        if (pass.passType === 'Home Pass' && !pass.isGuardianApproved) {
            return res.status(400).json({
                message: 'Guardian approval is required before warden approval for Home Pass'
            });
        }

        pass.status = 'Approved';
        pass.approvedBy = req.user.id;
        pass.rejectedBy = undefined;
        pass.rejectionReason = undefined;
        pass.qrToken = generatePassQrToken(pass);
        pass.qrIssuedAt = new Date();
        pass.actualOutTime = undefined;
        pass.actualInTime = undefined;

        await pass.save();

        return res.json({
            message: 'Pass request approved successfully',
            pass
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Reject pass request by warden
// @access  Private - Warden only
const rejectPassByWarden = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'Warden') {
            return res.status(403).json({ message: 'Warden access required' });
        }

        const pass = await Pass.findById(req.params.id);
        if (!pass) {
            return res.status(404).json({ message: 'Pass request not found' });
        }

        if (pass.status !== 'Pending') {
            return res.status(400).json({ message: 'Only pending pass requests can be rejected' });
        }

        pass.status = 'Rejected';
        pass.rejectedBy = req.user.id;
        pass.approvedBy = undefined;
        pass.rejectionReason = req.body.reason || 'Rejected by warden';

        await pass.save();

        return res.json({
            message: 'Pass request rejected successfully',
            pass
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Get all pass requests for logged-in student
// @access  Private - Student only
const getMyPassRequests = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'Student') {
            return res.status(403).json({ message: 'Student access required' });
        }

        const passes = await Pass.find({ studentId: req.user.id }).sort({ createdAt: -1 });

        return res.json({
            message: 'Pass requests retrieved successfully',
            count: passes.length,
            passes
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Cancel own pass request
// @access  Private - Student only
const cancelMyPassRequest = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'Student') {
            return res.status(403).json({ message: 'Student access required' });
        }

        const pass = await Pass.findOne({ _id: req.params.id, studentId: req.user.id });
        if (!pass) {
            return res.status(404).json({ message: 'Pass request not found' });
        }

        if (pass.status !== 'Pending') {
            return res.status(400).json({ message: 'Only pending pass requests can be cancelled' });
        }

        pass.status = 'Rejected';
        pass.rejectionReason = 'Cancelled by student';
        await pass.save();

        return res.json({
            message: 'Pass request cancelled successfully',
            pass
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = {
    applyDayPass,
    applyHomePass,
    guardianDecisionPage,
    guardianRespondToHomePass,
    getPassRequestsForWarden,
    approvePassByWarden,
    rejectPassByWarden,
    getMyPassRequests,
    cancelMyPassRequest
};
