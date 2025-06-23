'use client';

import { useState } from 'react';
import { Idea, TaskFormData } from '@/lib/types';
import { IdeaCard } from './idea-card';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Lightbulb, Archive } from 'lucide-react';

interface IdeasGridProps {
  ideas: Idea[];
  onUpdate: (id: string, updates: Partial<Omit<Idea, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => void;
  onConvertToTask?: (ideaId: string, taskData: TaskFormData) => void;
  showArchived?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  enableBulkSelect?: boolean;
}

export function IdeasGrid({ 
  ideas, 
  onUpdate, 
  onDelete, 
  onArchive, 
  onRestore,
  onConvertToTask,
  showArchived = false,
  selectedIds = [],
  onSelectionChange,
  enableBulkSelect = false,
}: IdeasGridProps) {
  const handleIdeaSelect = (ideaId: string, checked: boolean) => {
    if (!onSelectionChange) return;
    
    if (checked) {
      onSelectionChange([...selectedIds, ideaId]);
    } else {
      onSelectionChange(selectedIds.filter(id => id !== ideaId));
    }
  };

  if (ideas.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            {showArchived ? (
              <>
                <Archive className="h-12 w-12" />
                <div>
                  <h3 className="text-lg font-medium mb-2">No archived ideas</h3>
                  <p className="text-sm">Ideas you archive will appear here.</p>
                </div>
              </>
            ) : (
              <>
                <Lightbulb className="h-12 w-12" />
                <div>
                  <h3 className="text-lg font-medium mb-2">No ideas found</h3>
                  <p className="text-sm">
                    {selectedIds.length > 0 || enableBulkSelect 
                      ? 'Try adjusting your filters or search terms.'
                      : 'Start by capturing your first brilliant idea above!'
                    }
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {ideas.map((idea) => (
        <div key={idea.id} className="relative">
          {enableBulkSelect && onSelectionChange && (
            <div className="absolute top-2 left-2 z-10">
              <Checkbox
                checked={selectedIds.includes(idea.id)}
                onCheckedChange={(checked) => handleIdeaSelect(idea.id, checked as boolean)}
                className="bg-background border-2 shadow-sm"
              />
            </div>
          )}
          <IdeaCard
            idea={idea}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onArchive={onArchive}
            onRestore={onRestore}
            onConvertToTask={onConvertToTask}
            className={enableBulkSelect ? 'ml-6' : ''}
          />
        </div>
      ))}
    </div>
  );
}