const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const userRegistrationSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  displayName: Joi.string().min(1).max(100).optional(),
});

const userLoginSchema = Joi.object({
  username: Joi.string().min(1).required(), // accepts username or email in server logic
  password: Joi.string().required(),
});

const roleUpdateSchema = Joi.object({
  roleName: Joi.string().min(1).required(),
});


module.exports = {
  validate,
  userRegistrationSchema,
  userLoginSchema,
  roleUpdateSchema,
};
