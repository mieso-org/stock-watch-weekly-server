const pool = require('../config/database');

class Portfolio {
  static async getAllPositions(userId = 1) {
    const query = `
      SELECT 
        pp.id,
        pp.shares,
        pp.avg_purchase_price,
        pp.total_invested,
        pp.stop_loss_price,
        pp.position_weight,
        pp.notes,
        s.symbol,
        s.company_name,
        e.name as exchange_name,
        sec.name as sector_name,
        sp.close_price as current_price,
        sp.price_date as price_updated_at
      FROM portfolio_positions pp
      JOIN stocks s ON pp.stock_id = s.id
      LEFT JOIN exchanges e ON s.exchange_id = e.id
      LEFT JOIN sectors sec ON s.sector_id = sec.id
      LEFT JOIN LATERAL (
        SELECT close_price, price_date 
        FROM stock_prices 
        WHERE stock_id = s.id 
        ORDER BY price_date DESC 
        LIMIT 1
      ) sp ON true
      WHERE pp.user_id = $1 AND pp.shares > 0
      ORDER BY pp.total_invested DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async addPosition(userId = 1, stockData) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // 1. Znajdź lub utwórz stock
      let stockResult = await client.query(
        'SELECT id FROM stocks WHERE symbol = $1',
        [stockData.symbol.toUpperCase()]
      );
      
      let stockId;
      if (stockResult.rows.length === 0) {
        // Utwórz nowy stock
        const newStockResult = await client.query(`
          INSERT INTO stocks (symbol, company_name, exchange_id, sector_id) 
          VALUES ($1, $2, $3, $4) 
          RETURNING id
        `, [
          stockData.symbol.toUpperCase(),
          stockData.companyName || stockData.symbol,
          stockData.exchangeId || 1, // Default NYSE
          stockData.sectorId || 1    // Default Technology
        ]);
        stockId = newStockResult.rows[0].id;
      } else {
        stockId = stockResult.rows[0].id;
      }
      
      // 2. Dodaj/aktualizuj pozycję
      const positionResult = await client.query(`
        INSERT INTO portfolio_positions 
        (user_id, stock_id, shares, avg_purchase_price, stop_loss_price, position_weight, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (user_id, stock_id) 
        DO UPDATE SET 
          shares = portfolio_positions.shares + EXCLUDED.shares,
          avg_purchase_price = (
            (portfolio_positions.shares * portfolio_positions.avg_purchase_price) + 
            (EXCLUDED.shares * EXCLUDED.avg_purchase_price)
          ) / (portfolio_positions.shares + EXCLUDED.shares),
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [
        userId, stockId, stockData.shares, stockData.purchasePrice,
        stockData.stopLoss, stockData.positionWeight, stockData.notes
      ]);
      
      // 3. Dodaj transakcję
      await client.query(`
        INSERT INTO transactions 
        (user_id, stock_id, transaction_type, shares, price_per_share, notes)
        VALUES ($1, $2, 'BUY', $3, $4, $5)
      `, [userId, stockId, stockData.shares, stockData.purchasePrice, stockData.notes]);
      
      await client.query('COMMIT');
      return positionResult.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async removePosition(userId = 1, positionId) {
    const result = await pool.query(`
      DELETE FROM portfolio_positions 
      WHERE id = $1 AND user_id = $2 
      RETURNING *
    `, [positionId, userId]);
    
    return result.rows[0];
  }

  static async getPortfolioSummary(userId = 1) {
    const query = `
      SELECT 
        COUNT(*) as total_positions,
        SUM(total_invested) as total_invested,
        SUM(shares * COALESCE(sp.close_price, avg_purchase_price)) as current_value,
        SUM(shares * COALESCE(sp.close_price, avg_purchase_price)) - SUM(total_invested) as total_gain_loss
      FROM portfolio_positions pp
      LEFT JOIN stocks s ON pp.stock_id = s.id
      LEFT JOIN LATERAL (
        SELECT close_price 
        FROM stock_prices 
        WHERE stock_id = s.id 
        ORDER BY price_date DESC 
        LIMIT 1
      ) sp ON true
      WHERE pp.user_id = $1 AND pp.shares > 0
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
}

module.exports = Portfolio;
