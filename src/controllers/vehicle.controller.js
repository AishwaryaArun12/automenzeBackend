const Vehicle = require('../models/vehicleSchema');
const Client = require('../models/clientSchema');
const Serivce = require('../models/serviceSchema');
const Spares = require('../models/sparePartsSchema');

exports.createVehicle = async (req, res, next) => {
  try {
    const { maker, model, type, dateOfManufacture, color, driverName, driverPhone,image, clientId, registrationNumber } = req.body;
    const vehicle = new Vehicle({
      maker,
      model,
      type,
      dateOfManufacture,
      color,
      driverName,
      driverPhone,
      image,
      registrationNumber,
      client: clientId
    });
    await vehicle.save();
    
    // Add vehicle reference to the client
    await Client.findByIdAndUpdate(clientId, { $push: { vehicles: vehicle._id } });
    
    res.status(201).json(vehicle);
  } catch (error) {
    next(error);
  }
};
exports.updateVehicle = async (req, res, next) => {
  try {
    const { maker, model,registrationNumber, type, dateOfManufacture, color, driverName, driverPhone, image} = req.body;
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { $set : {maker, model, registrationNumber, type, dateOfManufacture, color, driverName, driverPhone,image}},
      { new: true, runValidators: true }
    ).populate({path : 'client', select: 'name contactNumber'});
    if (!vehicle) return res.status(404).json({ message: 'vehicle not found' });
    res.json(vehicle);
  } catch (error) {
    next(error);
  }
};
exports.getAllVehicles = async (req, res, next) => {
  try {
    const { search, page = 1 } = req.query;
    const limit = 7;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { maker: { $regex: search, $options: 'i' } },
          { model: { $regex: search, $options: 'i' } },
          { type: { $regex: search, $options: 'i' } },
          { color : {$regex: search, $options: 'i' }},
          { driverName : {$regex: search, $options: 'i' }},
          { driverPhone : {$regex: search, $options: 'i' }},
        ]
      };
    }

    const vehicles = await Vehicle.find(query).populate({ path : 'client', select : 'name contactNumber'})
      .skip(skip)
      .limit(limit);

    const totalVehicles = await Vehicle.countDocuments(query);
    const totalPages = Math.ceil(totalVehicles / limit);

    res.json({
      vehicles,
      totalPages,
      totalVehicles
    });
  } catch (error) {
    next(error);
  }
};
exports.deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    next(error);
  }
};
exports.getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate({ path: 'client', select: 'name contactNumber' });

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const services = await Serivce.find({ vehicle: req.params.id })
      .select('serviceType serviceDate replacedSpares renewalSpares mandatorySpares recommendedSpares')
      .populate('replacedSpares.spare renewalSpares.spare mandatorySpares.spare recommendedSpares.spare', 'name');

    const vehicleWithServices = vehicle.toObject();
    vehicleWithServices.services = services;

    res.json(vehicleWithServices);
  } catch (error) {
    next(error);
  }
};
exports.getDashboardData = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.countDocuments();
    const services = await Serivce.countDocuments();
    const clients = await Client.countDocuments();
    const spares = await Spares.countDocuments();
    const currentDate = new Date();

    const allVehicles = await Vehicle.find().populate('client');
    let expiredSpares = [];

    for (const vehicle of allVehicles) {
      const services = await Serivce.find({ vehicle: vehicle._id })
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

      const vehicleExpiredSpares = [];
      sparePartsMap.forEach(({ spare, service }, spareId) => {
        const isExpired = checkSpareExpiry(spare, service.serviceDate, currentDate);
        if (isExpired) {
          vehicleExpiredSpares.push({
            name: spare.spare.name,
            image: spare.spare.image
          });
        }
      });

      if (vehicleExpiredSpares.length > 0) {
        expiredSpares.push({
          vehicleId: vehicle._id,
          vehicleMaker: vehicle.maker,
          vehicleModel: vehicle.model,
          vehicleImage: vehicle.image,
          clientName: vehicle.client.name,
          reg: vehicle.registrationNumber,
          clientContactNumber: vehicle.client.contactNumber,
          clientImage: vehicle.client.image,
          spares: vehicleExpiredSpares
        });
      }
    }

    res.json({ vehicles, services, clients, spares, expiredSpares });
  } catch (error) {
    next(error);
  }
};


function checkSpareExpiry(spare, serviceDate, currentDate) {
  const expiryDate = new Date(serviceDate);
  if (spare.quantity) {
    expiryDate.setMonth(expiryDate.getMonth() + spare.spare.validity);
  } else if (spare.validity) {
    expiryDate.setMonth(expiryDate.getMonth() + spare.validity);
  }
  return expiryDate <= currentDate;
}


