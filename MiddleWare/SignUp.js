const joi = require("joi");

const registerValidation = async (req, res, next) => {
  const registerSchema = joi.object({
    uname: joi.string().required().messages({
      "string.base": `UserName must be string`,
      "string.empty": `userName cannot be an empty field`,
      "any.required": `userName is a required field`,
    }),
    email: joi.string().email().required().messages({
      "string.email": `email must be a valid email`,
      "any.required": `email is a required field`,
    }),
    password: joi.string()
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
      .required()
      .messages({
        "string.pattern.base": "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
        "any.required": `"password" is a required field`,
      }),
  });

  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).send({ status: error.details[0].message });
  }
  next();
};

module.exports=registerValidation;
