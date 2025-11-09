# BACKEND_IMPLEMENTATION_PLAN.md

## Executive Summary

This plan implements a generic group/team management system that can be configured for different application types (organizations, teams, workspaces, projects, etc.). Users can create groups, invite members via email, manage configurable roles, and collaborate within group boundaries. The implementation follows production-grade patterns with proper RLS policies, TypeScript types, and RTK Query integration.

**Key Features:**
- Generic group creation and management (configurable entity names)
- Email-based user invitations with customizable templates
- Configurable role-based access control
- Multi-group support per user
- Invitation acceptance/rejection workflow
- Group switching and context management
- Plugin architecture for extensibility

**Technology Stack:** Next.js 15, Supabase PostgreSQL, TypeScript, Zod, RTK Query

**Configuration-Driven Design:**
- Entity names (Organization/Team/Workspace) configurable
- Roles and permissions fully customizable
- Business rules and limits configurable per app
- Email templates and branding customizable
- UI components themeable and extensible

## Data Architecture

### Database Schema Design

#### groups table (generic entity - configurable as Organization/Team/Workspace/Project/etc.)
**Table Name**: `groups` (standard name for this starter template)

**Note**: The entity name is configured in `config/groups.ts` (e.g., "Organization", "Team", "Workspace"). This allows the same database schema to power different types of applications while maintaining consistent table structure.
- `id: uuid PRIMARY KEY DEFAULT gen_random_uuid()`
- `name: text NOT NULL`
- `slug: text UNIQUE NOT NULL` (URL-friendly identifier, generated in application code)
- `description: text`
- `owner_id: uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT` (prevent owner deletion)
- `group_type: text DEFAULT 'default'` (optional: for apps supporting multiple group types)
- `settings: jsonb` (configurable group settings)
- `is_deleted: boolean DEFAULT false` (soft delete)
- `deleted_at: timestamp`
- `created_at: timestamp DEFAULT now()`
- `updated_at: timestamp DEFAULT now()`
- **Indexes**: `idx_groups_owner_id`, `idx_groups_slug`, `idx_groups_type`, `idx_groups_is_deleted`

#### group_members table (junction table)
- `id: uuid PRIMARY KEY DEFAULT gen_random_uuid()`
- `group_id: uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE`
- `user_id: uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
- `role: text NOT NULL` (configurable roles, not hard-coded)
- `permissions: jsonb` (role-specific permissions)
- `joined_at: timestamp DEFAULT now()`
- `UNIQUE(group_id, user_id)`
- **Indexes**: `idx_group_members_group_id`, `idx_group_members_user_id`, `idx_group_members_role`

#### group_invitations table
- `id: uuid PRIMARY KEY DEFAULT gen_random_uuid()`
- `group_id: uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE`
- `email: text NOT NULL`
- `role: text NOT NULL` (configurable roles)
- `invited_by: uuid NOT NULL REFERENCES auth.users(id)`
- `token: text UNIQUE NOT NULL` (SHA-256 hash generated in application code)
- `status: text NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')) DEFAULT 'pending'`
- `expires_at: timestamp NOT NULL DEFAULT (now() + interval '7 days')`
- `created_at: timestamp DEFAULT now()`
- `accepted_at: timestamp`
- **Indexes**: `idx_group_invitations_group_id`, `idx_group_invitations_email`, `idx_group_invitations_status`, `idx_group_invitations_expires_at`

#### group_audit_log table (for security auditing)
- `id: uuid PRIMARY KEY DEFAULT gen_random_uuid()`
- `group_id: uuid REFERENCES groups(id) ON DELETE CASCADE`
- `user_id: uuid REFERENCES auth.users(id) ON DELETE SET NULL`
- `action: text NOT NULL` (configurable actions)
- `details: jsonb` (action-specific data)
- `ip_address: inet`
- `user_agent: text`
- `created_at: timestamp DEFAULT now()`

