const jwt = require('jsonwebtoken');

exports.getToken = (user) => {
  return jwt.sign(
    { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' });
};

exports.decodeToken = (token) => jwt.verify(token, process.env.JWT_SECRET)

exports.verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
      console.error({ message: 'Token not provided' });
      return res.redirect('/login');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
          return res.status(401).json({ message: 'Invalid token' });
      }
      req.user = decoded;
      next();
  });
}