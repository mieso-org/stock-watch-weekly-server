const express = require('express');
const { body } = require('express-validator');
const portfolioController = require('../controllers/portfolioController');

const router = express.Router();

// Validation middleware
const addPositionValidation = [
  body('symbol')
    .isLength({ min: 1, max: 10 })
    .withMessage('Symbol must be 1-10 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Symbol must contain only uppercase letters and numbers'),
    
  body('shares')
    .isFloat({ min: 0.0001, max: 1000000 })
    .withMessage('Shares must be between 0.0001 and 1,000,000'),
    
  body('purchasePrice')
    .isFloat({ min: 0.01, max: 100000 })
    .withMessage('Purchase price must be between $0.01 and $100,000'),
    
  body('stopLoss')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Stop loss must be greater than $0.01'),
    
  body('positionWeight')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Position weight must be between 0% and 100%')
];

// Routes
router.get('/', portfolioController.getPortfolio);
router.post('/', addPositionValidation, portfolioController.addPosition);
router.delete('/:id', portfolioController.removePosition);

module.exports = router;
