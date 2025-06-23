'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  Edit2, 
  Archive, 
  Trash2, 
  Save, 
  X,
  Clock,
  RotateCcw,
  TrendingUp,
  Zap,
  ArrowRight,
  Brain,
  Sparkles
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Idea, Tag, TaskFormData } from '@/lib/types';
import { storage } from '@/lib/storage';
import { formatDistanceToNow } from 'date-fns';
import { TagInput } from './tag-input';
import { PrioritySlider } from './priority-slider';
import { TaskConverter } from './task-converter';
import { AIAssistant } from './ai-assistant';
import { cn } from '@/lib/utils';

interface IdeaCardProps {
  idea: Idea;
  onUpdate: (id: string, updates: Partial<Omit<Idea, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => void;
  onConvertToTask?: (ideaId: string, taskData: TaskFormData) => void;
  className?: string;
}

export function IdeaCard({ 
  idea, 
  onUpdate, 
  onDelete, 
  onArchive, 
  onRestore, 
  onConvertToTask,
  className 
}: IdeaCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [editData, setEditData] = useState({
    title: idea.title,
    description: idea.description || '',
    tags: idea.tags || [],
    impact: idea.impact || 3,
    effort: idea.effort || 3,
  });

  useEffect(() => {
    const tags = storage.getTags();
    setAvailableTags(tags);
  }, []);

  const handleSave = () => {
    if (!editData.title.trim()) return;
    
    onUpdate(idea.id, {
      title: editData.title.trim(),
      description: editData.description.trim() || undefined,
      tags: editData.tags,
      impact: editData.impact,
      effort: editData.effort,
    });
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      title: idea.title,
      description: idea.description || '',
      tags: idea.tags || [],
      impact: idea.impact || 3,
      effort: idea.effort || 3,
    });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleAIUpdate = (updates: Partial<Omit<Idea, 'id' | 'createdAt'>>) => {
    onUpdate(idea.id, updates);
  };

  const timeAgo = formatDistanceToNow(idea.createdAt, { addSuffix: true });
  const isArchived = idea.status === 'archived';

  // Get tag objects for display
  const ideaTags = (idea.tags || [])
    .map(tagId => availableTags.find(tag => tag.id === tagId))
    .filter(Boolean) as Tag[];

  // Get quadrant info
  const getQuadrantInfo = (quadrant: string) => {
    switch (quadrant) {
      case 'q1': return { name: 'Plan', color: '#F59E0B', bg: 'bg-amber-100' };
      case 'q2': return { name: 'Do First', color: '#10B981', bg: 'bg-green-100' };
      case 'q3': return { name: 'Reconsider', color: '#EF4444', bg: 'bg-red-100' };
      case 'q4': return { name: 'Optional', color: '#6B7280', bg: 'bg-gray-100' };
      default: return { name: 'Unknown', color: '#6B7280', bg: 'bg-gray-100' };
    }
  };

  const quadrantInfo = getQuadrantInfo(idea.quadrant);

  return (
    <>
      <Card className={cn(
        `group hover:shadow-md transition-all duration-200 ${
          isArchived ? 'opacity-75 border-muted' : 'hover:border-primary/20'
        }`,
        className
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            {isEditing ? (
              <Input
                value={editData.title}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                onKeyDown={handleKeyDown}
                maxLength={100}
                className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0"
                autoFocus
              />
            ) : (
              <h3 className="text-lg font-semibold leading-tight line-clamp-2">
                {idea.title}
              </h3>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!isEditing && (
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                
                {!isArchived && (
                  <DropdownMenuItem onClick={() => setShowAIAssistant(!showAIAssistant)}>
                    <Brain className="h-4 w-4 mr-2" />
                    AI Assistant
                  </DropdownMenuItem>
                )}
                
                {!isArchived && onArchive && (
                  <DropdownMenuItem onClick={() => onArchive(idea.id)}>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                )}
                
                {isArchived && onRestore && (
                  <DropdownMenuItem onClick={() => onRestore(idea.id)}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restore
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {isEditing ? (
            <div className="space-y-4">
              <Textarea
                value={editData.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                onKeyDown={handleKeyDown}
                placeholder="Add description..."
                maxLength={500}
                rows={3}
              />
              
              <TagInput
                selectedTags={editData.tags}
                onTagsChange={(tags) => setEditData(prev => ({ ...prev, tags }))}
                placeholder="Add tags..."
              />

              <div className="border-t pt-4">
                <PrioritySlider
                  impact={editData.impact}
                  effort={editData.effort}
                  onImpactChange={(impact) => setEditData(prev => ({ ...prev, impact }))}
                  onEffortChange={(effort) => setEditData(prev => ({ ...prev, effort }))}
                />
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} disabled={!editData.title.trim()}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              {idea.description && (
                <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
                  {idea.description}
                </p>
              )}
              
              {/* Tags */}
              {ideaTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {ideaTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="text-xs"
                      style={{ 
                        backgroundColor: `${tag.color}20`, 
                        color: tag.color, 
                        borderColor: `${tag.color}40` 
                      }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Priority Indicators */}
              <div className="flex items-center gap-4 mb-4 text-xs">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-muted-foreground">Impact:</span>
                  <Badge variant="outline" className="text-xs">
                    {idea.impact}/5
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-orange-600" />
                  <span className="text-muted-foreground">Effort:</span>
                  <Badge variant="outline" className="text-xs">
                    {idea.effort}/5
                  </Badge>
                </div>
              </div>

              {/* AI Assistant */}
              {showAIAssistant && !isArchived && (
                <div className="mb-4">
                  <AIAssistant idea={idea} onUpdateIdea={handleAIUpdate} />
                </div>
              )}

              {/* Convert to Task Button */}
              {!isArchived && onConvertToTask && (
                <div className="mb-4">
                  <TaskConverter idea={idea} onConvert={onConvertToTask} />
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{timeAgo}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {isArchived && (
                    <Badge variant="secondary" className="text-xs">
                      Archived
                    </Badge>
                  )}
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${quadrantInfo.bg}`}
                    style={{ color: quadrantInfo.color }}
                  >
                    {quadrantInfo.name}
                  </Badge>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Idea</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{idea.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => onDelete(idea.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}