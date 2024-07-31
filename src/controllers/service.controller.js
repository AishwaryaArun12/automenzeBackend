const Service = require('../models/serviceSchema');
const Vehicle = require('../models/vehicleSchema');

exports.createService = async (req, res, next) => {
  try {
    const { vehicleId, serviceType, serviceDate, replacedSpares, renewalSpares, mandatorySpares, recommendedSpares } = req.body;
    const service = new Service({
      vehicle: vehicleId,
      serviceType,
      serviceDate,
      replacedSpares,
      renewalSpares,
      mandatorySpares,
      recommendedSpares
    });
    await service.save();
    
    await Vehicle.findByIdAndUpdate(vehicleId, { $push: { services: service._id } });
    
    res.status(201).json(service);
  } catch (error) {
    next(error);
  }
};

exports.getAllServices = async (req, res, next) => {
    try {
      const { search, page = 1, limit = 7 } = req.query;
      const skip = (page - 1) * limit;
  
      let query = {};
      if (search) {
        query = {
          $or: [
            { serviceType: { $regex: search, $options: 'i' } },
            { 'vehicle.registrationNumber': { $regex: search, $options: 'i' } },
            { 'vehicle.client.name': { $regex: search, $options: 'i' } },
            { 'vehicle.client.contactNumber': { $regex: search, $options: 'i' } }
          ]
        };
      }
  
      const services = await Service.find(query)
        .populate({
          path: 'vehicle',
          select: 'registrationNumber client',
          populate: {
            path: 'client',
            select: 'name contactNumber'
          }
        })
        .populate('replacedSpares.spare renewalSpares.spare mandatorySpares.spare recommendedSpares.spare', 'name validity')
        .select('serviceType serviceDate replacedSpares renewalSpares mandatorySpares recommendedSpares')
        .skip(skip)
        .limit(Number(limit));
  
      const totalServices = await Service.countDocuments(query);
      const totalPages = Math.ceil(totalServices / limit);
  
      res.json({
        services,
        totalPages,
        currentPage: page,
        totalServices
      });
    } catch (error) {
      next(error);
    }
  };
  

exports.getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate({path : 'vehicle', select : 'maker model registrationNumber type color' ,populate : {
        path : 'client',
        select : 'name contactNumber location city company'
      }})
      .populate('replacedSpares.spare renewalSpares.spare mandatorySpares.spare recommendedSpares.spare', 'name');
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (error) {
    next(error);
  }
};

exports.updateService = async (req, res, next) => {
  try {
    const { serviceType, serviceDate, replacedSpares, renewalSpares, mandatorySpares, recommendedSpares } = req.body;
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: { serviceType, serviceDate, replacedSpares, renewalSpares, mandatorySpares, recommendedSpares } },
      { new: true, runValidators: true }
    ).populate('vehicle', 'maker model')
     .populate('replacedSpares.spare renewalSpares.spare mandatorySpares.spare recommendedSpares.spare', 'name');
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (error) {
    next(error);
  }
};

exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    await Vehicle.findByIdAndUpdate(service.vehicle, { $pull: { services: service._id } });
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    next(error);
  }
};
