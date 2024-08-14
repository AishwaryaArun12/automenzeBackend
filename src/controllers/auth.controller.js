const jwt = require('jsonwebtoken');
const {fcmTokens} = require('../app')
require('dotenv').config();

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token });
};

exports.updateToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    fcmTokens.add(fcmToken);
  res.send('FCM token updated successfully');
  } catch (error) {
    next(error);
  }
  
};