-- Clean groups system migration with Supabase RLS best practices
-- Following official Supabase RLS guidelines for performance and security
-- Key improvements:
-- - PERMISSIVE policies with proper TO authenticated clauses
-- - Performance optimization using (select auth.uid()) wrapper
-- - Avoiding table joins in policies using IN subqueries
-- - Comprehensive indexes on RLS policy columns
-- - Proper separation of SELECT/INSERT/UPDATE/DELETE policies
-- Create groups table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL,
  group_type TEXT DEFAULT 'default',
  settings JSONB DEFAULT '{}',
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
-- Create indexes for groups (including RLS policy indexes)
CREATE INDEX idx_groups_owner_id ON groups(owner_id);
CREATE INDEX idx_groups_slug ON groups(slug);
CREATE INDEX idx_groups_type ON groups(group_type);
-- Additional indexes for RLS performance
CREATE INDEX idx_groups_id_owner_id ON groups(id, owner_id);
-- Create group_members table
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  permissions JSONB DEFAULT '{}',
  joined_at TIMESTAMP DEFAULT now(),
  UNIQUE(group_id, user_id)
);
-- Create indexes for group_members (including RLS policy indexes)
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
-- Additional indexes for RLS performance
CREATE INDEX idx_group_members_group_id_user_id ON group_members(group_id, user_id);
-- Create group_invitations table
CREATE TABLE group_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  invited_by UUID NOT NULL,
  token TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN (
      'pending',
      'accepted',
      'rejected',
      'expired',
      'cancelled'
    )
  ),
  expires_at TIMESTAMP NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP DEFAULT now(),
  accepted_at TIMESTAMP,
  details JSONB DEFAULT '{}'
);
-- Create indexes for group_invitations
CREATE INDEX idx_group_invitations_group_id ON group_invitations(group_id);
CREATE INDEX idx_group_invitations_email ON group_invitations(email);
CREATE INDEX idx_group_invitations_status ON group_invitations(status);
CREATE INDEX idx_group_invitations_expires_at ON group_invitations(expires_at);
-- Additional indexes for RLS performance
CREATE INDEX idx_group_invitations_group_id_email_status ON group_invitations(group_id, email, status);
-- Create group_audit_log table
CREATE TABLE group_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT now()
);
-- Create indexes for audit log (including RLS policy indexes)
CREATE INDEX idx_group_audit_log_group_id ON group_audit_log(group_id);
CREATE INDEX idx_group_audit_log_user_id ON group_audit_log(user_id);
CREATE INDEX idx_group_audit_log_action ON group_audit_log(action);
CREATE INDEX idx_group_audit_log_created_at ON group_audit_log(created_at);
-- Additional indexes for RLS performance
CREATE INDEX idx_group_audit_log_group_id_user_id ON group_audit_log(group_id, user_id);
-- Enable RLS on all tables
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_audit_log ENABLE ROW LEVEL SECURITY;
-- RLS Policies following Supabase best practices
-- Using PERMISSIVE policies, proper syntax, and performance optimizations
-- Groups policies
CREATE POLICY "Users can view groups they own" ON groups FOR
SELECT TO authenticated USING (
    owner_id = (
      select auth.uid()
    )
  );
CREATE POLICY "Users can create their own groups" ON groups FOR
INSERT TO authenticated WITH CHECK (
    owner_id = (
      select auth.uid()
    )
  );
CREATE POLICY "Users can update groups they own" ON groups FOR
UPDATE TO authenticated USING (
    owner_id = (
      select auth.uid()
    )
  ) WITH CHECK (
    owner_id = (
      select auth.uid()
    )
  );
CREATE POLICY "Users can delete groups they own" ON groups FOR DELETE TO authenticated USING (
  owner_id = (
    select auth.uid()
  )
);
-- Group members policies
CREATE POLICY "Users can view group memberships" ON group_members FOR
SELECT TO authenticated USING (
    user_id = (
      select auth.uid()
    )
  );
CREATE POLICY "Group owners can add members" ON group_members FOR
INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1
      FROM groups
      WHERE id = group_members.group_id
        AND owner_id = (
          select auth.uid()
        )
    )
  );
CREATE POLICY "Users can update their own membership" ON group_members FOR
UPDATE TO authenticated USING (
    user_id = (
      select auth.uid()
    )
  ) WITH CHECK (
    user_id = (
      select auth.uid()
    )
  );
CREATE POLICY "Users can leave groups" ON group_members FOR DELETE TO authenticated USING (
  user_id = (
    select auth.uid()
  )
);
-- Group invitations policies
CREATE POLICY "Users can manage invitations for groups they own" ON group_invitations FOR
SELECT TO authenticated USING (
    EXISTS (
      SELECT 1
      FROM groups
      WHERE groups.id = group_invitations.group_id
        AND groups.owner_id = (
          select auth.uid()
        )
    )
  );
CREATE POLICY "Users can create invitations for groups they own" ON group_invitations FOR
INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1
      FROM groups
      WHERE groups.id = group_invitations.group_id
        AND groups.owner_id = (
          select auth.uid()
        )
    )
  );
CREATE POLICY "Users can update invitations for groups they own" ON group_invitations FOR
UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1
      FROM groups
      WHERE groups.id = group_invitations.group_id
        AND groups.owner_id = (
          select auth.uid()
        )
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1
      FROM groups
      WHERE groups.id = group_invitations.group_id
        AND groups.owner_id = (
          select auth.uid()
        )
    )
  );
CREATE POLICY "Users can delete invitations for groups they own" ON group_invitations FOR DELETE TO authenticated USING (
  EXISTS (
    SELECT 1
    FROM groups
    WHERE groups.id = group_invitations.group_id
      AND groups.owner_id = (
        select auth.uid()
      )
  )
);
-- Group audit log policies
CREATE POLICY "Group owners can view audit logs" ON group_audit_log FOR
SELECT TO authenticated USING (
    EXISTS (
      SELECT 1
      FROM groups
      WHERE groups.id = group_audit_log.group_id
        AND groups.owner_id = (
          select auth.uid()
        )
    )
  );
CREATE POLICY "Users can log their own actions" ON group_audit_log FOR
INSERT TO authenticated WITH CHECK (
    user_id = (
      select auth.uid()
    )
  );