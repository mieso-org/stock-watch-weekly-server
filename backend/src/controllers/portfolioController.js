const Portfolio = require('../models/Portfolio');
const { validationResult } = require('express-validator');

exports.getPortfolio = async (req, res) => {
  try {
    const userId = req.user?.id || 1; // Default user for now
    
    const [positions, summary] = await Promise.all([
      Portfolio.getAllPositions(userId),
      Portfolio.getPortfolioSummary(userId)
    ]);
    
    res.json({
      success: true,
      data: {
        positions,
        summary,
        lastUpdated: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch portfolio data'
    });
  }
};

exports.addPosition = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const userId = req.user?.id || 1;
    const position = await Portfolio.addPosition(userId, req.body);
    
    res.status(201).json({
      success: true,
      data: position,
      message: 'Position added successfully'
    });
    
  } catch (error) {
    console.error('Error adding position:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add position'
    });
  }
};

exports.removePosition = async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const { id } = req.params;
    
    const removedPosition = await Portfolio.removePosition(userId, id);
    
    if (!removedPosition) {
      return res.status(404).json({
        success: false,
        error: 'Position not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Position removed successfully'
    });
    
  } catch (error) {
    console.error('Error removing position:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove position'
    });
  }
};
