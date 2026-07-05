const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  department: { type: String, required: true },
  poster: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageIds: [{ type: mongoose.Schema.Types.ObjectId }],
  status: {
    type: String,
    enum: ['open', 'pending_review', 'resolved'],
    default: 'open',
  },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  resolutionImageIds: [{ type: mongoose.Schema.Types.ObjectId }],
  resolutionMessage: { type: String, default: '' },
  confirmedByPoster: { type: Boolean, default: false },
  embedding: { type: [Number], default: undefined },
}, { timestamps: true });

issueSchema.index({ poster: 1, status: 1 });
issueSchema.index({ status: 1, createdAt: -1 });
issueSchema.index({ department: 1, status: 1 });

module.exports = mongoose.model('Issue', issueSchema);
