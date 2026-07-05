const Comment = require('../models/Comment');
const Issue = require('../models/Issue');

exports.list = async (req, res) => {
  try {
    const comments = await Comment.find({ issue: req.params.id })
      .sort({ createdAt: 1 })
      .populate('user', 'name email role');
    res.json({ comments });
  } catch (err) {
    console.error('List comments error:', err);
    res.status(500).json({ error: 'Failed to load comments' });
  }
};

exports.create = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const comment = await Comment.create({
      issue: req.params.id,
      user: req.user._id,
      message: message.trim(),
    });

    const populated = await Comment.findById(comment._id).populate('user', 'name email role');
    res.status(201).json({ comment: populated });
  } catch (err) {
    console.error('Create comment error:', err);
    res.status(500).json({ error: 'Failed to post comment' });
  }
};
