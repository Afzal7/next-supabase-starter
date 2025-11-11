# BACKEND_HANDOFF.md

## Overview

The backend implementation for the generic group management system is now complete. This system provides a configurable foundation for building group-based applications (organizations, teams, workspaces, etc.) with email invitations, role-based permissions, and comprehensive API endpoints.

## Environment Setup

### Required Environment Variables

Add these to your `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email (configure based on provider)
RESEND_API_KEY=your_resend_api_key
# OR
SENDGRID_API_KEY=your_sendgrid_api_key
# OR AWS SES credentials

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

Run the migration to create the required tables:

```bash
supabase db push
# OR if using local Supabase
supabase migration up
```

The migration creates:
- `groups` table (generic entity)
- `group_members` table (junction)
- `group_invitations` table
- `group_audit_log` table
- Row Level Security policies

**Important**: The schema avoids foreign key constraints to `auth.users` to prevent RLS policy issues. User IDs are validated at the application level using `auth.uid()`.

## Configuration

### Group Configuration (`config/groups.ts`)

The system is configured via `config/groups.ts`. Modify this file to customize:

```typescript
export const groupConfig: GroupConfig = {
  entityName: 'Organization', // Display name
  entityNamePlural: 'Organizations',
  defaultRoles: ['owner', 'admin', 'member'],
  rolePermissions: {
    owner: ['*'], // All permissions
    admin: ['manage_members', 'manage_settings'],
    member: ['view_content'],
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
  },
};
```

### Email Configuration (`config/email.ts`)

Customize email templates and provider:

```typescript
export const emailConfig: EmailConfig = {
  provider: 'resend', // 'resend' | 'sendgrid' | 'aws-ses'
  templates: {
    invitation: { /* customize HTML/text */ },
    welcome: { /* customize HTML/text */ },
  },
  from: {
    email: 'noreply@yourapp.com',
    name: 'Your App',
  },
};
```

## Redux Toolkit RTK Query Setup

### Store Configuration

✅ **Already Set Up**: The Redux provider is configured in your root layout (`app/layout.tsx`).

The setup includes:
- `ReduxProvider` wrapping your entire app
- **Cookie-based authentication** (middleware handles auth)
- **Automatic session management** via cookies
- Intelligent caching and invalidation

If you need to modify the setup, it's already imported and configured in your layout.

### Available RTK Query Hooks

**Important**: Components using RTK Query hooks must be Client Components. Add `'use client';` at the top of any component using these hooks.

All hooks are available from `@/lib/rtk`:

```tsx
'use client'; // Required for components using RTK Query hooks

import {
  // Groups
  useGetGroupsQuery,
  useCreateGroupMutation,
  useGetGroupQuery,
  useUpdateGroupMutation,
  useDeleteGroupMutation,

  // Members
  useGetMembersQuery,
  useInviteMemberMutation,
  useUpdateMemberMutation,
  useRemoveMemberMutation,

  // Invitations
  useGetInvitationsQuery,
  useAcceptInvitationMutation,
  useRejectInvitationMutation,
} from '@/lib/rtk';
```

### Complete Example Component

See `docs/backend/example-component.tsx` for a complete working example showing:
- Fetching groups with pagination
- Creating new groups
- Viewing group details with members and invitations
- Inviting members
- Accepting invitations
- Error handling and loading states

This example demonstrates the full integration pattern you should follow in your components.

### Test Component

A simple test component is available at `components/rtk-test.tsx` to verify your RTK Query setup is working correctly.

**To test the setup:**
1. Create a new page (e.g., `app/test/page.tsx`):
```tsx
'use client';

import { RTKTestComponent } from '@/components/rtk-test';

export default function TestPage() {
  return (
    <div className="p-8">
      <h1>RTK Query Test</h1>
      <RTKTestComponent />
    </div>
  );
}
```

2. Navigate to `/test` to see if the hooks work correctly.

**Note**: This will only work if you have:
- Set up your Supabase environment variables
- Run the database migrations
- Are logged in (since the API requires authentication)

### Using RTK Query Hooks

#### Fetching Groups

```tsx
import { useGetGroupsQuery } from '@/lib/rtk/api';

