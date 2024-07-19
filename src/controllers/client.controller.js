const Client = require('../models/clientSchema');

exports.createClient = async (req, res, next) => {
  try {
    const { name, email, contactNumber, company, city, location } = req.body;
    const client = new Client({
      name,
      email,
      contactNumber,
      company,
      city,
      location
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
    const clients = await Client.find();
    res.json(clients);
  } catch (error) {
    next(error);
  }
};

exports.getClientById = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (error) {
    next(error);
  }
};

exports.updateClient = async (req, res, next) => {
  try {
    const { name, email, contactNumber, company, city, location } = req.body;
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { name, email, contactNumber, company, city, location },
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