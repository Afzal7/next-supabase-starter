-- Add user details to group_members table
-- Store email and name directly in group_members for simplicity
-- This avoids extra joins and provides user info per membership
ALTER TABLE group_members ADD COLUMN email TEXT;
ALTER TABLE group_members ADD COLUMN name TEXT;

-- Create index for email searches if needed
CREATE INDEX idx_group_members_email ON group_members(email);