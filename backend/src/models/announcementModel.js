const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    targetAudience: {
        type: String,
        enum: ['All', 'Students', 'Wardens', 'Security'],
        default: 'All'
    },
    priority: {
        type: String,
        enum: ['Normal', 'High', 'Urgent'],
        default: 'Normal'
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Announcement', announcementSchema);
