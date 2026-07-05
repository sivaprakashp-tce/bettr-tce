const { validateEmail } = require('../utils/helpers');

function validateEmailMiddleware(req, res, next) {
  const { email } = req.body;
  if (!email || !validateEmail(email)) {
    return res.status(400).json({
      error: 'Only @student.tce.edu and @tce.edu email addresses are allowed.',
    });
  }
  next();
}

module.exports = validateEmailMiddleware;
