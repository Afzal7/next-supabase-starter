'use client';

import React, { useState } from 'react';
import {
  useGetGroupsQuery,
  useCreateGroupMutation,
  useGetGroupQuery,
  useInviteMemberMutation,
  useAcceptInvitationMutation,
} from '@/lib/rtk';

export function GroupsExample() {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Fetch user's groups
  const {
    data: groups,
    isLoading: groupsLoading,
    error: groupsError,
    refetch: refetchGroups
  } = useGetGroupsQuery({ page: 1, limit: 10 });

  // Create group mutation
  const [createGroup, { isLoading: creatingGroup }] = useCreateGroupMutation();

  // Get specific group details
  const {
    data: selectedGroup,
    isLoading: groupLoading
  } = useGetGroupQuery(selectedGroupId!, {
    skip: !selectedGroupId, // Don't fetch if no group selected
  });

  // Invite member mutation
  const [inviteMember, { isLoading: inviting }] = useInviteMemberMutation();

  // Accept invitation mutation
  const [acceptInvitation, { isLoading: accepting }] = useAcceptInvitationMutation();

  const handleCreateGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await createGroup({
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        slug: formData.get('slug') as string,
      }).unwrap();

      // Group will be automatically added to cache
      refetchGroups(); // Or rely on cache invalidation
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const handleInviteMember = async (groupId: string, email: string, role: string) => {
    try {
      await inviteMember({
        groupId,
        body: { email, role },
      }).unwrap();

      console.log('Invitation sent!');
    } catch (error) {
      console.error('Failed to invite member:', error);
    }
  };

  const handleAcceptInvitation = async (token: string) => {
    try {
      await acceptInvitation(token).unwrap();
      console.log('Invitation accepted!');
      refetchGroups(); // Refresh groups list
    } catch (error) {
      console.error('Failed to accept invitation:', error);
    }
  };

  if (groupsLoading) return <div>Loading groups...</div>;
  if (groupsError) return <div>Error loading groups</div>;

  return (
    <div>
      <h1>My Groups</h1>

      {/* Create Group Form */}
      <form onSubmit={handleCreateGroup}>
        <input name="name" placeholder="Group name" required />
        <input name="slug" placeholder="group-slug" />
        <textarea name="description" placeholder="Description" />
        <button type="submit" disabled={creatingGroup}>
          {creatingGroup ? 'Creating...' : 'Create Group'}
        </button>
      </form>

      {/* Groups List */}
      <div>
        {groups?.data.map(group => (
          <div key={group.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
            <h3>{group.name}</h3>
            <p>{group.description}</p>
            {/* Role would be available in the API response */}
            <button onClick={() => setSelectedGroupId(group.id)}>
              View Details
            </button>
            <button
              onClick={() => handleInviteMember(
                group.id,
                'user@example.com',
                'member'
              )}
              disabled={inviting}
            >
              Invite Member
            </button>
          </div>
        ))}
      </div>

      {/* Selected Group Details */}
      {selectedGroupId && (
        <div>
          <h2>Group Details</h2>
          {groupLoading ? (
            <div>Loading group details...</div>
          ) : selectedGroup ? (
            <div>
              <h3>{selectedGroup.name}</h3>
              <p>{selectedGroup.description}</p>

              <h4>Members ({selectedGroup.members.length})</h4>
              {selectedGroup.members.map(member => (
                <div key={member.id}>
                  {member.user.email} - {member.role}
                </div>
              ))}

              <h4>Pending Invitations ({selectedGroup.invitations.length})</h4>
              {selectedGroup.invitations.map(invitation => (
                <div key={invitation.id}>
                  {invitation.email} - {invitation.role} - {invitation.status}
                  {invitation.status === 'pending' && (
                    <button
                      onClick={() => handleAcceptInvitation(invitation.token)}
                      disabled={accepting}
                    >
                      Accept
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div>Group not found</div>
          )}
        </div>
      )}
    </div>
  );
}