'use client';

import React, { useState } from 'react';
import { useGetGroupQuery, useDeleteGroupMutation } from '@/lib/rtk';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  Settings,
  Edit,
  Trash2,
  Mail,
  Crown,
  Shield,
  User,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { groupConfig } from '@/config/groups';

interface GroupDetailProps {
  groupId: string;
  onEdit?: () => void;
  onInviteMember?: () => void;
  onManageMembers?: () => void;
  onBack?: () => void;
  className?: string;
}

export function GroupDetail({
  groupId,
  onEdit,
  onInviteMember,
  onManageMembers,
  onBack,
  className
}: GroupDetailProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    data: group,
    isLoading,
    error,
    refetch
  } = useGetGroupQuery(groupId);

  const [deleteGroup, { isLoading: deleting }] = useDeleteGroupMutation();

  const handleDeleteGroup = async () => {
    if (!group) return;

    try {
      await deleteGroup(group.id).unwrap();
      onBack?.();
    } catch (error) {
      console.error('Failed to delete group:', error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertDescription>
                {error ? 'Failed to load group details' : 'Group not found'}
              </AlertDescription>
            </Alert>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => refetch()} variant="outline">
                Try Again
              </Button>
              {onBack && (
                <Button onClick={onBack} variant="outline">
                  Go Back
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentUserRole = group.members.find(m => m.user_id === 'current-user-id')?.role || 'member';
  const isOwner = currentUserRole === 'owner';
  const isAdmin = isOwner || currentUserRole === 'admin';
  const canManageMembers = isAdmin;
  const canEditGroup = isOwner;
  const canDeleteGroup = isOwner;

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" onClick={onBack}>
              ← Back
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold">{group.name}</h1>
            <p className="text-muted-foreground">@{group.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary">{group.group_type}</Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canEditGroup && (
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit {groupConfig.entityName}
                </DropdownMenuItem>
              )}
              {canManageMembers && (
                <>
                  <DropdownMenuItem onClick={onInviteMember}>
                    <Mail className="h-4 w-4 mr-2" />
                    Invite Member
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onManageMembers}>
                    <Users className="h-4 w-4 mr-2" />
                    Manage Members
                  </DropdownMenuItem>
                </>
              )}
              {canDeleteGroup && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete {groupConfig.entityName}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Description */}
      {group.description && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <p className="text-muted-foreground">{group.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{group.members.length}</p>
                <p className="text-sm text-muted-foreground">Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{group.invitations.length}</p>
                <p className="text-sm text-muted-foreground">Pending Invites</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-2xl font-bold">
                  {new Date(group.created_at).getFullYear()}
                </p>
                <p className="text-sm text-muted-foreground">Created</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members Section */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Members ({group.members.length})
              </CardTitle>
              <CardDescription>
                People with access to this {groupConfig.entityName.toLowerCase()}
              </CardDescription>
            </div>
            {canManageMembers && (
              <Button onClick={onManageMembers} variant="outline">
                Manage Members
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {group.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    {member.user.name?.[0] || member.user.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">
                      {member.user.name || member.user.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {member.user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getRoleBadgeVariant(member.role)} className="gap-1">
                    {getRoleIcon(member.role)}
                    {member.role}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Joined {new Date(member.joined_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {group.invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Pending Invitations ({group.invitations.length})
            </CardTitle>
            <CardDescription>
              Invitations waiting to be accepted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {group.invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Invited {new Date(invitation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {invitation.role}
                    </Badge>
                    <Badge variant="secondary">
                      Expires {new Date(invitation.expires_at).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>Delete {groupConfig.entityName}?</strong>
                <p className="mt-1">
                  This action cannot be undone. All members will lose access and data may be permanently removed.
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteGroup}
                  disabled={deleting}
                >
                  {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Delete
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}