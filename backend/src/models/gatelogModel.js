const mongoose = require('mongoose');

const gateLogSchema = new mongoose.Schema({
  passId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pass', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  guardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guard', required: true },
  
  action: { type: String, enum: ['Check IN', 'Check OUT'], required: true },
  gateNumber: { type: String, required: true }, // e.g., "Gate 1"
  
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GateLog', gateLogSchema);