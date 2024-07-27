const Vehicle = require('../models/vehicleSchema');
const Client = require('../models/clientSchema');

exports.createVehicle = async (req, res, next) => {
  try {
    const { maker, model, type, dateOfManufacture, color, driverName, driverPhone,image, clientId } = req.body;
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