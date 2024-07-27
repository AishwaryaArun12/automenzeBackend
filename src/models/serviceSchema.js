const mongoose = require('mongoose');

const spareWithQuantitySchema = new mongoose.Schema({
  spare: { type: mongoose.Schema.Types.ObjectId, ref: 'SparePart', required: true },
  quantity: { type: Number, required: true, min: 1 }
}, { _id: false });

const serviceSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  serviceType: { type: String, required: true },
  serviceDate: { type: Date, required: true },
  replacedSpares: [spareWithQuantitySchema],
  renewalSpares: [spareWithQuantitySchema],
  mandatorySpares: [spareWithQuantitySchema],
  recommendedSpares: [spareWithQuantitySchema],
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
