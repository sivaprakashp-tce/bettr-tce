const jwt = require('jsonwebtoken');

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function validateEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@(student\.tce\.edu|tce\.edu)$/i.test(email);
}

function getRoleFromEmail(email) {
  if (/@student\.tce\.edu$/i.test(email)) return 'student';
  if (/@tce\.edu$/i.test(email)) return 'faculty';
  return null;
}

const deleteTokens = new Map();

function generateDeleteToken(issueId) {
  const token = Math.random().toString(36).substring(2, 10).toUpperCase();
  deleteTokens.set(issueId, { token, expiresAt: Date.now() + 300000 });
  return token;
}

function verifyDeleteToken(issueId, token) {
  const stored = deleteTokens.get(issueId);
  if (!stored) return false;
  if (Date.now() > stored.expiresAt) {
    deleteTokens.delete(issueId);
    return false;
  }
  if (stored.token !== token) return false;
  deleteTokens.delete(issueId);
  return true;
}

module.exports = { generateToken, validateEmail, getRoleFromEmail, generateDeleteToken, verifyDeleteToken };