### Relations Diagram
```
auth.users (Supabase built-in)
├── owns ── groups (1:many)
└── member_of ── group_members (many:many)
                   ├── belongs_to ── groups
                   └── invited_via ── group_invitations
```
auth.users (Supabase built-in)
├── owns ── organizations (1:many)
└── member_of ── organization_members (many:many)
                   ├── belongs_to ── organizations
                   └── invited_via ── organization_invitations
```

### Row-Level Security Policies

#### groups table
- `SELECT`: Users can view groups they own or are members of
- `INSERT`: Authenticated users can create groups (subject to configurable limits)
- `UPDATE`: Only group owners can update their groups
- `DELETE`: Only group owners can delete their groups

#### group_members table
- `SELECT`: Users can view members of groups they belong to
- `INSERT`: Group owners/admins can add members (based on role permissions)
- `UPDATE`: Group owners can change roles; users can leave
- `DELETE`: Group owners can remove members; users can leave

#### group_invitations table
- `SELECT`: Group owners/admins can view pending invitations
- `INSERT`: Group owners/admins can create invitations (based on role permissions)
- `UPDATE`: Invited users can accept/reject; owners can cancel
- `DELETE`: Group owners can delete expired invitations

## API Specification

### Groups Endpoints (Generic - configurable entity name)

#### `GET /api/groups`
- **Auth:** Required
- **Query Params:** `page=1`, `limit=20`, `search=term`, `type=organization`
- **Response:** Paginated list of groups user belongs to
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Acme Corp",
      "slug": "acme-corp",
      "description": "Building widgets",
      "role": "owner",
      "member_count": 5,
      "group_type": "organization",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

#### `POST /api/groups`
- **Auth:** Required
- **Body:** `{ name: string, slug?: string, description?: string, group_type?: string }`
- **Response:** Created group

#### `GET /api/groups/[id]`
- **Auth:** Required (member of group)
- **Response:** Group details with members

#### `PUT /api/groups/[id]`
- **Auth:** Required (owner only)
- **Body:** Update fields

#### `DELETE /api/groups/[id]`
- **Auth:** Required (owner only)

### Members Endpoints

#### `GET /api/groups/[id]/members`
- **Auth:** Required (member of group)
- **Response:** List of group members with their roles and permissions

#### `POST /api/groups/[id]/members`
- **Auth:** Required (based on role permissions)
- **Body:** `{ email: string, role: string }`
- **Response:** Created invitation

#### `PUT /api/groups/[id]/members/[userId]`
- **Auth:** Required (owner only or role-based permissions)
- **Body:** `{ role: string }`

#### `DELETE /api/groups/[id]/members/[userId]`
- **Auth:** Required (owner or self, based on permissions)

### Invitations Endpoints

#### `GET /api/groups/[id]/invitations`
- **Auth:** Required (based on role permissions)
- **Response:** Pending invitations

#### `POST /api/invitations/[token]/accept`
- **Auth:** Required (matching email)
- **Response:** Join group

#### `POST /api/invitations/[token]/reject`
- **Auth:** Required (matching email)

#### `DELETE /api/groups/[id]/invitations/[invitationId]`
- **Auth:** Required (based on role permissions)

### Error Response Format
All endpoints return standardized errors:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR|UNAUTHORIZED|FORBIDDEN|NOT_FOUND|RATE_LIMITED",
    "message": "Human-readable error message",
    "details": { "field": "specific validation error" }
  }
}
```



## TypeScript Architecture

### Database Types (Generic)
```typescript
type Group = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  owner_id: string;
  group_type: string;
  settings?: Record<string, any>;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
};

type GroupMember = {
  id: string;
  group_id: string;
  user_id: string;
  role: string; // Configurable, not hard-coded
  permissions?: Record<string, boolean>;
  joined_at: string;
};

type GroupInvitation = {
  id: string;
  group_id: string;
  email: string;
  role: string; // Configurable
  invited_by: string;
  token: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  expires_at: string;
  created_at: string;
  accepted_at?: string;
};

type GroupAuditLog = {
  id: string;
  group_id: string;
  user_id?: string;
  action: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
};
```

