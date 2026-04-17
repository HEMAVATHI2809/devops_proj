const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const validateSignup = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'customer', 'provider'])
    .withMessage('Role must be either admin, customer, or provider'),
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateService = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Service name must be between 1 and 100 characters'),
  body('category')
    .isIn(['Healthcare & Wellness', 'Beauty & Personal Care', 'Education & Training', 'Corporate & Professional Services', 'Home & Maintenance', 'Creative & Arts', 'Technology & Digital', 'Sports & Fitness', 'Other'])
    .withMessage('Invalid category'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  body('price')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('duration')
    .isInt({ min: 15 })
    .withMessage('Duration must be at least 15 minutes'),
  body('image')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Image must be a valid URL'),
  body('availableDays')
    .isArray({ min: 1 })
    .withMessage('At least one available day must be selected'),
  body('availableDays.*')
    .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    .withMessage('Invalid day selected'),
  body('availableTimeSlots')
    .isArray({ min: 1 })
    .withMessage('At least one time slot must be provided'),
  body('availableTimeSlots.*')
    .trim()
    .notEmpty()
    .withMessage('Time slot cannot be empty'),
  handleValidationErrors
];

const validateAppointment = [
  body('serviceId')
    .isMongoId()
    .withMessage('Invalid service ID'),
  body('date')
    .isISO8601()
    .toDate()
    .withMessage('Invalid date format'),
  body('timeSlot')
    .trim()
    .notEmpty()
    .withMessage('Time slot is required'),
  handleValidationErrors
];

module.exports = {
  validateSignup,
  validateLogin,
  validateService,
  validateAppointment,
  handleValidationErrors
};
