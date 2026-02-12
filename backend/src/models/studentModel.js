// models/studentmodel.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    rollNumber: { type: String, required: true, unique: true },
    studentPhone: { type: String, required: true },
    parentPhone: { type: String, required: true },
    studentEmail: { type: String },
    parentEmail: { type: String },
    hostelBlock: { type: String, required: true },
    roomNumber: { type: String, required: true },
    year: { type: String },
    branch: { type: String },
    password: { type: String, default: '123456' }, // Default password for now
    isDefaulter: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);