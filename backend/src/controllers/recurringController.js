const { pool } = require('../utils/db');

// Helper function to calculate next due date
const calculateNextDueDate = (frequency, startDate, lastProcessedDate = null) => {
  const date = lastProcessedDate ? new Date(lastProcessedDate) : new Date(startDate);
  
  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'bi-weekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      // Default to monthly
      date.setMonth(date.getMonth() + 1);
  }
  
  return date.toISOString().split('T')[0];
};

// Get all recurring transactions
exports.getRecurringTransactions = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM recurring_transactions WHERE user_id = $1 ORDER BY next_due_date ASC',
      [req.user.id]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new recurring transaction
exports.createRecurringTransaction = async (req, res) => {
  const { 
    title, 
    category, 
    amount, 
    description, 
    frequency, 
    start_date, 
    end_date, 
    is_expense 
  } = req.body;
  
  try {
    const next_due_date = calculateNextDueDate(frequency, start_date);
    
    const result = await pool.query(
      `INSERT INTO recurring_transactions 
       (user_id, title, category, amount, description, frequency, start_date, end_date, is_expense, next_due_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [
        req.user.id, 
        title, 
        category, 
        amount, 
        description || null, 
        frequency, 
        start_date, 
        end_date || null, 
        is_expense !== undefined ? is_expense : true, 
        next_due_date
      ]
    );
    
    res.status(201).json({
      message: 'Recurring transaction created successfully',
      transaction: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a recurring transaction
exports.updateRecurringTransaction = async (req, res) => {
  const { id } = req.params;
  const { 
    title, 
    category, 
    amount, 
    description, 
    frequency, 
    start_date, 
    end_date, 
    is_expense,
    is_active 
  } = req.body;
  
  try {
    // First check if the transaction exists and belongs to the user
    const checkResult = await pool.query(
      'SELECT * FROM recurring_transactions WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Recurring transaction not found' });
    }
    
    // Calculate next due date if frequency or start date changed
    let next_due_date = checkResult.rows[0].next_due_date;
    if ((frequency && frequency !== checkResult.rows[0].frequency) || 
        (start_date && start_date !== checkResult.rows[0].start_date.toISOString().split('T')[0])) {
      next_due_date = calculateNextDueDate(
        frequency || checkResult.rows[0].frequency,
        start_date || checkResult.rows[0].start_date.toISOString().split('T')[0],
        checkResult.rows[0].last_processed_date
      );
    }
    
    const result = await pool.query(
      `UPDATE recurring_transactions 
       SET title = COALESCE($3, title),
           category = COALESCE($4, category),
           amount = COALESCE($5, amount),
           description = COALESCE($6, description),
           frequency = COALESCE($7, frequency),
           start_date = COALESCE($8, start_date),
           end_date = $9,
           is_expense = COALESCE($10, is_expense),
           is_active = COALESCE($11, is_active),
           next_due_date = $12,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [
        id, 
        req.user.id, 
        title, 
        category, 
        amount, 
        description, 
        frequency, 
        start_date, 
        end_date, 
        is_expense, 
        is_active,
        next_due_date
      ]
    );
    
    res.status(200).json({
      message: 'Recurring transaction updated successfully',
      transaction: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a recurring transaction
exports.deleteRecurringTransaction = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      'DELETE FROM recurring_transactions WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Recurring transaction not found' });
    }
    
    res.status(200).json({
      message: 'Recurring transaction deleted successfully',
      transaction: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Process due recurring transactions
exports.processDueTransactions = async (req, res) => {
  try {
    // Get all active recurring transactions that are due
    const currentDate = new Date().toISOString().split('T')[0];
    const dueTransactions = await pool.query(
      `SELECT * FROM recurring_transactions 
       WHERE user_id = $1 
       AND is_active = true 
       AND next_due_date <= $2
       AND (end_date IS NULL OR end_date >= $2)`,
      [req.user.id, currentDate]
    );
    
    const processedTransactions = [];
    
    // Process each due transaction
    for (const transaction of dueTransactions.rows) {
      // Create the actual transaction (expense or income)
      if (transaction.is_expense) {
        // Create expense
        const expenseResult = await pool.query(
          `INSERT INTO expenses 
           (user_id, category, amount, description, date) 
           VALUES ($1, $2, $3, $4, $5) 
           RETURNING *`,
          [
            req.user.id, 
            transaction.category, 
            transaction.amount, 
            `${transaction.title} (Recurring)`, 
            transaction.next_due_date
          ]
        );
        processedTransactions.push({
          type: 'expense',
          transaction: expenseResult.rows[0]
        });
      } else {
        // Handle income (assuming you have an income table)
        // If not, you might need to create an income table or adjust this code
      }
      
      // Update the recurring transaction
      const nextDueDate = calculateNextDueDate(transaction.frequency, null, transaction.next_due_date);
      
      await pool.query(
        `UPDATE recurring_transactions 
         SET last_processed_date = $1, 
             next_due_date = $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [transaction.next_due_date, nextDueDate, transaction.id]
      );
    }
    
    res.status(200).json({
      message: `Processed ${processedTransactions.length} recurring transactions`,
      processed: processedTransactions
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};