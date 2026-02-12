const mongoose = require('mongoose');

const passSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },

    // Request Type
    passType: { type: String, enum: ['Day Pass', 'Home Pass'], required: true },

    // Timing Details
    fromDate: { type: Date, required: true }, // For Day Pass: Date of outing
    fromTime: { type: String, required: true }, // e.g., "17:00"
    toDate: { type: Date, required: true },   // For Day Pass: Same as fromDate
    toTime: { type: String, required: true }, // e.g., "21:00"

    // Details
    destination: { type: String, required: true },
    reason: { type: String, required: true },
    transportMode: { type: String, enum: ['Walk', 'Auto', 'Bus', 'Bike', 'Train', 'Car'] },

    // Approval Workflow Status
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Out', 'Completed', 'Expired'],
        default: 'Pending'
    },

    // Home Pass Specific: Guardian Approval via Email
    isGuardianApproved: { type: Boolean, default: false }, // Only relevant for Home Pass

    // Tracking Who Approved/ rejected
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Warden' },
    rejectionReason: { type: String },

    // Lifecycle timestamps
    actualOutTime: { type: Date }, // Filled by Security when scanning QR
    actualInTime: { type: Date },  // Filled by Security upon return

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pass', passSchema);