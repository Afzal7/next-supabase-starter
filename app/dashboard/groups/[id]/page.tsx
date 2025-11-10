"use client";

import { useParams } from "next/navigation";
import { useGetGroupQuery } from "@/lib/rtk/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "@/components/animate-ui/icons/users";
import { Settings } from "@/components/animate-ui/icons/settings";
import { motion } from "motion/react";
import { groupConfig } from "@/config/groups";

export default function GroupOverviewPage() {
  const params = useParams();
  const groupId = params.id as string;

  const { data: group, isLoading, error } = useGetGroupQuery(groupId);

  if (isLoading || error || !group) {
    return null; // Layout handles loading and error states
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="grid gap-6 md:grid-cols-2">
        {/* Group Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" animateOnHover />
              {groupConfig.entityName} Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-tertiary">Name</label>
              <p className="text-primary">{group.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-tertiary">Slug</label>
              <p className="text-primary font-mono text-sm">{group.slug}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-tertiary">Type</label>
              <p className="text-primary capitalize">{group.group_type}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-tertiary">Description</label>
              <p className="text-primary">{group.description || "No description"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" animateOnHover />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-secondary">Total Members</span>
              <span className="font-semibold">{group.members?.length || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-secondary">Active Invitations</span>
              <span className="font-semibold">{group.invitations?.length || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-secondary">Created</span>
              <span className="font-semibold text-sm">
                {new Date(group.created_at).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}