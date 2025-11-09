'use client';

import React, { useState, useCallback } from 'react';
import { useCreateGroupMutation } from '@/lib/rtk';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, X } from 'lucide-react';
import { groupConfig } from '@/config/groups';
import type { CreateGroupRequest } from '@/types';

interface CreateGroupFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function CreateGroupForm({ onSuccess, onCancel, className }: CreateGroupFormProps) {
  const [formData, setFormData] = useState<CreateGroupRequest>({
    name: '',
    slug: '',
    description: '',
    group_type: groupConfig.entityName.toLowerCase(),
  });

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [createGroup, { isLoading, error }] = useCreateGroupMutation();

  const generateSlug = useCallback((name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }, []);

  const handleInputChange = useCallback((field: keyof CreateGroupRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Auto-generate slug from name if user hasn't manually edited it
    if (field === 'name' && !slugManuallyEdited) {
      const generatedSlug = generateSlug(value);
      setFormData(prev => ({
        ...prev,
        slug: generatedSlug,
      }));
    }
  }, [slugManuallyEdited, generateSlug]);

  const handleSlugChange = useCallback((value: string) => {
    setSlugManuallyEdited(true);
    setFormData(prev => ({
      ...prev,
      slug: value,
    }));
  }, []);

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.slug?.trim()) return 'Slug is required';
    if (!/^[a-z0-9-]+$/.test(formData.slug)) return 'Slug can only contain lowercase letters, numbers, and hyphens';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) return; // Form validation prevents submission

    try {
      await createGroup(formData).unwrap();
      onSuccess?.();
    } catch (error) {
      // Error is handled by RTK Query and displayed in UI
      console.error('Failed to create group:', error);
    }
  };

  const getErrorMessage = (): string | null => {
    if (!error) return null;

    const apiError = (error as any)?.data?.error;
    if (!apiError) return 'An unexpected error occurred';

    switch (apiError.code) {
      case 'VALIDATION_ERROR':
        return 'Please check your input and try again';
      case 'DUPLICATE_SLUG':
        return 'This slug is already taken. Please choose a different one.';
      case 'INVALID_SLUG':
        return 'Slug can only contain lowercase letters, numbers, and hyphens.';
      case 'LIMIT_EXCEEDED':
        return `You've reached the maximum number of ${groupConfig.entityNamePlural.toLowerCase()} (${groupConfig.limits.maxGroupsPerUser}).`;
      default:
        return apiError.message || 'Failed to create group';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Create New {groupConfig.entityName}</CardTitle>
            <CardDescription>
              Set up a new {groupConfig.entityName.toLowerCase()} to collaborate with your team
            </CardDescription>
          </div>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{groupConfig.entityName} Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder={`Enter ${groupConfig.entityName.toLowerCase()} name`}
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              maxLength={100}
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              type="text"
              placeholder="unique-slug"
              value={formData.slug || ''}
              onChange={(e) => handleSlugChange(e.target.value)}
              required
              pattern="[a-z0-9-]+"
              title="Only lowercase letters, numbers, and hyphens allowed"
            />
            <p className="text-sm text-muted-foreground">
              This will be used in URLs and must be unique. Auto-generated from name.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder={`Describe your ${groupConfig.entityName.toLowerCase()}...`}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Group Type */}
          <div className="space-y-2">
            <Label htmlFor="group_type">Type</Label>
            <Select
              value={formData.group_type}
              onValueChange={(value) => handleInputChange('group_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="organization">Organization</SelectItem>
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="community">Community</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{getErrorMessage()}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || !!validateForm()}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create {groupConfig.entityName}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}