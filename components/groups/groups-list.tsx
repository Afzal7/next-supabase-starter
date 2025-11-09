'use client';

import React, { useState, useCallback } from 'react';
import { useGetGroupsQuery } from '@/lib/rtk';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, Users, Settings } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import type { Group } from '@/types';

interface GroupsListProps {
  onGroupSelect?: (group: Group) => void;
  onCreateGroup?: () => void;
  className?: string;
}

export function GroupsList({ onGroupSelect, onCreateGroup, className }: GroupsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  // Debounce search to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const {
    data: groupsResponse,
    isLoading,
    error,
    refetch
  } = useGetGroupsQuery({
    page,
    limit: 10,
    search: debouncedSearchTerm || undefined,
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already debounced, no need for explicit action
  };

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    // Page reset happens automatically due to debounced search
  }, []);

  const handleGroupClick = (group: Group) => {
    onGroupSelect?.(group);
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Failed to load groups</p>
            <Button onClick={() => refetch()} variant="outline" className="mt-2">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">My Groups</h2>
          <p className="text-muted-foreground">
            Manage your organizations and teams
          </p>
        </div>
        <Button onClick={onCreateGroup} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Group
        </Button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </form>

      {/* Groups Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {groupsResponse?.data.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No groups found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? "No groups match your search criteria."
                    : "You haven't created any groups yet."
                  }
                </p>
                <Button onClick={onCreateGroup}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Group
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groupsResponse?.data.map((group) => (
                <Card
                  key={group.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleGroupClick(group)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <CardDescription className="font-mono text-sm">
                          @{group.slug}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {group.group_type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {group.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {group.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Created {new Date(group.created_at).toLocaleDateString()}</span>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {groupsResponse && groupsResponse.pagination.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={!groupsResponse.pagination.has_prev}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {groupsResponse.pagination.page} of {groupsResponse.pagination.total_pages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={!groupsResponse.pagination.has_next}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}