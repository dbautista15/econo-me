const { pool } = require('../utils/db');

// Get user settings
exports.getUserSettings = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_settings WHERE user_id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      // Create default settings if they don't exist
      const newSettings = await pool.query(
        `INSERT INTO user_settings 
         (user_id, monthly_income, spending_limit, savings_goal, theme, notification_enabled) 
         VALUES ($1, 0, 0, 0, 'light', false)
         RETURNING *`,
        [req.user.id]
      );
      
      return res.json(newSettings.rows[0]);
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching user settings' });
  }
};

// Update user settings
exports.updateUserSettings = async (req, res) => {
  const { monthly_income, spending_limit, savings_goal, theme, notification_enabled } = req.body;

  try {
    // Check if settings exist
    const checkSettings = await pool.query(
      'SELECT * FROM user_settings WHERE user_id = $1',
      [req.user.id]
    );

    let result;
    
    if (checkSettings.rows.length === 0) {
      // Create settings if they don't exist
      result = await pool.query(
        `INSERT INTO user_settings 
         (user_id, monthly_income, spending_limit, savings_goal, theme, notification_enabled) 
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [req.user.id, monthly_income || 0, spending_limit || 0, savings_goal || 0, theme || 'light', notification_enabled || false]
      );
    } else {
      // Update existing settings
      result = await pool.query(
        `UPDATE user_settings 
         SET monthly_income = $2, 
             spending_limit = $3, 
             savings_goal = $4, 
             theme = $5, 
             notification_enabled = $6,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1
         RETURNING *`,
        [req.user.id, monthly_income, spending_limit, savings_goal, theme, notification_enabled]
      );
    }

    res.json({
      message: 'Settings updated successfully',
      settings: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during settings update' });
  }
};