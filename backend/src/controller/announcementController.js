const Announcement = require('../models/announcementModel');

const mapRoleToAudience = (role) => {
    if (role === 'Student') return 'Students';
    if (role === 'Warden') return 'Wardens';
    if (role === 'Security') return 'Security';
    return null;
};

// @desc    Get announcements for logged-in user role
// @access  Private - Any authenticated role
const getRoleAnnouncements = async (req, res) => {
    try {
        const roleAudience = mapRoleToAudience(req.user?.role);

        const filter = {
            isActive: true,
            targetAudience: roleAudience
                ? { $in: ['All', roleAudience] }
                : { $in: ['All'] }
        };

        const announcements = await Announcement.find(filter)
            .sort({ createdAt: -1 })
            .limit(20)
            .select('title message targetAudience priority createdAt');

        return res.json({
            message: 'Announcements retrieved successfully',
            count: announcements.length,
            announcements
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = {
    getRoleAnnouncements
};
