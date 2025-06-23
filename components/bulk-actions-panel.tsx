'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  CheckSquare, 
  Square, 
  Archive, 
  Trash2, 
  Tag as TagIcon,
  Grid3X3,
  X
} from 'lucide-react';
import { Idea, Tag } from '@/lib/types';
import { storage } from '@/lib/storage';

interface BulkActionsPanelProps {
  ideas: Idea[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onBulkUpdate: (ids: string[], updates: Partial<Omit<Idea, 'id' | 'createdAt'>>) => void;
  onBulkDelete: (ids: string[]) => void;
  showArchived?: boolean;
}

export function BulkActionsPanel({
  ideas,
  selectedIds,
  onSelectionChange,
  onBulkUpdate,
  onBulkDelete,
  showArchived = false,
}: BulkActionsPanelProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  React.useEffect(() => {
    const tags = storage.getTags();
    setAvailableTags(tags);
  }, []);

  const handleSelectAll = () => {
    if (selectedIds.length === ideas.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(ideas.map(idea => idea.id));
    }
  };

  const handleBulkTagAssignment = (tagId: string) => {
    const selectedIdeas = ideas.filter(idea => selectedIds.includes(idea.id));
    const updates = selectedIdeas.map(idea => {
      const currentTags = idea.tags || [];
      const newTags = currentTags.includes(tagId) 
        ? currentTags.filter(id => id !== tagId)
        : [...currentTags, tagId];
      
      return { id: idea.id, tags: newTags };
    });

    updates.forEach(update => {
      onBulkUpdate([update.id], { tags: update.tags });
    });
  };

  const handleBulkQuadrantChange = (quadrant: 'q1' | 'q2' | 'q3' | 'q4') => {
    // Calculate impact and effort based on quadrant
    let impact: number, effort: number;
    switch (quadrant) {
      case 'q1': impact = 4; effort = 4; break; // High Impact, High Effort
      case 'q2': impact = 4; effort = 2; break; // High Impact, Low Effort
      case 'q3': impact = 2; effort = 4; break; // Low Impact, High Effort
      case 'q4': impact = 2; effort = 2; break; // Low Impact, Low Effort
    }

    onBulkUpdate(selectedIds, { impact, effort, quadrant });
  };

  const handleBulkArchive = () => {
    const status = showArchived ? 'active' : 'archived';
    onBulkUpdate(selectedIds, { status });
  };

  const handleBulkDelete = () => {
    onBulkDelete(selectedIds);
    setShowDeleteDialog(false);
    onSelectionChange([]);
  };

  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="gap-2"
              >
                {selectedIds.length === ideas.length ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                {selectedIds.length === ideas.length ? 'Deselect All' : 'Select All'}
              </Button>
              
              <Badge variant="secondary" className="gap-1">
                {selectedIds.length} selected
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {/* Tag Assignment */}
              <Select onValueChange={handleBulkTagAssignment}>
                <SelectTrigger className="w-40">
                  <div className="flex items-center gap-2">
                    <TagIcon className="h-4 w-4" />
                    <span>Add/Remove Tag</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {availableTags.map((tag) => (
                    <SelectItem key={tag.id} value={tag.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Quadrant Assignment */}
              <Select onValueChange={handleBulkQuadrantChange}>
                <SelectTrigger className="w-40">
                  <div className="flex items-center gap-2">
                    <Grid3X3 className="h-4 w-4" />
                    <span>Set Priority</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="q2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      Do First
                    </div>
                  </SelectItem>
                  <SelectItem value="q1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      Plan
                    </div>
                  </SelectItem>
                  <SelectItem value="q4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-500" />
                      Optional
                    </div>
                  </SelectItem>
                  <SelectItem value="q3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      Reconsider
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Archive/Restore */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkArchive}
                className="gap-2"
              >
                <Archive className="h-4 w-4" />
                {showArchived ? 'Restore' : 'Archive'}
              </Button>

              {/* Delete */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>

              {/* Clear Selection */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectionChange([])}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Ideas</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.length} selected idea{selectedIds.length > 1 ? 's' : ''}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {selectedIds.length} Idea{selectedIds.length > 1 ? 's' : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}