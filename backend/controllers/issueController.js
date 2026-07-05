const Issue = require('../models/Issue');
const Vote = require('../models/Vote');
const { getEmbedding } = require('../utils/embedding');
const { generateDeleteToken, verifyDeleteToken } = require('../utils/helpers');

exports.create = async (req, res) => {
  try {
    const { title, description, department, imageIds } = req.body;

    if (!title || !description || !department) {
      return res.status(400).json({ error: 'Title, description, and department are required' });
    }

    let embedding;
    try {
      embedding = await getEmbedding(title);
    } catch (err) {
      console.error('Embedding generation failed:', err.message);
    }

    const issue = await Issue.create({
      title,
      description,
      department,
      poster: req.user._id,
      imageIds: imageIds || [],
      embedding: embedding || undefined,
    });

    const populated = await Issue.findById(issue._id).populate('poster', 'name email role');
    res.status(201).json({ issue: populated });
  } catch (err) {
    console.error('Create issue error:', err);
    res.status(500).json({ error: 'Failed to create issue' });
  }
};

exports.list = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, department } = req.query;
    const query = { status: { $ne: 'resolved' } };
    if (status) query.status = status;
    if (department) query.department = department;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: 'poster',
    };

    const issues = await Issue.find(query)
      .sort({ createdAt: -1 })
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .populate('poster', 'name email role');

    const total = await Issue.countDocuments(query);

    res.json({
      issues,
      total,
      page: options.page,
      totalPages: Math.ceil(total / options.limit),
      hasMore: options.page * options.limit < total,
    });
  } catch (err) {
    console.error('List issues error:', err);
    res.status(500).json({ error: 'Failed to list issues' });
  }
};

exports.getById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('poster', 'name email role')
      .populate('resolvedBy', 'name email role');

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const voteCount = await Vote.countDocuments({ issue: issue._id });
    let userVote = null;
    if (req.user) {
      const vote = await Vote.findOne({ issue: issue._id, user: req.user._id });
      if (vote) userVote = true;
    }

    res.json({ issue: { ...issue.toObject(), voteCount, userVote } });
  } catch (err) {
    console.error('Get issue error:', err);
    res.status(500).json({ error: 'Failed to load issue' });
  }
};

exports.update = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    if (issue.poster.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the original poster can edit this issue' });
    }

    if (issue.status !== 'open') {
      return res.status(400).json({ error: 'Cannot edit a resolved or pending issue' });
    }

    const { title, description, department, imageIds } = req.body;
    if (title) issue.title = title;
    if (description) issue.description = description;
    if (department) issue.department = department;
    if (imageIds) issue.imageIds = imageIds;

    if (title && title !== issue.title) {
      try {
        issue.embedding = await getEmbedding(title);
      } catch (err) {
        console.error('Embedding regeneration failed:', err.message);
      }
    }

    await issue.save();
    const populated = await Issue.findById(issue._id).populate('poster', 'name email role');
    res.json({ issue: populated });
  } catch (err) {
    console.error('Update issue error:', err);
    res.status(500).json({ error: 'Failed to update issue' });
  }
};

exports.generateDeleteToken = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    if (issue.poster.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the poster can delete this issue' });
    }

    if (issue.status !== 'open') {
      return res.status(400).json({ error: 'Cannot delete a resolved or pending issue' });
    }

    const token = generateDeleteToken(req.params.id);
    res.json({ deleteToken: token, message: 'Enter this token to confirm deletion' });
  } catch (err) {
    console.error('Generate delete token error:', err);
    res.status(500).json({ error: 'Failed to generate delete token' });
  }
};

exports.deleteIssue = async (req, res) => {
  try {
    const { confirmationToken } = req.body;

    if (!confirmationToken) {
      return res.status(400).json({ error: 'Confirmation token is required' });
    }

    if (!verifyDeleteToken(req.params.id, confirmationToken)) {
      return res.status(400).json({ error: 'Invalid or expired confirmation token' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    if (issue.poster.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the poster can delete this issue' });
    }

    await Issue.findByIdAndDelete(req.params.id);
    await Vote.deleteMany({ issue: req.params.id });

    res.json({ message: 'Issue deleted successfully' });
  } catch (err) {
    console.error('Delete issue error:', err);
    res.status(500).json({ error: 'Failed to delete issue' });
  }
};

exports.resolve = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    if (issue.status !== 'open') {
      return res.status(400).json({ error: 'Issue is not open for resolution' });
    }

    const { resolutionImageIds, resolutionMessage } = req.body;
    if (!resolutionImageIds || resolutionImageIds.length === 0) {
      return res.status(400).json({ error: 'A photo proof is required to mark as resolved' });
    }

    if (issue.poster.toString() === req.user._id.toString()) {
      issue.status = 'resolved';
      issue.resolvedBy = req.user._id;
      issue.resolutionImageIds = resolutionImageIds;
      issue.resolutionMessage = resolutionMessage || '';
      issue.confirmedByPoster = true;
      await issue.save();
      const populated = await Issue.findById(issue._id)
        .populate('poster', 'name email role')
        .populate('resolvedBy', 'name email role');
      return res.json({ issue: populated, message: 'Issue resolved successfully' });
    }

    issue.status = 'pending_review';
    issue.resolvedBy = req.user._id;
    issue.resolutionImageIds = resolutionImageIds;
    issue.resolutionMessage = resolutionMessage || '';
    issue.confirmedByPoster = false;
    await issue.save();

    const populated = await Issue.findById(issue._id)
      .populate('poster', 'name email role')
      .populate('resolvedBy', 'name email role');
    res.json({ issue: populated, message: 'Resolution proposed. Waiting for poster confirmation.' });
  } catch (err) {
    console.error('Resolve issue error:', err);
    res.status(500).json({ error: 'Failed to resolve issue' });
  }
};

exports.confirmResolution = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    if (issue.poster.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the original poster can confirm resolution' });
    }

    if (issue.status !== 'pending_review') {
      return res.status(400).json({ error: 'Issue is not pending review' });
    }

    issue.status = 'resolved';
    issue.confirmedByPoster = true;
    await issue.save();

    const populated = await Issue.findById(issue._id)
      .populate('poster', 'name email role')
      .populate('resolvedBy', 'name email role');
    res.json({ issue: populated, message: 'Resolution confirmed. Issue is now resolved.' });
  } catch (err) {
    console.error('Confirm resolution error:', err);
    res.status(500).json({ error: 'Failed to confirm resolution' });
  }
};