### Configuration Types
```typescript
type GroupConfig = {
  entityName: string; // 'Organization', 'Team', 'Workspace' - used in UI and API responses
  entityNamePlural: string; // 'Organizations', 'Teams', 'Workspaces'
  defaultGroupType?: string; // Optional: default value for group_type column
  supportedGroupTypes?: string[]; // Optional: allowed group types for multi-tenant apps
  defaultRoles: string[];
  rolePermissions: Record<string, string[]>; // role -> permissions array
  limits: {
    maxGroupsPerUser: number;
    maxMembersPerGroup: number;
    maxInvitationsPerGroup: number;
    invitationExpiryDays: number;
  };
  features: {
    invitations: boolean;
    auditLog: boolean;
    customRoles: boolean;
    softDeletes: boolean;
    multiTenant: boolean; // Enable group_type support
  };
};
```

### API DTOs (Dynamic based on config)
```typescript
// Schemas generated from config
const createGroupSchema = (config: GroupConfig) => z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).optional(),
  group_type: z.string().default(config.entityName.toLowerCase()),
});

const inviteMemberSchema = (config: GroupConfig) => z.object({
  email: z.string().email(),
  role: z.enum(config.defaultRoles as [string, ...string[]]),
});

const updateMemberRoleSchema = (config: GroupConfig) => z.object({
  role: z.enum(config.defaultRoles as [string, ...string[]]),
});
```

### Response Types
```typescript
type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
};

type GroupWithMembers = Group & {
  members: (GroupMember & { user: { email: string; name?: string } })[];
  invitations: GroupInvitation[];
};

type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
};
```

### Response Types
```typescript
type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
};

type OrganizationWithMembers = Organization & {
  members: (OrganizationMember & { user: { email: string; name?: string } })[];
  invitations: OrganizationInvitation[];
};

type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
};
```

## Service Layer Architecture

### Generic Group Service Architecture

#### Core Services (Configurable)
```typescript
interface GroupService {
  create(userId: string, data: CreateGroupRequest, config: GroupConfig): Promise<Group>;
  getUserGroups(userId: string, options: PaginationOptions, config: GroupConfig): Promise<PaginatedResponse<Group>>;
  getGroupById(id: string, userId: string, config: GroupConfig): Promise<GroupWithMembers>;
  update(id: string, userId: string, data: UpdateGroupRequest, config: GroupConfig): Promise<Group>;
  delete(id: string, userId: string, config: GroupConfig): Promise<void>;
  transferOwnership(groupId: string, currentOwnerId: string, newOwnerId: string, config: GroupConfig): Promise<void>;
}

interface MemberService {
  getGroupMembers(groupId: string, userId: string, config: GroupConfig): Promise<GroupMember[]>;
  addMember(groupId: string, userId: string, email: string, role: string, config: GroupConfig): Promise<Invitation>;
  updateMemberRole(groupId: string, memberId: string, newRole: string, userId: string, config: GroupConfig): Promise<GroupMember>;
  removeMember(groupId: string, memberId: string, userId: string, config: GroupConfig): Promise<void>;
  canPerformAction(userId: string, groupId: string, action: string, config: GroupConfig): Promise<boolean>;
}

interface InvitationService {
  createInvitation(groupId: string, email: string, role: string, invitedBy: string, config: GroupConfig): Promise<Invitation>;
  getPendingInvitations(groupId: string, userId: string, config: GroupConfig): Promise<Invitation[]>;
  acceptInvitation(token: string, userId: string, config: GroupConfig): Promise<void>;
  rejectInvitation(token: string, userId: string, config: GroupConfig): Promise<void>;
  resendInvitation(invitationId: string, userId: string, config: GroupConfig): Promise<void>;
}
```

