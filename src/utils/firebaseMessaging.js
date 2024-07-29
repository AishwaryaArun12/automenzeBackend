const admin = require('firebase-admin');

const sendNotification = async (token, message) => {
  try {
    const response = await admin.messaging().send({
      token: token,
      notification: {
        title: message.title,
        body: message.body
      },
      data: message.data
    });
    console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

module.exports = { sendNotification };
