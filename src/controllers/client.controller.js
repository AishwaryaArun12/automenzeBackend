const Client = require('../models/clientSchema');

exports.createClient = async (req, res, next) => {
  try {
    const { name, email, contactNumber, company, city, location,image } = req.body;
    const client = new Client({
      name,
      email,
      contactNumber,
      company,
      city,
      location,
      image
    });
    await client.save();
    res.status(201).json(client);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    next(error);
  }
};

exports.getAllClients = async (req, res, next) => {
  try {
    const { search, page = 1 } = req.query;
    const limit = 7;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { contactNumber: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
          { city: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const clients = await Client.find(query)
      .skip(skip)
      .limit(limit);

    const totalClients = await Client.countDocuments(query);
    const totalPages = Math.ceil(totalClients / limit);

    res.json({
      clients,
      totalPages,
      totalClients
    });
  } catch (error) {
    next(error);
  }
};

exports.getClientById = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id).populate('vehicles');
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (error) {
    next(error);
  }
};

exports.updateClient = async (req, res, next) => {
  try {
    const { name, email, contactNumber, company, city, location ,image} = req.body;
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { $set : {name, email, contactNumber, company, city, location ,image}},
      { new: true, runValidators: true }
    );
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    next(error);
  }
};

exports.deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    next(error);
  }
};