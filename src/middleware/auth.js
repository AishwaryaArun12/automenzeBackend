const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    console.log('Received token:', token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded,'hhhhhhhh')
    if (decoded.role !== 'admin') {
      throw new Error();
    }
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};