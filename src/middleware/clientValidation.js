const { body, param, validationResult } = require('express-validator');

exports.validateClientCreation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Invalid email address'),
  body('contactNumber').trim().notEmpty().withMessage('Contact number is required')
    .isMobilePhone().withMessage('Invalid contact number'),
  body('company').optional().trim(),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
];

exports.validateClientUpdate = [
  param('id').isMongoId().withMessage('Invalid client ID'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty if provided'),
  body('email').optional().trim().isEmail().withMessage('Invalid email address'),
  body('contactNumber').optional().trim().isMobilePhone().withMessage('Invalid contact number'),
  body('company').optional().trim(),
  body('city').optional().trim().notEmpty().withMessage('City cannot be empty if provided'),
  body('location').optional().trim().notEmpty().withMessage('Location cannot be empty if provided'),
];

exports.validateClientId = [
  param('id').isMongoId().withMessage('Invalid client ID'),
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