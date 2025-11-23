-- Add performance indexes for optimized queries
-- Migration: 20251122_181602_add_performance_indexes

-- Index for group lookup by id and deletion status (optimizes getGroupById)
CREATE INDEX IF NOT EXISTS idx_groups_id_is_deleted ON groups(id, is_deleted);

-- Index for ordering members by join date within groups (optimizes getGroupMembers)
CREATE INDEX IF NOT EXISTS idx_group_members_group_id_joined_at ON group_members(group_id, joined_at DESC);