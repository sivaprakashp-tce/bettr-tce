const Vote = require('../models/Vote');
const Issue = require('../models/Issue');

exports.toggleUpvote = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const existing = await Vote.findOne({ issue: req.params.id, user: req.user._id });

    if (existing) {
      await Vote.findByIdAndDelete(existing._id);
      const count = await Vote.countDocuments({ issue: req.params.id });
      return res.json({ upvoted: false, voteCount: count });
    }

    if (issue.poster.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'You cannot upvote your own issue' });
    }

    await Vote.create({ issue: req.params.id, user: req.user._id });
    const count = await Vote.countDocuments({ issue: req.params.id });
    res.json({ upvoted: true, voteCount: count });
  } catch (err) {
    console.error('Toggle upvote error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Already upvoted' });
    }
    res.status(500).json({ error: 'Failed to toggle upvote' });
  }
};

exports.status = async (req, res) => {
  try {
    const vote = await Vote.findOne({ issue: req.params.id, user: req.user._id });
    const count = await Vote.countDocuments({ issue: req.params.id });
    res.json({ upvoted: !!vote, voteCount: count });
  } catch (err) {
    console.error('Vote status error:', err);
    res.status(500).json({ error: 'Failed to get vote status' });
  }
};
