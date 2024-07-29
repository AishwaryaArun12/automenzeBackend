const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const errorHandler = require('./middleware/errorHandler');
const serviceSchema = require('./models/serviceSchema');
const { sendNotification } = require('./utils/firebaseMessaging');
const cron = require('node-cron');
const Notification = require('./models/notification');

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
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

cron.schedule('0 0 * * *', async () => {
  try {
    const currentDate = new Date();
    
    const services = await serviceSchema.find().populate('vehicle').populate('vehicle.client').populate('replacedSpares.spare').populate('renewalSpares.spare').populate('mandatorySpares.spare').populate('recommendedSpares.spare');

    for (const service of services) {
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

      const expiredSpares = [
        ...checkQuantitySpares(service.replacedSpares),
        ...checkQuantitySpares(service.renewalSpares),
        ...checkValiditySpares(service.mandatorySpares),
        ...checkValiditySpares(service.recommendedSpares)
      ];

      for (const item of expiredSpares) {
        const spareName = item.spare.name || 'Unknown Spare';
        const notification = new Notification({
          title: 'Spare Part Validity Expired',
          message: `${spareName} for ${service.vehicle.make} ${service.vehicle.model} has expired.`,
          clientId: service.vehicle.client._id,
          vehicleId: service.vehicle._id,
          serviceId: service._id
        });
        await notification.save();

        await sendNotification(service.vehicle.client.fcmToken, {
          title: notification.title,
          body: notification.message
        });
      }
    }

    console.log('Expired spare parts check completed');
  } catch (error) {
    console.error('Error in cron job:', error);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));