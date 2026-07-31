-- Fix user balance from credits_ledger
-- This recalculates the balance from all purchase entries in the ledger
-- Run this if the balance is incorrect after the cross join bug fix

UPDATE users
SET credits_balance = (
  SELECT COALESCE(SUM(amount), 0)
  FROM credits_ledger
  WHERE user_id = users.id AND type = 'purchase'
)
WHERE id IN (SELECT DISTINCT user_id FROM credits_ledger WHERE type = 'purchase');