#### Plugin Architecture
```typescript
interface GroupPlugin {
  name: string;
  version: string;

  // Lifecycle hooks
  onGroupCreated?: (group: Group, config: GroupConfig) => Promise<void>;
  onMemberAdded?: (member: GroupMember, config: GroupConfig) => Promise<void>;
  onInvitationSent?: (invitation: Invitation, config: GroupConfig) => Promise<void>;

  // Custom validation
  validateGroupCreation?: (data: CreateGroupRequest, config: GroupConfig) => Promise<ValidationResult>;
  validateInvitation?: (invitation: CreateInvitationRequest, config: GroupConfig) => Promise<ValidationResult>;

  // Custom business logic
  getCustomPermissions?: (role: string, config: GroupConfig) => string[];
  getCustomEmailTemplate?: (type: string, data: any, config: GroupConfig) => string;
}

// Plugin registry
export const groupPlugins: GroupPlugin[] = [];

// Register custom plugins
export const registerGroupPlugin = (plugin: GroupPlugin) => {
  groupPlugins.push(plugin);
};
```

**Error Handling**: Standardized error system with specific error codes and user-friendly messages.

**Error Codes:**
```typescript
enum ErrorCode {
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_SLUG = 'INVALID_SLUG',
  DUPLICATE_SLUG = 'DUPLICATE_SLUG',

  // Permission errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Resource errors
  GROUP_NOT_FOUND = 'GROUP_NOT_FOUND',
  MEMBER_NOT_FOUND = 'MEMBER_NOT_FOUND',
  INVITATION_NOT_FOUND = 'INVITATION_NOT_FOUND',

  // Business logic errors
  LIMIT_EXCEEDED = 'LIMIT_EXCEEDED',
  CANNOT_LEAVE_GROUP = 'CANNOT_LEAVE_GROUP',
  INVITATION_EXPIRED = 'INVITATION_EXPIRED',

  // System errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  EMAIL_SEND_FAILED = 'EMAIL_SEND_FAILED',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}
```

**Error Response Format:**
```json
{
  "success": false,
  "error": {
    "code": "LIMIT_EXCEEDED",
    "message": "You have reached the maximum number of groups (10)",
    "details": { "currentCount": 10, "limit": 10 },
    "requestId": "req_abc123"
  }
}
```

Plugins can add custom error handling and error codes.

**Email Integration**: Configurable email service supporting multiple providers (Resend, SendGrid, AWS SES) with customizable HTML templates and branding.

**Email Configuration:**
```typescript
// config/email.ts
export const emailConfig = {
  provider: 'resend', // 'resend' | 'sendgrid' | 'aws-ses'
  templates: {
    invitation: {
      subject: 'You\'ve been invited to join {{groupName}}',
      html: '<h1>Join {{groupName}}</h1><p>{{inviterName}} invited you...</p>',
      text: 'Join {{groupName}} - {{inviterName}} invited you...',
    },
    welcome: {
      subject: 'Welcome to {{groupName}}!',
      // ... templates
    },
  },
  from: {
    email: 'noreply@yourapp.com',
    name: 'Your App',
  },
};
```

**Email Service Interface:**
```typescript
interface EmailService {
  sendInvitation(invitation: Invitation, group: Group): Promise<void>;
  sendWelcome(member: GroupMember, group: Group): Promise<void>;
  // ... other email types
}
```

