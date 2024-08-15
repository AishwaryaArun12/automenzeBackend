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
    let expiredSparesByVehicle = {};
    const vehicles = await Vehicle.countDocuments()
     

    const services = await Serivce.countDocuments()
    const clients = await Client.countDocuments();
    const spares = await Spares.countDocuments();
    const currentDate = new Date();
    
    // Get the latest service for each vehicle
    const latestServices = await Serivce.aggregate([
      { $sort: { serviceDate: -1 } },
      { $group: {
        _id: "$vehicle",
        latestService: { $first: "$$ROOT" }
      }},
      { $replaceRoot: { newRoot: "$latestService" } }
    ]).exec();
    // Populate necessary fields
    await Serivce.populate(latestServices, [
      { path: 'vehicle', populate: { path: 'client' } },
      { path: 'replacedSpares.spare' },
      { path: 'renewalSpares.spare' },
      { path: 'mandatorySpares.spare' },
      { path: 'recommendedSpares.spare' }
    ]);

    let expiredSpares = []

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

      const spares = [
        ...checkQuantitySpares(service.replacedSpares),
        ...checkQuantitySpares(service.renewalSpares),
        ...checkValiditySpares(service.mandatorySpares),
        ...checkValiditySpares(service.recommendedSpares)
      ].map(spare => ({
        ...spare,
        vehicleMaker: service.vehicle.maker,
        vehicleModel: service.vehicle.model,
        vehicleImage: service.vehicle.image,
        clientName: service.vehicle.client.name,
        reg: service.vehicle.registrationNumber,
        date : service.serviceDate,
        clientContactNumber: service.vehicle.client.contactNumber,
        clientImage : service.vehicle.client.iamge
      }));
      if (spares.length > 0) {
        if (!expiredSparesByVehicle[service.vehicle._id]) {
          expiredSparesByVehicle[service.vehicle._id] = [];
        }
        expiredSparesByVehicle[service.vehicle._id].push(...spares);
      }
      
  }

    res.json({vehicles, services, clients, spares, expiredSpares : expiredSparesByVehicle});
  } catch (error) {
    next(error);
  }
};

