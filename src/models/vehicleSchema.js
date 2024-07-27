const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  maker: { type: String, required: true },
  model: { type: String, required: true },
  type: { type: String, required: true },
  dateOfManufacture: { type: Date, required: true },
  color: { type: String, required: true },
  driverName: { type: String, required: true },
  driverPhone: { type: String, required: true },
  image: { type: String },
  registrationNumber : {type : String, required : true},
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
