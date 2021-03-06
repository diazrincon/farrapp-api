const Joi = require('joi');

const adminValidation = {};

adminValidation.postAdminVal = Joi.object({
  email: Joi.string()
    .email()
    .max(150)
    .regex(/^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i)
    .required(),
  password: Joi.string().max(150).required(),
  firstName: Joi.string().max(30).required(),
  lastName: Joi.string().max(30).required(),
});

adminValidation.updateAdmin = Joi.object({
  firstName: Joi.string().max(30).required(),
  lastName: Joi.string().max(30).required(),
});
module.exports = adminValidation;
