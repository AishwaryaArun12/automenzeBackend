const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const errorHandler = require('./middleware/errorHandler');
const Service = require('./models/serviceSchema');
const { sendNotification,fcmTokens } = require('./utils/firebaseMessaging');
const cron = require('node-cron');
const Notification = require('./models/notification');
const admin = require('firebase-admin');

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Middleware
app.use(express.json());

// Routes
app.use('/', require('./routes'));

// Error handling middleware
app.use(errorHandler);

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(()=>{
    console.log('Mongodb connected..')
}).catch(err=>{
    console.log('Error occured while connecting database',err)
});


const firebaseConfig = process.env.FIREBASE_ADMIN_SDK;

try {
  const serviceAccount = JSON.parse(firebaseConfig);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('Error parsing FIREBASE_ADMIN_SDK:', error);
  console.log('FIREBASE_ADMIN_SDK value:', firebaseConfig);
  process.exit(1);
}




//cron.schedule('0 0 * * *', async () => {

cron.schedule('* * * * *', async () => {
  try {
    console.log('Running a task every minute');
    const currentDate = new Date();
    
    // Get the latest service for each vehicle
    const latestServices = await Service.aggregate([
      { $sort: { serviceDate: -1 } },
      { $group: {
        _id: "$vehicle",
        latestService: { $first: "$$ROOT" }
      }},
      { $replaceRoot: { newRoot: "$latestService" } }
    ]).exec();
    // Populate necessary fields
    await Service.populate(latestServices, [
      { path: 'vehicle', populate: { path: 'client' } },
      { path: 'replacedSpares.spare' },
      { path: 'renewalSpares.spare' },
      { path: 'mandatorySpares.spare' },
      { path: 'recommendedSpares.spare' }
    ]);

    for (const service of latestServices) {
      const checkQuantitySpares = (spares) => {
        return spares.filter(item => {
          const expiryDate = new Date(service.serviceDate);
          expiryDate.setMonth(expiryDate.getMonth() + item.spare.validity);
          return expiryDate <= currentDate;
        });
      };

      const checkValiditySpares = (spares) => {
        return spares.filter(item => {
          const expiryDate = new Date(service.serviceDate);
          expiryDate.setMonth(expiryDate.getMonth() + item.validity);
          return expiryDate <= currentDate;
        });
      };
      console.log(latestServices,'ssss');

      const expiredSpares = [
        ...checkQuantitySpares(service.replacedSpares),
        ...checkQuantitySpares(service.renewalSpares),
        ...checkValiditySpares(service.mandatorySpares),
        ...checkValiditySpares(service.recommendedSpares)
      ];
      console.log(expiredSpares,'hjkhhb')
    
      for (const item of expiredSpares) {
        const spareName = item.spare.name || 'Unknown Spare';
        const notification = new Notification({
          title: 'Spare Part Validity Expired',
          message: `${spareName} for ${service.vehicle.maker} ${service.vehicle.model} has expired. Client: ${service.vehicle.client.name}, Phone: ${service.vehicle.client.contactNumber}`,
          clientId: service.vehicle.client._id,
          vehicleId: service.vehicle._id,
          serviceId: service._id
        });
        await notification.save();

        for (const token of fcmTokens) {
          await sendNotification(token, {
            title: notification.title,
            body: notification.message
          });
        }
      }
    }

    console.log('Expired spare parts check completed for latest services');
  } catch (error) {
    console.error('Error in cron job:', error);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { app, fcmTokens };

