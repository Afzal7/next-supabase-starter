// Re-export all RTK Query hooks for easy importing
export {
  useGetGroupsQuery,
  useCreateGroupMutation,
  useGetGroupQuery,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
  useGetMembersQuery,
  useInviteMemberMutation,
  useUpdateMemberMutation,
  useRemoveMemberMutation,
  useGetInvitationsQuery,
  useAcceptInvitationMutation,
  useRejectInvitationMutation,
} from './api';

// Re-export store and types
export { store } from './store';
export type { RootState, AppDispatch } from './store';

// Re-export provider
export { ReduxProvider } from './provider';