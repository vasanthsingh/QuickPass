const mongoose = require('mongoose');

const securityOverrideSchema = new mongoose.Schema({
    guardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guard', required: true },
    relatedPassId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pass' },

    gateNumber: { type: String, required: true },
    direction: { type: String, enum: ['OUT', 'IN'], required: true },

    reason: { type: String, required: true },
    scanMessage: { type: String },
    qrTokenSnippet: { type: String },

    status: { type: String, enum: ['Pending', 'Resolved', 'Rejected'], default: 'Pending' },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Warden' },
    resolvedAt: { type: Date },
    resolutionNote: { type: String },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SecurityOverrideRequest', securityOverrideSchema);
