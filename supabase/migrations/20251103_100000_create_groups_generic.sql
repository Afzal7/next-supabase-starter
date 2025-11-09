-- Note: We avoid foreign key constraints to auth.users to prevent RLS policy issues
-- User IDs are validated at the application level using auth.uid()

-- Create groups table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL, -- References auth.users(id) but no FK constraint
  group_type TEXT DEFAULT 'default',
  settings JSONB DEFAULT '{}',
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes for groups
CREATE INDEX idx_groups_owner_id ON groups(owner_id);
CREATE INDEX idx_groups_slug ON groups(slug);
CREATE INDEX idx_groups_type ON groups(group_type);
CREATE INDEX idx_groups_is_deleted ON groups(is_deleted);

-- Create group_members table
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- References auth.users(id) but no FK constraint
  role TEXT NOT NULL,
  permissions JSONB DEFAULT '{}',
  joined_at TIMESTAMP DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create indexes for group_members
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_group_members_role ON group_members(role);

-- Create group_invitations table
CREATE TABLE group_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  invited_by UUID NOT NULL, -- References auth.users(id) but no FK constraint
  token TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  expires_at TIMESTAMP NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP DEFAULT now(),
  accepted_at TIMESTAMP,
  details JSONB DEFAULT '{}' -- Store additional data like inviter_name to avoid querying auth.users
);

-- Create indexes for group_invitations
CREATE INDEX idx_group_invitations_group_id ON group_invitations(group_id);
CREATE INDEX idx_group_invitations_email ON group_invitations(email);
CREATE INDEX idx_group_invitations_status ON group_invitations(status);
CREATE INDEX idx_group_invitations_expires_at ON group_invitations(expires_at);

-- Create group_audit_log table
CREATE TABLE group_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID, -- References auth.users(id) but no FK constraint
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Create indexes for audit log
CREATE INDEX idx_group_audit_log_group_id ON group_audit_log(group_id);
CREATE INDEX idx_group_audit_log_user_id ON group_audit_log(user_id);
CREATE INDEX idx_group_audit_log_action ON group_audit_log(action);
CREATE INDEX idx_group_audit_log_created_at ON group_audit_log(created_at);

-- Enable RLS on all tables
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for groups table
CREATE POLICY groups_select_policy ON groups
  FOR SELECT USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = groups.id AND user_id = auth.uid()
    )
  );

CREATE POLICY groups_insert_policy ON groups
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY groups_update_policy ON groups
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY groups_delete_policy ON groups
  FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for group_members table
CREATE POLICY group_members_select_policy ON group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE id = group_members.group_id AND (
        owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM group_members gm
          WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY group_members_insert_policy ON group_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups
      WHERE id = group_members.group_id AND owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid()
      AND gm.permissions->>'invite_members' = 'true'
    )
  );

CREATE POLICY group_members_update_policy ON group_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE id = group_members.group_id AND owner_id = auth.uid()
    ) OR
    (user_id = auth.uid()) -- Users can update themselves (leave group)
  );

CREATE POLICY group_members_delete_policy ON group_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE id = group_members.group_id AND owner_id = auth.uid()
    ) OR
    (user_id = auth.uid()) -- Users can remove themselves
  );

-- RLS Policies for group_invitations table
CREATE POLICY group_invitations_select_policy ON group_invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE id = group_invitations.group_id AND (
        owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM group_members gm
          WHERE gm.group_id = group_invitations.group_id AND gm.user_id = auth.uid()
          AND gm.permissions->>'manage_invitations' = 'true'
        )
      )
    )
  );

CREATE POLICY group_invitations_insert_policy ON group_invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups
      WHERE id = group_invitations.group_id AND owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_invitations.group_id AND gm.user_id = auth.uid()
      AND gm.permissions->>'invite_members' = 'true'
    )
  );

CREATE POLICY group_invitations_update_policy ON group_invitations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE id = group_invitations.group_id AND owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_invitations.group_id AND gm.user_id = auth.uid()
      AND gm.permissions->>'manage_invitations' = 'true'
    )
  );

CREATE POLICY group_invitations_delete_policy ON group_invitations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE id = group_invitations.group_id AND owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_invitations.group_id AND gm.user_id = auth.uid()
      AND gm.permissions->>'manage_invitations' = 'true'
    )
  );

-- RLS Policies for group_audit_log table
CREATE POLICY group_audit_log_select_policy ON group_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE id = group_audit_log.group_id AND (
        owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM group_members gm
          WHERE gm.group_id = group_audit_log.group_id AND gm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY group_audit_log_insert_policy ON group_audit_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for groups table
CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();