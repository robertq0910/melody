-- Let admins archive hosting requests to hide them from the default list
-- without losing their status (0 = active, 1 = archived).
ALTER TABLE hosting_requests ADD COLUMN archived INTEGER NOT NULL DEFAULT 0;
