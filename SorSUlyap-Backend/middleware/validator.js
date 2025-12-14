const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .isIn(['Admin', 'Faculty', 'Student'])
    .withMessage('Invalid role'),
  validate
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

const scheduleValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('program').trim().notEmpty().withMessage('Program is required'),
  body('yearLevel').isInt({ min: 1, max: 4 }).withMessage('Year level must be between 1 and 4'),
  body('semester').isIn(['1st', '2nd', 'Summer']).withMessage('Invalid semester'),
  body('academicYear').trim().notEmpty().withMessage('Academic year is required'),
  validate
];

const announcementValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('targetAudience')
    .isIn(['All', 'Faculty', 'Students', 'Specific_Program'])
    .withMessage('Invalid target audience'),
  validate
];

const eventValidation = [
  body('eventName').trim().notEmpty().withMessage('Event name is required'),
  body('date').isISO8601().withMessage('Invalid date format'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('targetAudience')
    .isIn(['All', 'Faculty', 'Students', 'Specific_Program'])
    .withMessage('Invalid target audience'),
  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  scheduleValidation,
  announcementValidation,
  eventValidation
};
