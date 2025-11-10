import { NextRequest } from "next/server";
import { invitationService } from "@/lib/services/invitationService";
import { createNotFoundError } from "@/lib/errors";
import { successResponse } from "@/lib/utils/responses";
import { GroupInvitation, Group } from "@/types";

type InvitationWithGroup = GroupInvitation & { groups: Group };

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    console.log("Fetching invitation details for token:", token);

    // Get invitation details with group information
    const invitation = (await invitationService.getInvitationByToken(
      token
    )) as InvitationWithGroup | null;

    if (!invitation) {
      throw createNotFoundError("Invitation");
    }

    return successResponse({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        created_at: invitation.created_at,
        expires_at: invitation.expires_at,
        group: {
          id: invitation.group_id,
          name: invitation.groups?.name,
          description: invitation.groups?.description,
          group_type: invitation.groups?.group_type,
          slug: invitation.groups?.slug,
        },
      },
    });
  } catch (error: any) {
    console.error(error);
    return (
      error.response || new Response("Internal Server Error", { status: 500 })
    );
  }
}
