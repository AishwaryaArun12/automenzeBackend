const { body, param, validationResult } = require('express-validator');

exports.validateVehicleCreation = [
  body('maker').trim().notEmpty().withMessage('Maker is required'),
  body('model').trim().notEmpty().withMessage('Model is required'),
  body('type').trim().notEmpty().withMessage('Type is required'),
  body('dateOfManufacture').isISO8601().toDate().withMessage('Invalid date of manufacture'),
  body('registrationNumber').optional().trim().notEmpty().withMessage('Registion Number cannot be empty if provided'),
  body('color').trim().notEmpty().withMessage('Color is required'),
  body('driverName').trim().notEmpty().withMessage('Driver name is required'),
  body('driverPhone').trim().isMobilePhone().withMessage('Invalid driver phone number'),
  body('clientId').isMongoId().withMessage('Invalid client ID'),
];

exports.validateVehicleUpdate = [
  param('id').isMongoId().withMessage('Invalid vehicle ID'),
  body('maker').optional().trim().notEmpty().withMessage('Maker cannot be empty if provided'),
  body('registrationNumber').optional().trim().notEmpty().withMessage('Registion Number cannot be empty if provided'),
  body('model').optional().trim().notEmpty().withMessage('Model cannot be empty if provided'),
  body('type').optional().trim().notEmpty().withMessage('Type cannot be empty if provided'),
  body('dateOfManufacture').optional().isISO8601().toDate().withMessage('Invalid date of manufacture'),
  body('color').optional().trim().notEmpty().withMessage('Color cannot be empty if provided'),
  body('driverName').optional().trim().notEmpty().withMessage('Driver name cannot be empty if provided'),
  body('driverPhone').optional().trim().isMobilePhone().withMessage('Invalid driver phone number'),
];

exports.validateVehicleId = [
  param('id').isMongoId().withMessage('Invalid vehicle ID'),
];

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));

  return res.status(422).json({
    errors: extractedErrors,
  });
};