**Example Generic Service Implementation:**
```typescript
// config/groups.ts
export const groupConfig: GroupConfig = {
  entityName: 'Organization', // Display name in UI
  entityNamePlural: 'Organizations',
  defaultGroupType: 'organization', // Optional: for group_type column
  supportedGroupTypes: ['organization', 'team'], // Optional: for validation
  defaultRoles: ['owner', 'admin', 'member'],
  rolePermissions: {
    owner: ['*'],
    admin: ['manage_members', 'manage_settings', 'view_content'],
    member: ['view_content', 'edit_own_content'],
  },
  limits: {
    maxGroupsPerUser: 10,
    maxMembersPerGroup: 100,
    maxInvitationsPerGroup: 20,
    invitationExpiryDays: 7,
  },
  features: {
    invitations: true,
    auditLog: true,
    customRoles: false,
    softDeletes: true,
    multiTenant: false, // Set to true to enable group_type support
  },
};

// services/groups.service.ts
export class GenericGroupService implements GroupService {
  constructor(private config: GroupConfig) {}

  async create(userId: string, data: CreateGroupRequest): Promise<Group> {
    const supabase = await createClient();

    // Check user limits
    const { count } = await supabase
      .from('groups')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId)
      .eq('is_deleted', false);

    if (count >= this.config.limits.maxGroupsPerUser) {
      throw new AppError('LIMIT_EXCEEDED', `Maximum ${this.config.limits.maxGroupsPerUser} ${this.config.entityNamePlural.toLowerCase()} per user`);
    }

    // Generate unique slug
    const slug = await this.generateUniqueSlug(data.name);

    const { data: group, error } = await supabase
      .from('groups')
      .insert({
        name: data.name,
        slug,
        description: data.description,
        group_type: this.config.entityName.toLowerCase(),
        owner_id: userId,
      })
      .select()
      .single();

    if (error) throw new AppError('DATABASE_ERROR', `Failed to create ${this.config.entityName.toLowerCase()}`);

    // Add owner as member
    await supabase.from('group_members').insert({
      group_id: group.id,
      user_id: userId,
      role: 'owner',
      permissions: this.getRolePermissions('owner'),
    });

    // Execute plugins
    for (const plugin of groupPlugins) {
      await plugin.onGroupCreated?.(group, this.config);
    }

    return group;
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const { data: existing } = await supabase
        .from('groups')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!existing) break;
      slug = `${baseSlug}-${counter++}`;
    }

    return slug;
  }

  private getRolePermissions(role: string): Record<string, boolean> {
    const permissions = this.config.rolePermissions[role] || [];
    return permissions.reduce((acc, perm) => ({ ...acc, [perm]: true }), {});
  }
}

// Usage
export const groupService = new GenericGroupService(groupConfig);
```

## RTK Query Architecture

### Generic API Slices
```typescript
// Dynamic API slice generation based on config
const createGroupApi = (config: GroupConfig) => ({
  // Groups endpoints
  getGroups: builder.query<PaginatedResponse<Group>, GetGroupsParams>({
    query: (params) => `/groups?${new URLSearchParams(params)}`,
    providesTags: ['Group'],
  }),

  createGroup: builder.mutation<Group, CreateGroupRequest>({
    query: (body) => ({ url: '/groups', method: 'POST', body }),
    invalidatesTags: ['Group'],
  }),

  getGroup: builder.query<GroupWithMembers, string>({
    query: (id) => `/groups/${id}`,
    providesTags: (result, error, id) => [{ type: 'Group', id }],
  }),

  updateGroup: builder.mutation<Group, UpdateGroupRequest>({
    query: ({ id, ...body }) => ({ url: `/groups/${id}`, method: 'PUT', body }),
    invalidatesTags: (result, error, { id }) => [{ type: 'Group', id }],
  }),

  deleteGroup: builder.mutation<void, string>({
    query: (id) => ({ url: `/groups/${id}`, method: 'DELETE' }),
    invalidatesTags: ['Group'],
  }),

  // Members endpoints
  getMembers: builder.query<GroupMember[], string>({
    query: (groupId) => `/groups/${groupId}/members`,
    providesTags: ['Member'],
  }),

  inviteMember: builder.mutation<Invitation, InviteMemberRequest>({
    query: ({ groupId, ...body }) => ({
      url: `/groups/${groupId}/members`,
      method: 'POST',
      body
    }),
    invalidatesTags: ['Member', 'Invitation'],
  }),

  updateMember: builder.mutation<GroupMember, UpdateMemberRequest>({
    query: ({ groupId, userId, ...body }) => ({
      url: `/groups/${groupId}/members/${userId}`,
      method: 'PUT',
      body
    }),
    invalidatesTags: ['Member'],
  }),

  removeMember: builder.mutation<void, { groupId: string; userId: string }>({
    query: ({ groupId, userId }) => ({
      url: `/groups/${groupId}/members/${userId}`,
      method: 'DELETE'
    }),
    invalidatesTags: ['Member'],
  }),

  // Invitations endpoints
  getInvitations: builder.query<Invitation[], string>({
    query: (groupId) => `/groups/${groupId}/invitations`,
    providesTags: ['Invitation'],
  }),

  acceptInvitation: builder.mutation<void, string>({
    query: (token) => ({ url: `/invitations/${token}/accept`, method: 'POST' }),
    invalidatesTags: ['Group', 'Member', 'Invitation'],
  }),

  rejectInvitation: builder.mutation<void, string>({
    query: (token) => ({ url: `/invitations/${token}/reject`, method: 'POST' }),
    invalidatesTags: ['Invitation'],
  }),
});

export const groupApi = createGroupApi(defaultConfig);
```

