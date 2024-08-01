const { body, param ,validationResult} = require('express-validator');

const validate = (req, res, next) => {
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

exports.validateSparePartCreation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('qty').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('validity').isInt({ min: 0 }).withMessage('Validity must be a non-negative integer'),
  body('image').optional().isURL().withMessage('Image must be a valid URL'),
  body('category').isMongoId().withMessage('Invalid category ID'),

];

exports.validateSparePartUpdate = [
  param('id').isMongoId().withMessage('Invalid spare part ID'),
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('price').optional().isNumeric().withMessage('Price must be a number'),
  body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('image').optional().isURL().withMessage('Image must be a valid URL'),
  body('validity').isInt({ min: 0 }).withMessage('Validity must be a non-negative integer'),
  body('category').isMongoId().withMessage('Invalid category ID'),

];

exports.validateSparePartId = [
  param('id').isMongoId().withMessage('Invalid spare part ID')
];

exports.validateCategoryCreation = [
  body('name').notEmpty().withMessage('Name is required'),
  
];

exports.validateCategoryUpdate = [
  param('id').isMongoId().withMessage('Invalid category ID'),
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  
];

exports.validateCategoryId = [
  param('id').isMongoId().withMessage('Invalid category ID')
];

exports.validate = validate;