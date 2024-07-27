const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contactNumber: { type: String, required: true },
  company: { type: String },
  city: { type: String, required: true },
  location: { type: String, required: true },
  image: { type: String },
  vehicles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' }]
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);