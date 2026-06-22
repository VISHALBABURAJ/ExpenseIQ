-- ============================================================
-- Expense Tracker - Sample Seed Data
-- This file runs after JPA creates the schema (ddl-auto=update)
-- ============================================================

-- Insert sample expenses only if the table is empty
INSERT INTO expenses (category, amount, expense_date, day, month, year, description, created_at, updated_at)
SELECT * FROM (SELECT
    'Food', 450.00, CURDATE() - INTERVAL 1 DAY,
    DAY(CURDATE() - INTERVAL 1 DAY), MONTH(CURDATE()), YEAR(CURDATE()),
    'Groceries from supermarket',
    NOW(), NOW()
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM expenses LIMIT 1);

INSERT INTO expenses (category, amount, expense_date, day, month, year, description, created_at, updated_at)
SELECT 'Transport', 120.00, CURDATE() - INTERVAL 2 DAY,
    DAY(CURDATE() - INTERVAL 2 DAY), MONTH(CURDATE()), YEAR(CURDATE()),
    'Auto rickshaw and bus fare', NOW(), NOW()
WHERE EXISTS (SELECT 1 FROM expenses LIMIT 1) AND (SELECT COUNT(*) FROM expenses) = 1;

INSERT INTO expenses (category, amount, expense_date, day, month, year, description, created_at, updated_at)
SELECT 'Shopping', 1800.00, CURDATE() - INTERVAL 3 DAY,
    DAY(CURDATE() - INTERVAL 3 DAY), MONTH(CURDATE()), YEAR(CURDATE()),
    'Clothing from mall', NOW(), NOW()
WHERE EXISTS (SELECT 1 FROM expenses LIMIT 1) AND (SELECT COUNT(*) FROM expenses) <= 2;

INSERT INTO expenses (category, amount, expense_date, day, month, year, description, created_at, updated_at)
SELECT 'Entertainment', 350.00, CURDATE() - INTERVAL 4 DAY,
    DAY(CURDATE() - INTERVAL 4 DAY), MONTH(CURDATE()), YEAR(CURDATE()),
    'Movie tickets - weekend outing', NOW(), NOW()
WHERE EXISTS (SELECT 1 FROM expenses LIMIT 1) AND (SELECT COUNT(*) FROM expenses) <= 3;

INSERT INTO expenses (category, amount, expense_date, day, month, year, description, created_at, updated_at)
SELECT 'Health', 650.00, CURDATE() - INTERVAL 5 DAY,
    DAY(CURDATE() - INTERVAL 5 DAY), MONTH(CURDATE()), YEAR(CURDATE()),
    'Doctor consultation and medicines', NOW(), NOW()
WHERE EXISTS (SELECT 1 FROM expenses LIMIT 1) AND (SELECT COUNT(*) FROM expenses) <= 4;

INSERT INTO expenses (category, amount, expense_date, day, month, year, description, created_at, updated_at)
SELECT 'Utilities', 900.00, CURDATE() - INTERVAL 6 DAY,
    DAY(CURDATE() - INTERVAL 6 DAY), MONTH(CURDATE()), YEAR(CURDATE()),
    'Electricity and internet bill', NOW(), NOW()
WHERE EXISTS (SELECT 1 FROM expenses LIMIT 1) AND (SELECT COUNT(*) FROM expenses) <= 5;

INSERT INTO expenses (category, amount, expense_date, day, month, year, description, created_at, updated_at)
SELECT 'Rent', 12000.00, CURDATE() - INTERVAL 7 DAY,
    DAY(CURDATE() - INTERVAL 7 DAY), MONTH(CURDATE()), YEAR(CURDATE()),
    'Monthly apartment rent', NOW(), NOW()
WHERE EXISTS (SELECT 1 FROM expenses LIMIT 1) AND (SELECT COUNT(*) FROM expenses) <= 6;

INSERT INTO expenses (category, amount, expense_date, day, month, year, description, created_at, updated_at)
SELECT 'Education', 2500.00, CURDATE() - INTERVAL 10 DAY,
    DAY(CURDATE() - INTERVAL 10 DAY), MONTH(CURDATE()), YEAR(CURDATE()),
    'Online course subscription', NOW(), NOW()
WHERE EXISTS (SELECT 1 FROM expenses LIMIT 1) AND (SELECT COUNT(*) FROM expenses) <= 7;

INSERT INTO expenses (category, amount, expense_date, day, month, year, description, created_at, updated_at)
SELECT 'Food', 280.00, CURDATE() - INTERVAL 1 DAY,
    DAY(CURDATE() - INTERVAL 1 DAY), MONTH(CURDATE()), YEAR(CURDATE()),
    'Lunch at restaurant', NOW(), NOW()
WHERE EXISTS (SELECT 1 FROM expenses LIMIT 1) AND (SELECT COUNT(*) FROM expenses) <= 8;

INSERT INTO expenses (category, amount, expense_date, day, month, year, description, created_at, updated_at)
SELECT 'Transport', 200.00, CURDATE(),
    DAY(CURDATE()), MONTH(CURDATE()), YEAR(CURDATE()),
    'Cab to office', NOW(), NOW()
WHERE EXISTS (SELECT 1 FROM expenses LIMIT 1) AND (SELECT COUNT(*) FROM expenses) <= 9;
