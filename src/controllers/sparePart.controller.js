const SparePart = require('../models/sparePartsSchema');
const Category = require('../models/categorySchema')

exports.createSparePart = async (req, res, next) => {
  try {
   
    const { name, price, qty, image ,validity, category} = req.body;
    const sparePart = new SparePart({ name, price, qty, validity, image , category});
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

    let matchStage = {};
    if (search) {
      matchStage = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { price: { $regex: search, $options: 'i' } },
          { quantity: { $regex: search, $options: 'i' } },
          { 'category.name': { $regex: search, $options: 'i' } }
        ]
      };
    }

    const aggregationPipeline = [
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      { $match: matchStage },
      { $skip: skip },
      { $limit: limit }
    ];

    const spareParts = await SparePart.aggregate(aggregationPipeline);

    const totalSpareParts = await SparePart.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      { $match: matchStage },
      { $count: 'total' }
    ]);

    const totalPages = Math.ceil((totalSpareParts[0]?.total || 0) / limit);

    res.json({
      spareParts,
      totalPages,
      totalSpareParts: totalSpareParts[0]?.total || 0
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
    const { name, price, quantity, image ,validity, category} = req.body;
    const sparePart = await SparePart.findByIdAndUpdate(
      req.params.id,
      { $set: { name, price, quantity, image, validity ,category} },
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

exports.createCategory = async (req, res, next) => {
  try {
   
    const { name } = req.body;
    const category = new Category({ name });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

exports.getAllCategories = async (req, res, next) => {
    try {
      const { search, page = 1 } = req.query;
      const limit = 10;
      const skip = (page - 1) * limit;
  
      let query = {};
      if (search) {
        query = {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            
          ]
        };
      }
  
      const categories = await Category.find(query)
        .skip(skip)
        .limit(limit);
  
      const totalCategories = await Category.countDocuments(query);
      const totalPages = Math.ceil(totalCategories / limit);
  
      res.json({
        categories,
        totalPages,
        totalCategories
      });
    } catch (error) {
      next(error);
    }
  };

exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await SparePart.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: { name } },
      { new: true, runValidators: true }
    );
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    const spareParts = await SparePart.find({category : req.params.id})
    if (!category ) return res.status(404).json({ message: 'Category not found' });
    if (spareParts.length ) return res.status(400).json({ message: "Can't delete category. First delete all spareparts under this category." });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};