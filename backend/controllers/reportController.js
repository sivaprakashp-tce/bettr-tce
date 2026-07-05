const Report = require('../models/Report');
const User = require('../models/User');

exports.create = async (req, res) => {
  try {
    const { reportedUserId, issueId } = req.body;

    if (!reportedUserId) {
      return res.status(400).json({ error: 'reportedUserId is required' });
    }

    if (reportedUserId === req.user._id.toString()) {
      return res.status(400).json({ error: 'You cannot report yourself' });
    }

    const reportedUser = await User.findById(reportedUserId);
    if (!reportedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existing = await Report.findOne({
      reportedUser: reportedUserId,
      reportedBy: req.user._id,
    });

    if (existing) {
      return res.status(409).json({ error: 'You have already reported this user' });
    }

    await Report.create({
      reportedUser: reportedUserId,
      reportedBy: req.user._id,
      issue: issueId || null,
    });

    const reportCount = await Report.countDocuments({ reportedUser: reportedUserId });
    await User.findByIdAndUpdate(reportedUserId, { reportCount });

    const threshold = parseInt(process.env.BAN_THRESHOLD) || 30;
    if (reportCount >= threshold) {
      const banDays = parseInt(process.env.BAN_DURATION_DAYS) || 30;
      const bannedUntil = new Date();
      bannedUntil.setDate(bannedUntil.getDate() + banDays);
      await User.findByIdAndUpdate(reportedUserId, { bannedUntil });
      return res.json({
        message: `User reported. This user has been banned for ${banDays} days due to excessive reports.`,
      });
    }

    res.json({
      message: `User reported. (${reportCount}/${threshold} reports)`,
    });
  } catch (err) {
    console.error('Report error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ error: 'You have already reported this user' });
    }
    res.status(500).json({ error: 'Failed to report user' });
  }
};
