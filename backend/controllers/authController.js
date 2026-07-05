const User = require('../models/User');
const { generateToken, validateEmail, getRoleFromEmail } = require('../utils/helpers');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        error: 'Only @student.tce.edu and @tce.edu email addresses are allowed.',
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const role = getRoleFromEmail(email);
    const user = await User.create({ name, email: email.toLowerCase(), password, role });

    const token = generateToken(user._id);
    res.status(201).json({ token, user: user.toJSON() });
  } catch (err) {
    console.error('Register error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.bannedUntil && user.bannedUntil > new Date()) {
      const daysLeft = Math.ceil((user.bannedUntil - new Date()) / (1000 * 60 * 60 * 24));
      return res.status(403).json({
        error: `You are banned from the portal. Ban expires in ${daysLeft} day(s).`,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    res.json({ token, user: user.toJSON() });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.getMe = async (req, res) => {
  res.json({ user: req.user.toJSON() });
};
