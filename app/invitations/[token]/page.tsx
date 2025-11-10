"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useAcceptInvitationMutation,
  useRejectInvitationMutation,
  useGetInvitationByTokenQuery,
} from "@/lib/rtk/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, Mail, Calendar } from "lucide-react";
import { motion } from "motion/react";
import { groupConfig } from "@/config/groups";

type InvitationData = {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  expires_at: string;
  group: {
    id: string;
    name: string;
    description?: string;
    group_type: string;
    slug: string;
  };
};

export default function InvitationPage() {
  const params = useParams();
  const token = params.token as string;
  const router = useRouter();

  const { data: invitationData, isLoading, error } = useGetInvitationByTokenQuery(token);

  const [acceptInvitation, { isLoading: accepting }] =
    useAcceptInvitationMutation();
  const [rejectInvitation, { isLoading: rejecting }] =
    useRejectInvitationMutation();
  const [status, setStatus] = useState<
    "pending" | "accepted" | "rejected" | "error"
  >("pending");
  const [message, setMessage] = useState<string>("");

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAccept = async () => {
    try {
      const result = await acceptInvitation(token).unwrap();
      setStatus("accepted");
      setMessage(
        "Invitation accepted successfully! Redirecting to the group..."
      );
      setTimeout(
        () => router.push(`/dashboard/groups/${result.groupId}`),
        2000
      );
    } catch (error: any) {
      setStatus("error");
      setMessage(
        error?.data?.error?.message ||
          "Failed to accept invitation. The invitation may be expired or invalid."
      );
    }
  };

  const handleReject = async () => {
    try {
      await rejectInvitation(token).unwrap();
      setStatus("rejected");
      setMessage("Invitation rejected successfully.");
    } catch (error: any) {
      setStatus("error");
      setMessage(error?.data?.error?.message || "Failed to reject invitation.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-secondary">Loading invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-semibold text-primary mb-2">Invalid Invitation</h1>
              <p className="text-secondary mb-4">Invalid or expired invitation token.</p>
              <Button onClick={() => router.push('/dashboard')} variant="outline" className="w-full">
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (status === "accepted") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-semibold text-primary mb-2">
                Invitation Accepted!
              </h1>
              <p className="text-secondary mb-4">{message}</p>
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-semibold text-primary mb-2">
                Invitation Rejected
              </h1>
              <p className="text-secondary mb-4">{message}</p>
              <Button
                onClick={() => router.push("/dashboard")}
                variant="outline"
                className="w-full"
              >
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-semibold text-primary mb-2">
                Invalid Invitation
              </h1>
              <p className="text-secondary mb-4">{message}</p>
              <Button
                onClick={() => router.push("/dashboard")}
                variant="outline"
                className="w-full"
              >
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              {groupConfig.entityName} Invitation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {invitationData?.invitation && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold">
                    {invitationData.invitation.group.name}
                  </h3>
                  {invitationData.invitation.group.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {invitationData.invitation.group.description}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    Role:{" "}
                    <span className="capitalize font-medium">
                      {invitationData.invitation.role}
                    </span>
                  </p>
                </div>
                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertDescription>
                    This invitation expires on{" "}
                    {formatExpiryDate(invitationData.invitation.expires_at)}
                  </AlertDescription>
                </Alert>
              </div>
            )}
            <div className="text-center">
              <p className="text-secondary mb-4">
                You have been invited to join this{" "}
                {groupConfig.entityName.toLowerCase()}. Would you like to accept
                or reject this invitation?
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleReject}
                variant="outline"
                className="flex-1"
                disabled={accepting || rejecting}
              >
                {rejecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </>
                )}
              </Button>
              <Button
                onClick={handleAccept}
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={accepting || rejecting}
              >
                {accepting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept
                  </>
                )}
              </Button>
            </div>

            <div className="text-center">
              <Button
                onClick={() => router.push("/dashboard")}
                variant="ghost"
                size="sm"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