### Cache Tags & Invalidation
- `Group`, `Member`, `Invitation`
- **Dynamic Tags**: Support for custom entity types based on configuration
- **Invalidation Strategy**: Configurable invalidation rules that can be extended by plugins

## Implementation Roadmap

### Phase 1: Configuration & Core Schema
- Define configuration system for entity names, roles, limits
- Create generic database tables with indexes and RLS policies
- Implement configuration-driven schema generation
- Set up plugin architecture foundation

### Phase 2: Generic Services & Business Logic
- Implement configurable group CRUD services
- Role and permission management system
- Member management with dynamic permissions
- Audit logging with configurable actions
- Plugin system for custom business logic

### Phase 3: Invitations & Communication
- Configurable invitation system with secure tokens
- Email integration with template system
- Acceptance/rejection workflow
- Background cleanup for expired invitations
- Custom email providers support

### Phase 4: API Layer & Middleware
- Dynamic API route generation based on config
- Role-based access control middleware
- Group context management in sessions
- Configurable validation schemas
- Pagination and search implementation

### Phase 5: Frontend Integration
- **Group Context**: Redux slice for current group selection and permissions
- **UI Components**: GroupSwitcher, MemberList, InvitationManager, RoleSelector
- **Protected Routes**: Middleware to ensure group access and role permissions
- **Role-Based UI**: Conditional rendering based on user roles and permissions
- **Real-time Updates**: Supabase realtime for member status, invitation responses
- **Theme Customization**: Configurable UI themes and branding
- **Internationalization**: Multi-language support with react-i18next
- **Plugin-based UI**: Extensible component system

### Real-time Features
- **Live Member Updates**: Real-time member joins/leaves via Supabase realtime
- **Invitation Status**: Live invitation acceptance/rejection notifications
- **Group Activity**: Real-time activity feeds and notifications
- **Presence Indicators**: Show online/offline status of group members

### File Management & Uploads
- **Avatar Uploads**: Group and member profile pictures via Supabase Storage
- **File Storage**: Secure file attachments with access control
- **Image Optimization**: Automatic resizing and format optimization
- **Storage Policies**: RLS policies for file access based on group membership

### Phase 6: Advanced Features & Search
- **Advanced Search**: Full-text search across groups, members, and content
- **Bulk Operations**: Bulk member management, bulk invitations
- **Analytics Dashboard**: Group usage statistics and insights
- **Export/Import**: Data export and migration tools
- **API Webhooks**: Configurable webhooks for group events
- **Custom Fields**: Extensible group metadata and custom properties

### Phase 7: Testing & Documentation
- **Comprehensive Test Suite**: Unit, integration, E2E, and load tests
- **Configuration Validation**: Automated config file validation
- **Plugin Compatibility**: Testing framework for custom plugins
- **API Documentation**: Auto-generated OpenAPI specs with Swagger UI
- **Starter Template Guide**: Complete setup and customization documentation

### Phase 8: Production Deployment & Operations
- **Multi-tenant Support**: Single deployment serving multiple applications
- **Horizontal Scaling**: Stateless design for easy scaling
- **CDN Integration**: Global asset delivery and API edge caching
- **Backup & Recovery**: Automated database backups and recovery procedures
- **Disaster Recovery**: Cross-region failover capabilities
- **Cost Monitoring**: Usage analytics and cost optimization
- **Advanced Plugin Ecosystem**: Marketplace for community plugins

