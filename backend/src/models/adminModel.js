const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Master Key
    role: { type: String, default: 'Super Admin' },
    lastLogin: { type: Date }
});

module.exports = mongoose.model('Admin', adminSchema);