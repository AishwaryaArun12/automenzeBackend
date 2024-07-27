const SparePart = require('../models/sparePartsSchema');

exports.createSparePart = async (req, res, next) => {
  try {
   
    const { name, price, qty, image ,validity} = req.body;
    const sparePart = new SparePart({ name, price, qty, validity, image });
    await sparePart.save();
    res.status(201).json(sparePart);
  } catch (error) {
    next(error);
  }
};

exports.getAllSpareParts = async (req, res, next) => {
    try {
      const { search, page = 1 } = req.query;
      const limit = 7;
      const skip = (page - 1) * limit;
  
      let query = {};
      if (search) {
        query = {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { price: { $regex: search, $options: 'i' } },
            { quantity: { $regex: search, $options: 'i' } },
          ]
        };
      }
  
      const spareParts = await SparePart.find(query)
        .skip(skip)
        .limit(limit);
  
      const totalSpareParts = await SparePart.countDocuments(query);
      const totalPages = Math.ceil(totalSpareParts / limit);
  
      res.json({
        spareParts,
        totalPages,
        totalSpareParts
      });
    } catch (error) {
      next(error);
    }
  };

exports.getSparePartById = async (req, res, next) => {
  try {
    const sparePart = await SparePart.findById(req.params.id);
    if (!sparePart) return res.status(404).json({ message: 'Spare part not found' });
    res.json(sparePart);
  } catch (error) {
    next(error);
  }
};

exports.updateSparePart = async (req, res, next) => {
  try {
    const { name, price, quantity, image ,validity} = req.body;
    const sparePart = await SparePart.findByIdAndUpdate(
      req.params.id,
      { $set: { name, price, quantity, image, validity } },
      { new: true, runValidators: true }
    );
    if (!sparePart) return res.status(404).json({ message: 'Spare part not found' });
    res.json(sparePart);
  } catch (error) {
    next(error);
  }
};

exports.deleteSparePart = async (req, res, next) => {
  try {
    const sparePart = await SparePart.findByIdAndDelete(req.params.id);
    if (!sparePart) return res.status(404).json({ message: 'Spare part not found' });
    res.json({ message: 'Spare part deleted successfully' });
  } catch (error) {
    next(error);
  }
};