function GroupsList() {
  const { data: groups, isLoading, error } = useGetGroupsQuery({
    page: 1,
    limit: 20,
    search: 'search term',
    type: 'organization'
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {groups?.data.map(group => (
        <div key={group.id}>
          <h3>{group.name}</h3>
          <p>{group.description}</p>
        </div>
      ))}
    </div>
  );
}
```

#### Creating a Group

```tsx
import { useCreateGroupMutation } from '@/lib/rtk/api';

function CreateGroupForm() {
  const [createGroup, { isLoading }] = useCreateGroupMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const result = await createGroup({
        name: formData.get('name'),
        description: formData.get('description'),
        slug: formData.get('slug'),
      }).unwrap();

      console.log('Group created:', result);
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="slug" />
      <textarea name="description" />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Group'}
      </button>
    </form>
  );
}
```

#### Inviting Members

```tsx
import { useInviteMemberMutation } from '@/lib/rtk/api';

function InviteMemberForm({ groupId }) {
  const [inviteMember, { isLoading }] = useInviteMemberMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      await inviteMember({
        groupId,
        body: {
          email: formData.get('email'),
          role: formData.get('role'),
        },
      }).unwrap();

      console.log('Invitation sent!');
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <select name="role" required>
        <option value="member">Member</option>
        <option value="admin">Admin</option>
      </select>
      <button type="submit" disabled={isLoading}>
        Send Invitation
      </button>
    </form>
  );
}
```

#### Cancelling Invitations

```tsx
import { useCancelInvitationMutation } from '@/lib/rtk/api';

function CancelInvitationButton({ groupId, invitationId }) {
  const [cancelInvitation, { isLoading }] = useCancelInvitationMutation();

  const handleCancel = async () => {
    if (confirm('Cancel this invitation?')) {
      try {
        await cancelInvitation({ groupId, invitationId }).unwrap();
        console.log('Invitation cancelled!');
      } catch (error) {
        console.error('Failed:', error);
      }
    }
  };

  return (
    <button onClick={handleCancel} disabled={isLoading}>
      {isLoading ? 'Cancelling...' : 'Cancel Invitation'}
    </button>
  );
}
```

#### Accepting/Rejecting Invitations

```tsx
import { useAcceptInvitationMutation, useRejectInvitationMutation } from '@/lib/rtk/api';

