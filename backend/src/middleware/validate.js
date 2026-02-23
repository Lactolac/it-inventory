const { validationResult } = require('express-validator');
const { ValidationError } = require('./errorHandler');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg
    }));
    
    return next(new ValidationError('Error de validación', errorMessages));
  }
  
  next();
};

// Common validation rules
const commonValidations = {
  idParam: (paramName = 'id') => ({
    param: paramName,
    isInt: { min: 1 },
    withMessage: 'ID debe ser un número entero positivo'
  }),
  
  pagination: {
    limit: {
      query: 'limit',
      optional: true,
      isInt: { min: 1, max: 100 },
      withMessage: 'Limit debe ser un número entre 1 y 100'
    },
    offset: {
      query: 'offset',
      optional: true,
      isInt: { min: 0 },
      withMessage: 'Offset debe ser un número positivo'
    }
  }
};

module.exports = {
  validate,
  commonValidations
};
