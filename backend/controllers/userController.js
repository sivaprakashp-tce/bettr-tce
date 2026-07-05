const User = require('../models/User');
const Issue = require('../models/Issue');
const Vote = require('../models/Vote');
const Comment = require('../models/Comment');

exports.getProfile = async (req, res) => {
  res.json({ user: req.user.toJSON() });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    req.user.name = name.trim();
    await req.user.save();
    res.json({ user: req.user.toJSON() });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [totalIssues, myIssues, myResolvedIssues, myPendingReview, totalResolved, myUpvotes, openIssues] =
      await Promise.all([
        Issue.countDocuments(),
        Issue.countDocuments({ poster: userId }),
        Issue.countDocuments({ poster: userId, status: 'resolved' }),
        Issue.countDocuments({ poster: userId, status: 'pending_review' }),
        Issue.countDocuments({ status: 'resolved' }),
        Vote.countDocuments({ user: userId }),
        Issue.countDocuments({ status: 'open' }),
      ]);

    res.json({
      stats: {
        totalIssues,
        myIssues,
        myResolvedIssues,
        myPendingReview,
        totalResolved,
        myUpvotes,
        openIssues,
      },
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ error: 'Failed to load stats' });
  }
};

exports.myIssues = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(process.env.FEED_PAGE_SIZE) || 20;

    const issues = await Issue.find({ poster: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('resolvedBy', 'name email role');

    const total = await Issue.countDocuments({ poster: userId });

    res.json({
      issues,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    });
  } catch (err) {
    console.error('My issues error:', err);
    res.status(500).json({ error: 'Failed to load issues' });
  }
};

exports.myActivity = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(process.env.FEED_PAGE_SIZE) || 20;

    const [votes, commentDocs] = await Promise.all([
      Vote.find({ user: userId })
        .sort({ createdAt: -1 })
        .populate({
          path: 'issue',
          populate: { path: 'poster', select: 'name email role' },
        }),
      Comment.find({ user: userId })
        .sort({ createdAt: -1 })
        .populate({
          path: 'issue',
          populate: { path: 'poster', select: 'name email role' },
        }),
    ]);

    const upvotedIssues = votes.map(v => v.issue).filter(Boolean);
    const commentedIds = new Set();
    const commentedIssues = [];
    for (const c of commentDocs) {
      if (c.issue && !commentedIds.has(c.issue._id.toString())) {
        commentedIds.add(c.issue._id.toString());
        commentedIssues.push(c.issue);
      }
    }

    const upvotedTotal = await Vote.countDocuments({ user: userId });
    const commentedTotal = commentedIds.size;

    const upvotedPage = upvotedIssues.slice((page - 1) * limit, page * limit);
    const commentedPage = commentedIssues.slice((page - 1) * limit, page * limit);

    res.json({
      upvoted: upvotedPage,
      commented: commentedPage,
      upvotedTotal,
      commentedTotal,
      page,
      limit,
      hasMoreUpvoted: page * limit < upvotedTotal,
      hasMoreCommented: page * limit < commentedTotal,
    });
  } catch (err) {
    console.error('My activity error:', err);
    res.status(500).json({ error: 'Failed to load activity' });
  }
};
