const mongoose = require('mongoose');

const wardenSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    wardenId: { type: String, required: true, unique: true }, // e.g., WRD-NEW
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },

    // Assignment
    assignedHostel: { type: String, enum: ['BH1', 'BH2', 'GH1', 'GH2'], required: true },

    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Warden', wardenSchema);