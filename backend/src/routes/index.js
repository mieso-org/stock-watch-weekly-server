const express = require('express');
const portfolioRoutes = require('./portfolio');

const router = express.Router();

router.use('/portfolio', portfolioRoutes);

// API status
router.get('/status', (req, res) => {
  res.json({
    api: 'Stock Portfolio API',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
