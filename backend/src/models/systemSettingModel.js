const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    passRequestsEnabled: { type: Boolean, default: true },
    passPolicy: {
        maxDayPassesPerWeek: { type: Number, default: 3 },
        maxHomePassesPerMonth: { type: Number, default: 2 },
        curfewTime: { type: String, default: '21:00' },
        requireGuardianApprovalForHomePass: { type: Boolean, default: true }
    },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SystemSetting', systemSettingSchema);