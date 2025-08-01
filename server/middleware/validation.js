const Joi = require('joi');

// User validation schemas
const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('student', 'faculty', 'admin').default('student'),
  department: Joi.string().trim().max(50),
  semester: Joi.number().integer().min(1).max(8).when('role', {
    is: 'student',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  employeeId: Joi.string().when('role', {
    is: 'faculty',
    then: Joi.required(),
    otherwise: Joi.optional()
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Notice validation schema
const noticeSchema = Joi.object({
  title: Joi.string().trim().min(5).max(200).required(),
  content: Joi.string().trim().min(10).max(2000).required(),
  category: Joi.string().valid('academic', 'event', 'general', 'urgent').required(),
  targetAudience: Joi.string().valid('all', 'students', 'faculty').default('all'),
  expiryDate: Joi.date().greater('now').optional(),
  department: Joi.string().trim().max(50).optional()
});

// Event validation schema
const eventSchema = Joi.object({
  title: Joi.string().trim().min(5).max(200).required(),
  description: Joi.string().trim().min(10).max(1000).required(),
  date: Joi.date().greater('now').required(),
  time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  venue: Joi.string().trim().min(3).max(100).required(),
  category: Joi.string().valid('academic', 'cultural', 'sports', 'workshop', 'seminar').required(),
  organizer: Joi.string().trim().min(2).max(100).required(),
  maxParticipants: Joi.number().integer().min(1).optional(),
  registrationRequired: Joi.boolean().default(false)
});

// Material validation schema
const materialSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),
  description: Joi.string().trim().max(500).optional(),
  subject: Joi.string().trim().min(2).max(100).required(),
  semester: Joi.number().integer().min(1).max(8).required(),
  department: Joi.string().trim().min(2).max(50).required(),
  materialType: Joi.string().valid('notes', 'assignment', 'syllabus', 'previous-papers', 'reference').required()
});

// Resume validation schema
const resumeSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),
  description: Joi.string().trim().max(300).optional(),
  category: Joi.string().valid('internship', 'placement', 'freelance', 'project').required(),
  skills: Joi.array().items(Joi.string().trim().max(50)).max(20).optional(),
  experience: Joi.string().valid('fresher', '0-1', '1-2', '2-5', '5+').default('fresher')
});

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors
      });
    }

    req.body = value;
    next();
  };
};

module.exports = {
  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema),
  validateNotice: validate(noticeSchema),
  validateEvent: validate(eventSchema),
  validateMaterial: validate(materialSchema),
  validateResume: validate(resumeSchema)
};
