const mongoose = require('mongoose');

const guardSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  guardId: { type: String, required: true, unique: true }, // e.g., SEC-001
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String },
  
  // Work Details
  assignedGate: { type: String, enum: ['Gate 1 (Main)', 'Gate 2 (Back)', 'Hostel Block A'], required: true },
  shiftTime: { type: String, enum: ['Day (8AM - 8PM)', 'Night (8PM - 8AM)'] },
  
  status: { type: String, enum: ['Active', 'On Leave'], default: 'Active' },
  dateJoined: { type: Date, required: true }
});

module.exports = mongoose.model('Guard', guardSchema);