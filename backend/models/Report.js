const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', default: null },
}, { timestamps: true });

reportSchema.index({ reportedUser: 1, reportedBy: 1 });

module.exports = mongoose.model('Report', reportSchema);
