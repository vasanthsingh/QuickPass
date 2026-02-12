const mongoose = require('mongoose');

const profileRequestSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    // We use an Array so students can change multiple things (e.g., Phone + Email) at once
    changes: [
        {
            field: { type: String, required: true },   // e.g., "parentPhone"
            label: { type: String, required: true },   // e.g., "Parent Phone Number"
            oldValue: { type: String },                // e.g., "98765..."
            newValue: { type: String, required: true } // e.g., "99887..."
        }
    ],
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    requestDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProfileRequest', profileRequestSchema);