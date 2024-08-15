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
      
      const vehicles = await Vehicle.find().populate('client');
  
      for (const vehicle of vehicles) {
        const services = await Service.find({ vehicle: vehicle._id })
          .sort({ serviceDate: -1 })
          .populate('replacedSpares.spare renewalSpares.spare mandatorySpares.spare recommendedSpares.spare');
  
        const sparePartsMap = new Map();
  
        for (const service of services) {
          const allSpares = [
            ...service.replacedSpares,
            ...service.renewalSpares,
            ...service.mandatorySpares,
            ...service.recommendedSpares
          ];
  
          for (const spare of allSpares) {
            if (!sparePartsMap.has(spare.spare._id.toString())) {
              sparePartsMap.set(spare.spare._id.toString(), { spare, service });
            }
          }
        }
  
        const expiredSpares = [];
        sparePartsMap.forEach(({ spare, service }, spareId) => {
          const isExpired = checkSpareExpiry(spare, service.serviceDate, currentDate);
          if (isExpired) {
            expiredSpares.push({ spare, service });
          }
        });
  
        for (const { spare, service } of expiredSpares) {
          const spareName = spare.spare.name || 'Unknown Spare';
          const notification = new Notification({
            title: 'Spare Part Validity Expired',
            message: `${spareName} for ${vehicle.maker} ${vehicle.model} has expired. Last used on ${service.serviceDate}. Client: ${vehicle.client.name}, Phone: ${vehicle.client.contactNumber}`,
            clientId: vehicle.client._id,
            vehicleId: vehicle._id,
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
  
      console.log('Expired spare parts check completed for all services');
    } catch (error) {
      console.error('Error in cron job:', error);
    }
  });
  
  function checkSpareExpiry(spare, serviceDate, currentDate) {
    const expiryDate = new Date(serviceDate);
    if (spare.quantity) {
      expiryDate.setMonth(expiryDate.getMonth() + spare.spare.validity);
    } else if (spare.validity) {
      expiryDate.setMonth(expiryDate.getMonth() + spare.validity);
    }
    return expiryDate <= currentDate;
  }

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { app, fcmTokens };