## Key Takeaways

### Generic Starter Benefits
- **Rapid Development**: Pre-built authentication, groups, and permissions
- **Configurable**: Adapt to any group-based application through configuration
- **Production-Ready**: Comprehensive security, monitoring, and scalability
- **Extensible**: Plugin system for custom business logic and UI

### Configuration-Driven Architecture
- Entity names, roles, and limits defined in config files
- Dynamic API generation based on configuration
- Themeable UI components with consistent design system
- Multi-provider support (email, storage, etc.)

### Scalability & Performance
- Efficient database design with proper indexing
- Caching strategies for optimal performance
- Background job processing for heavy operations
- Real-time features with Supabase realtime

### Security & Compliance
- Comprehensive audit logging and monitoring
- GDPR-compliant data handling and retention
- Configurable rate limiting and abuse prevention
- Secure token generation and validation

### Developer Experience
- Type-safe APIs with auto-generated types
- Comprehensive testing and documentation
- Plugin architecture for easy customization
- Clear migration and deployment strategies

This implementation provides a solid foundation for building group-based applications while remaining flexible enough to adapt to various use cases through configuration and plugins.

## Performance & Optimization

### Database Optimization
- **Query Performance**: All frequently accessed queries use appropriate indexes
- **Connection Pooling**: Supabase handles connection pooling automatically
- **Read Replicas**: Consider Supabase read replicas for high-traffic apps
- **Query Optimization**: Use `EXPLAIN ANALYZE` for complex queries

### Caching Strategy
- **RTK Query**: Client-side caching with intelligent invalidation
- **Server-side Caching**: Redis for frequently accessed data (group member lists, permissions)
- **Edge Caching**: Supabase Edge Functions for geographic distribution

### Background Jobs
- **Email Delivery**: Asynchronous email sending via job queues
- **Cleanup Tasks**: Periodic cleanup of expired invitations and old audit logs
- **Analytics**: Background processing of usage metrics

### Scalability Considerations
- **Horizontal Scaling**: Stateless API design allows horizontal scaling
- **Database Sharding**: Plan for user-based sharding if needed
- **CDN Integration**: Static assets and file uploads via CDN
- **Rate Limiting**: Implement Redis-based rate limiting if needed

### Monitoring & Metrics
- **Application Metrics**:
  - Group creation rate
  - Invitation acceptance rate
  - API response times
  - Error rates by endpoint
- **Database Metrics**:
  - Query performance
  - Connection usage
  - Table sizes
- **Business Metrics**:
  - Active groups
  - User engagement
  - Feature usage

### Cost Optimization
- **Supabase Usage**: Monitor database size, bandwidth, and function invocations
- **Email Costs**: Batch emails and optimize sending patterns
- **Storage**: Implement file cleanup and compression
- **Caching**: Reduce database load through effective caching

## Migration Strategy

### migrations/
- `20251103_100000_create_groups_generic.sql`

This migration creates generic group tables that can be configured for different entity types (organizations, teams, workspaces). Includes all constraints, indexes, RLS policies, and rollback scripts.

**Migration Contents:**
```sql
-- Create groups table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  group_type TEXT DEFAULT 'default',
  settings JSONB DEFAULT '{}',
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_groups_owner_id ON groups(owner_id);
CREATE INDEX idx_groups_slug ON groups(slug);
CREATE INDEX idx_groups_type ON groups(group_type);
CREATE INDEX idx_groups_is_deleted ON groups(is_deleted);

-- Create group_members table
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  permissions JSONB DEFAULT '{}',
  joined_at TIMESTAMP DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create indexes
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_group_members_role ON group_members(role);

-- Create group_invitations table
CREATE TABLE group_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  token TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  expires_at TIMESTAMP NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP DEFAULT now(),
  accepted_at TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_group_invitations_group_id ON group_invitations(group_id);
CREATE INDEX idx_group_invitations_email ON group_invitations(email);
CREATE INDEX idx_group_invitations_status ON group_invitations(status);
CREATE INDEX idx_group_invitations_expires_at ON group_invitations(expires_at);

-- Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies (examples - actual policies will be more comprehensive)
CREATE POLICY groups_select ON groups FOR SELECT USING (
  owner_id = auth.uid() OR
  EXISTS (SELECT 1 FROM group_members WHERE group_id = groups.id AND user_id = auth.uid())
);

-- Additional policies for INSERT, UPDATE, DELETE...
```

