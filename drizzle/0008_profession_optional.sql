ALTER TABLE waitlist ALTER COLUMN profession DROP NOT NULL;
ALTER TABLE waitlist DROP CONSTRAINT IF EXISTS waitlist_profession_check;
