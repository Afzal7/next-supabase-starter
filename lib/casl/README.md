# CASL RBAC Setup

This project uses CASL (pronounced "castle") for Role-Based Access Control (RBAC) with different user roles.

## Overview

CASL provides a powerful way to define and check permissions based on user roles and context.

## Roles & Permissions

Based on the existing group system:

- **Owner**: Full access (`*`)
- **Admin**: Manage members, settings, view content, invite members, manage invitations
- **Member**: View content, edit own content

## Setup

### 1. Install Dependencies

```bash
npm install @casl/ability @casl/react
```

### 2. Define Abilities

Abilities are defined in `lib/casl/abilities.ts` with subjects (Group, Member, Invitation) and actions.

### 3. Create Ability Instance

```typescript
import { createAbilityFor } from '@/lib/casl';

const ability = createAbilityFor({
  userId: 'user-123',
  userRole: 'admin',
  groupId: 'group-456',
  isGroupOwner: false,
});
```

### 4. Wrap App with Provider

```tsx
import { AbilityProvider } from '@/lib/casl';

function App() {
  return (
    <AbilityProvider ability={ability}>
      {/* Your app */}
    </AbilityProvider>
  );
}
```

## Usage in Components

### Using Hooks

```tsx
import { usePermissions, useCan } from '@/lib/casl';

function MyComponent() {
  const { canManageMembers, canInviteMembers } = usePermissions();
  const { can } = useCan();

  return (
    <div>
      {canManageMembers() && <button>Manage Members</button>}
      {can('invite', 'Member') && <button>Invite User</button>}
    </div>
  );
}
```

### Using Can Component

```tsx
import { Can } from '@/lib/casl';

function MyComponent() {
  return (
    <div>
      <Can I="manage_members" a="Group">
        <button>Manage Members</button>
      </Can>

      <Can I="invite" a="Member" fallback={<div>Access denied</div>}>
        <button>Invite User</button>
      </Can>
    </div>
  );
}
```

## Usage in Services

CASL is designed for component-level permission checking. Services continue to use the existing permission system based on user ownership and database-level checks.



## Files

- `lib/casl/abilities.ts` - Ability definitions and factory functions
- `lib/casl/hooks.ts` - React hooks for permission checking
- `lib/casl/components.tsx` - React components for conditional rendering
- `lib/casl/utils.ts` - Utility functions for permission checks
- `lib/casl/context.ts` - React context for ability state

## Migration

The setup maintains backward compatibility. Existing permission checks still work while new CASL-based checks can be gradually adopted.