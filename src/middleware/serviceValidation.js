const { body, param, validationResult } = require('express-validator');

exports.validateServiceCreation = [
  body('vehicleId').isMongoId().withMessage('Invalid vehicle ID'),
  body('serviceType').trim().notEmpty().withMessage('Service type is required'),
  body('serviceDate').isISO8601().toDate().withMessage('Invalid service date'),
  body('replacedSpares').optional().isArray().withMessage('Replaced spares must be an array'),
  body('replacedSpares.*.spare').isMongoId().withMessage('Invalid spare part ID'),
  body('replacedSpares.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('renewalSpares').optional().isArray().withMessage('Renewal spares must be an array'),
  body('renewalSpares.*.spare').isMongoId().withMessage('Invalid spare part ID'),
  body('renewalSpares.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('mandatorySpares').optional().isArray().withMessage('Mandatory spares must be an array'),
  body('mandatorySpares.*.spare').isMongoId().withMessage('Invalid spare part ID'),
  body('mandatorySpares.*.validity').isInt({ min: 1 }).withMessage('Validity must be a positive integer'),
  body('recommendedSpares').optional().isArray().withMessage('Recommended spares must be an array'),
  body('recommendedSpares.*.spare').isMongoId().withMessage('Invalid spare part ID'),
  body('recommendedSpares.*.validity').isInt({ min: 1 }).withMessage('Validity must be a positive integer'),
];

exports.validateServiceUpdate = [
  param('id').isMongoId().withMessage('Invalid service ID'),
  body('serviceType').optional().trim().notEmpty().withMessage('Service type cannot be empty if provided'),
  body('serviceDate').optional().isISO8601().toDate().withMessage('Invalid service date'),
  body('replacedSpares').optional().isArray().withMessage('Replaced spares must be an array'),
  body('replacedSpares.*.spare').isMongoId().withMessage('Invalid spare part ID'),
  body('replacedSpares.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('renewalSpares').optional().isArray().withMessage('Renewal spares must be an array'),
  body('renewalSpares.*.spare').isMongoId().withMessage('Invalid spare part ID'),
  body('renewalSpares.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('mandatorySpares').optional().isArray().withMessage('Mandatory spares must be an array'),
  body('mandatorySpares.*.spare').isMongoId().withMessage('Invalid spare part ID'),
  body('mandatorySpares.*.validity').isInt({ min: 1 }).withMessage('Validity must be a positive integer'),
  body('recommendedSpares').optional().isArray().withMessage('Recommended spares must be an array'),
  body('recommendedSpares.*.spare').isMongoId().withMessage('Invalid spare part ID'),
  body('recommendedSpares.*.validity').isInt({ min: 1 }).withMessage('Validity must be a positive integer'),
];

exports.validateServiceId = [
  param('id').isMongoId().withMessage('Invalid service ID'),
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