exports.rejectResolution = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    if (issue.poster.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the original poster can reject resolution' });
    }

    if (issue.status !== 'pending_review') {
      return res.status(400).json({ error: 'Issue is not pending review' });
    }

    issue.status = 'open';
    issue.resolvedBy = null;
    issue.resolutionImageIds = [];
    issue.resolutionMessage = '';
    issue.confirmedByPoster = false;
    await issue.save();

    const populated = await Issue.findById(issue._id)
      .populate('poster', 'name email role');
    res.json({ issue: populated, message: 'Resolution rejected. Issue is open again.' });
  } catch (err) {
    console.error('Reject resolution error:', err);
    res.status(500).json({ error: 'Failed to reject resolution' });
  }
};

exports.findSimilar = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    let embedding;
    try {
      embedding = await getEmbedding(title);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to generate embedding' });
    }

    const k = parseInt(process.env.SIMILAR_ISSUES_K) || 5;
    const numCandidates = parseInt(process.env.KNN_NUM_CANDIDATES) || 100;

    try {
      const results = await Issue.aggregate([
        {
          $vectorSearch: {
            queryVector: embedding,
            path: 'embedding',
            numCandidates,
            limit: k,
            index: 'issue_vector_index',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'poster',
            foreignField: '_id',
            as: 'poster',
          },
        },
        { $unwind: { path: '$poster', preserveNullAndEmptyArrays: true } },
        { $project: { embedding: 0 } },
      ]);

      res.json({ issues: results });
    } catch (err) {
      console.error('Vector search failed:', err.message);
      res.json({ issues: [], note: 'Vector search unavailable. Try again after creating the Atlas Search index.' });
    }
  } catch (err) {
    console.error('Find similar error:', err);
    res.status(500).json({ error: 'Failed to find similar issues' });
  }
};

exports.feed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(process.env.FEED_PAGE_SIZE) || 20;
    const userId = req.user._id;

    const votedIssueIds = (await Vote.find({ user: userId }).select('issue')).map(v => v.issue);
    const userIssueIds = (await Issue.find({ poster: userId }).select('_id')).map(i => i._id);

    const excludeIds = [...new Set([...votedIssueIds.map(id => id.toString()), ...userIssueIds.map(id => id.toString())])];

    let totalCount = await Issue.countDocuments({
      status: { $ne: 'resolved' },
      _id: { $nin: excludeIds },
    });

    let recommendedIds = [];

    if (userIssueIds.length > 0 || votedIssueIds.length > 0) {
      const userIssues = await Issue.find({ _id: { $in: [...userIssueIds, ...votedIssueIds] } }).select('title');
      const titles = userIssues.map(i => i.title).filter(Boolean);

      if (titles.length > 0) {
        const title = titles.join(' ');
        try {
          const embedding = await getEmbedding(title);
          const k = parseInt(process.env.KNN_K) || 3;
          const numCandidates = parseInt(process.env.KNN_NUM_CANDIDATES) || 100;

          const vectorResults = await Issue.aggregate([
            {
              $vectorSearch: {
                queryVector: embedding,
                path: 'embedding',
                numCandidates,
                limit: k,
                index: 'issue_vector_index',
              },
            },
            { $match: { _id: { $nin: excludeIds } } },
            { $project: { _id: 1 } },
          ]);

          recommendedIds = vectorResults.map(r => r._id);
        } catch (err) {
          console.error('Vector search for feed failed:', err.message);
        }
      }
    }

    let issues = [];
    if (recommendedIds.length > 0) {
      issues = await Issue.find({ _id: { $in: recommendedIds } })
        .populate('poster', 'name email role')
        .sort({ createdAt: -1 });
    }

    if (issues.length < limit) {
      const mongoose = require('mongoose');
      const fillCount = limit - issues.length;
      const existingIds = [...excludeIds, ...issues.map(i => i._id.toString())];
      const randomIssues = await Issue.aggregate([
        { $match: { _id: { $nin: existingIds.map(id => mongoose.Types.ObjectId.createFromHexString(id)) }, status: { $ne: 'resolved' } } },
        { $sample: { size: fillCount } },
        {
          $lookup: {
            from: 'users',
            localField: 'poster',
            foreignField: '_id',
            as: 'poster',
          },
        },
        { $unwind: { path: '$poster', preserveNullAndEmptyArrays: true } },
        { $project: { embedding: 0 } },
      ]);
      issues = [...issues, ...randomIssues];
    }

    const skip = (page - 1) * limit;
    const paginatedIssues = issues.slice(skip, skip + limit);
    const hasMore = skip + limit < issues.length || (issues.length >= limit && totalCount > skip + limit);

    res.json({ issues: paginatedIssues, page, hasMore, total: issues.length });
  } catch (err) {
    console.error('Feed error:', err);
    res.status(500).json({ error: 'Failed to load feed' });
  }
};
