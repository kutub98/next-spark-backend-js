/**
 * Validate Request middleware
 * Validates request body and cookies using Joi schemas
 */

const catchAsync = require("../utils/catchAsync");

const validateRequest = (schema) => {
  return catchAsync(async (req, res, next) => {
    try {
      const { error, value } = schema.validate({
        body: req.body,
        cookies: req.cookies,
      });

      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.details.map((detail) => ({
            field: detail.path.join("."),
            message: detail.message,
          })),
        });
      }

      req.body = value.body;
      req.cookies = value.cookies;
      next();
    } catch (err) {
      next(err);
    }
  });
};

module.exports = validateRequest;