function InvitationActions({ token }) {
  const [accept, { isLoading: accepting }] = useAcceptInvitationMutation();
  const [reject, { isLoading: rejecting }] = useRejectInvitationMutation();

  const handleAccept = async () => {
    try {
      await accept(token).unwrap();
      console.log('Invitation accepted!');
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  const handleReject = async () => {
    try {
      await reject(token).unwrap();
      console.log('Invitation rejected!');
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  return (
    <div>
      <button onClick={handleAccept} disabled={accepting}>
        Accept
      </button>
      <button onClick={handleReject} disabled={rejecting}>
        Reject
      </button>
    </div>
  );
}
```

## Security & Authentication

### Cookie-Based Authentication

The backend uses **cookie-based authentication** following Supabase SSR best practices:

- **HTTP-only cookies** store session tokens securely
- **Automatic session management** via root `middleware.ts`
- **Server-side session validation** on every API request
- **No manual token passing** required in API calls

### Avoiding auth.users Queries

The backend avoids direct queries to `auth.users` for performance and security reasons:

- **No foreign key constraints** to `auth.users` (prevents RLS issues)
- **JWT metadata** used for user information (`auth.jwt()`)
- **Stored user data** in relevant tables (e.g., `inviter_name` in invitations)
- **Application-level validation** using `auth.uid()`

### RLS Policies

All tables use Row Level Security with policies based on:
- `auth.uid()` for user identification
- Group membership checks
- Role-based permissions
- Owner/admin privilege checks

## API Endpoints

### Groups

- `GET /api/groups` - List user's groups (paginated)
- `POST /api/groups` - Create new group
- `GET /api/groups/[id]` - Get group details with members
- `PUT /api/groups/[id]` - Update group
- `DELETE /api/groups/[id]` - Delete group

### Members

- `GET /api/groups/[id]/members` - List group members
- `POST /api/groups/[id]/members` - Invite new member
- `PUT /api/groups/[id]/members/[userId]` - Update member role
- `DELETE /api/groups/[id]/members/[userId]` - Remove member

### Invitations

- `GET /api/groups/[id]/invitations` - List pending invitations
- `DELETE /api/groups/[id]/invitations/[invitationId]` - Cancel invitation
- `POST /api/invitations/[token]/accept` - Accept invitation
- `POST /api/invitations/[token]/reject` - Reject invitation

## Error Handling

All API errors follow this standardized format:

```typescript
interface ApiError {
  success: false;
  error: {
    code: string; // e.g., 'VALIDATION_ERROR', 'UNAUTHORIZED'
    message: string;
    statusCode: number;
    timestamp: string;
    details?: Record<string, string>;
  };
}
```

Handle errors in your components:

```tsx
const [createGroup, { error }] = useCreateGroupMutation();

if (error) {
  const apiError = error.data?.error;
  switch (apiError?.code) {
    case 'VALIDATION_ERROR':
      // Show validation errors
      break;
    case 'LIMIT_EXCEEDED':
      // Show limit exceeded message
      break;
    default:
      // Generic error
      break;
  }
}
```

## Authentication & Authorization

### Session Management

The backend uses **cookie-based sessions** managed by the root `middleware.ts`:

- **Automatic session refresh** on page loads
- **Secure HTTP-only cookies** for token storage
- **Server-side session validation** on every request
- **No manual token management** required

### API Authentication

API routes automatically authenticate users via cookies:

```typescript
// API routes use cookie-based auth
export async function GET(req: NextRequest) {
  const user = await authenticateRequest(req); // Reads from cookies
  // ... business logic
}
```

### Permission Checks

The system includes role-based permissions. Check permissions in your components:

```tsx
// In a component that needs admin access
const { data: group } = useGetGroupQuery(groupId);
const isAdmin = group?.members.find(m => m.user_id === currentUserId)?.role === 'admin';

if (!isAdmin) {
  return <div>Access denied</div>;
}
```

## File Structure

```
lib/
├── services/
│   ├── groupService.ts      # Group CRUD operations
│   ├── memberService.ts     # Member management
│   ├── invitationService.ts # Invitation handling
│   └── emailService.ts      # Email sending
├── schemas/
│   └── groupSchemas.ts      # Zod validation schemas
├── middleware/
│   ├── auth.middleware.ts         # Authentication
│   └── errorHandler.middleware.ts # Error handling
├── utils/
│   ├── validators.ts # Request validation
│   ├── responses.ts  # Response helpers
│   └── logger.ts     # Logging utility
├── rtk/
│   ├── store.ts # Redux store
│   └── api.ts   # RTK Query API slice
├── errors/
│   └── index.ts # Error handling utilities
└── config/
    ├── groups.ts  # Group configuration
    ├── email.ts   # Email configuration
    └── security.ts # Security settings

app/api/
├── groups/
│   ├── route.ts           # GET/POST groups
│   └── [id]/
│       ├── route.ts       # GET/PUT/DELETE group
│       ├── members/
│       │   ├── route.ts   # GET/POST members
│       │   └── [userId]/
│       │       └── route.ts # PUT/DELETE member
│       └── invitations/
│           ├── route.ts   # GET invitations
│           └── [invitationId]/
│               └── route.ts   # DELETE cancel invitation
└── invitations/
    └── [token]/
        ├── accept/
        │   └── route.ts   # POST accept
        └── reject/
            └── route.ts   # POST reject
```

## Next Steps

1. **Install Dependencies**: Add RTK Query to your project
   ```bash
   npm install @reduxjs/toolkit react-redux
   ```

2. **Configure Emails**: Set up your email provider API keys

3. **Customize Configuration**: Modify `config/groups.ts` and `config/email.ts` for your app

4. **Build UI Components**: Create React components using the RTK Query hooks

5. **Add Real-time Features**: Implement Supabase realtime for live updates

6. **Testing**: Add comprehensive tests for your specific use case

## Support

The backend is designed to be extensible. For custom business logic:

- Add methods to the service classes
- Extend the configuration objects
- Create plugin hooks for custom functionality
- Add new API endpoints following the existing patterns

All services are designed with dependency injection, making them testable and extensible.