import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  Group,
  GroupWithMembers,
  GroupInvitation,
  GroupMember,
  MemberWithUser,
  PaginatedResponse,
  CreateGroupRequest,
  UpdateGroupRequest,
  CreateInvitationRequest,
  UpdateMemberRequest,
  InvitationResponse,
} from "@/types";

// Base query using cookies (middleware handles authentication)
const baseQuery = fetchBaseQuery({
  baseUrl: "/api",
});

// Base query with cookie-based authentication
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  return await baseQuery(args, api, extraOptions);
};

// RTK Query API slice
export const groupApi = createApi({
  reducerPath: "groupApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Group", "Member", "Invitation"],
  endpoints: (builder) => ({
    // Groups endpoints
    getGroups: builder.query<
      PaginatedResponse<Group>,
      { page?: number; limit?: number; search?: string; type?: string }
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.set("page", params.page.toString());
        if (params.limit) searchParams.set("limit", params.limit.toString());
        if (params.search) searchParams.set("search", params.search);
        if (params.type) searchParams.set("type", params.type);
        return `/groups?${searchParams.toString()}`;
      },
      providesTags: ["Group"],
    }),

    createGroup: builder.mutation<Group, CreateGroupRequest>({
      query: (body) => ({
        url: "/groups",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Group"],
    }),

    getGroup: builder.query<GroupWithMembers, string>({
      query: (id) => `/groups/${id}`,
      providesTags: (result, error, id) => [{ type: "Group", id }],
    }),

    updateGroup: builder.mutation<
      Group,
      { id: string; body: UpdateGroupRequest }
    >({
      query: ({ id, body }) => ({
        url: `/groups/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Group", id }],
    }),

    deleteGroup: builder.mutation<void, string>({
      query: (id) => ({
        url: `/groups/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Group"],
    }),

    // Members endpoints
    getMembers: builder.query<
      PaginatedResponse<MemberWithUser>,
      { groupId: string; page?: number; limit?: number; search?: string }
    >({
      query: ({ groupId, ...params }) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.set("page", params.page.toString());
        if (params.limit) searchParams.set("limit", params.limit.toString());
        if (params.search) searchParams.set("search", params.search);
        return `/groups/${groupId}/members?${searchParams.toString()}`;
      },
      providesTags: ["Member"],
    }),

    inviteMember: builder.mutation<
      GroupInvitation,
      { groupId: string; body: CreateInvitationRequest }
    >({
      query: ({ groupId, body }) => ({
        url: `/groups/${groupId}/members`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Member", "Invitation"],
    }),

    updateMember: builder.mutation<
      GroupMember,
      { groupId: string; userId: string; body: UpdateMemberRequest }
    >({
      query: ({ groupId, userId, body }) => ({
        url: `/groups/${groupId}/members/${userId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Member"],
    }),

    removeMember: builder.mutation<void, { groupId: string; userId: string }>({
      query: ({ groupId, userId }) => ({
        url: `/groups/${groupId}/members/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Member"],
    }),

    // Invitations endpoints
    getInvitations: builder.query<GroupInvitation[], string>({
      query: (groupId) => `/groups/${groupId}/invitations`,
      providesTags: ["Invitation"],
    }),

    acceptInvitation: builder.mutation<{ groupId: string }, string>({
      query: (token) => ({
        url: `/invitations/${token}/accept`,
        method: "POST",
      }),
      invalidatesTags: ["Group", "Member", "Invitation"],
    }),

    rejectInvitation: builder.mutation<void, string>({
      query: (token) => ({
        url: `/invitations/${token}/reject`,
        method: "POST",
      }),
      invalidatesTags: ["Invitation"],
    }),

    resendInvitation: builder.mutation<void, string>({
      query: (invitationId) => ({
        url: `/invitations/${invitationId}/resend`,
        method: "POST",
      }),
      invalidatesTags: ["Invitation"],
    }),

    cancelInvitation: builder.mutation<void, { groupId: string; invitationId: string }>({
      query: ({ groupId, invitationId }) => ({
        url: `/groups/${groupId}/invitations/${invitationId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Invitation"],
    }),

    getInvitationByToken: builder.query<InvitationResponse, string>({
      query: (token) => `/invitations/${token}`,
    }),
  }),
});

// Export auto-generated hooks
export const {
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
  useResendInvitationMutation,
  useCancelInvitationMutation,
  useGetInvitationByTokenQuery,
} = groupApi;