### Configuration Files
- `config/groups.ts`: Main configuration file for entity types, roles, limits
- `config/email.ts`: Email service configuration and customizable templates
- `config/security.ts`: Security settings, token configuration, audit settings
- `plugins/`: Directory for custom plugins and extensions
- `types/generated.ts`: Auto-generated types based on configuration

### Data Migration Strategy
- **Existing Apps**: Provide migration scripts to convert existing org/team tables to generic groups schema
- **Zero-downtime**: Support for gradual migration with feature flags
- **Rollback**: Complete rollback scripts for each migration

## Environment & Security

### Required Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for server-side operations)
- `EMAIL_SERVICE_API_KEY` (configurable: Resend, SendGrid, etc.)
- `NEXT_PUBLIC_APP_URL` (for invitation links)

### Configuration Files
- `config/groups.ts`: Entity configuration (names, roles, limits)
- `config/security.ts`: Security settings (token expiry, audit levels)
- `config/email.ts`: Email service configuration and templates

### Security Considerations
- **Authentication**: Supabase session validation on all endpoints
- **Authorization**: Configurable RLS policies + role-based permission checks
- **Token Security**: SHA-256 hashed invitation tokens with configurable expiry
- **Audit Logging**: Configurable audit trail with IP/user agent tracking
- **Data Retention**: Configurable retention policies for invitations and logs
- **Input Validation**: Dynamic Zod schemas based on configuration
- **Error Handling**: Sanitized error messages, no sensitive data leakage
- **CORS Configuration**: Properly configured CORS for web clients
- **Rate Limiting**: Configurable rate limits per endpoint/user
- **Input Sanitization**: All user inputs sanitized to prevent XSS
- **CSRF Protection**: Built-in CSRF protection for state-changing operations

### Compliance & Data Protection
- **GDPR Compliance**: Data portability, right to erasure, consent management
- **Data Retention Policies**:
  - Invitations: 30 days after expiry
  - Audit logs: 1 year
  - Deleted groups: 90 days before permanent deletion
- **Data Export**: User data export functionality
- **Privacy Controls**: Granular privacy settings for groups and members
- **Consent Management**: Email communication preferences

### Monitoring & Observability
- **Application Metrics**: Configurable metrics (creation rates, acceptance rates)
- **Error Tracking**: Sentry integration with configurable error levels
- **Performance Monitoring**: Custom middleware for query performance tracking
- **Logging**: Structured logging with configurable log levels and outputs

### Testing Strategy
- **Unit Tests**: Service functions, utilities, validation schemas, plugins
- **Integration Tests**: API endpoints with test database and configurations
- **E2E Tests**: User journeys with different configurations
- **Plugin Tests**: Compatibility testing for custom plugins
- **Configuration Tests**: Validation of config files and generated types
- **Load Tests**: Performance testing under various loads

### API Documentation & Versioning
- **OpenAPI Specification**: Auto-generated API docs from route definitions
- **API Versioning**: URL-based versioning (e.g., `/api/v1/groups`)
- **Interactive Docs**: Swagger UI for testing endpoints
- **SDK Generation**: TypeScript SDK generation for frontend consumption

### Deployment & DevOps
- **Environment Configuration**: Separate configs for dev/staging/production
- **CI/CD Pipeline**: Automated testing, building, and deployment
- **Database Migrations**: Safe migration deployment with rollback capabilities
- **Health Checks**: `/api/health` endpoint for load balancer monitoring
- **Feature Flags**: LaunchDarkly or similar for gradual feature rollout