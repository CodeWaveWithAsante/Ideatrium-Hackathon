'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Save, 
  X,
  Clock,
  Calendar,
  Plus,
  Target,
  AlertTriangle,
  Zap,
  Minus,
  CheckCircle2,
  Circle,
  PlayCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import { Task, Tag } from '@/lib/types';
import { storage } from '@/lib/storage';
import { format, isAfter, isBefore, startOfDay } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
  onStatusChange: (taskId: string, status: 'not_started' | 'in_progress' | 'completed') => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onUpdateSubtask: (taskId: string, subtaskId: string, updates: { title?: string; completed?: boolean }) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
}

const PRIORITY_CONFIG = {
  low: { color: '#6B7280', icon: Minus, label: 'Low' },
  medium: { color: '#F59E0B', icon: Clock, label: 'Medium' },
  high: { color: '#EF4444', icon: AlertTriangle, label: 'High' },
  urgent: { color: '#DC2626', icon: Zap, label: 'Urgent' },
};

const STATUS_CONFIG = {
  not_started: { color: '#6B7280', icon: Circle, label: 'Not Started' },
  in_progress: { color: '#3B82F6', icon: PlayCircle, label: 'In Progress' },
  completed: { color: '#10B981', icon: CheckCircle2, label: 'Completed' },
};

export function TaskCard({ 
  task, 
  onUpdate, 
  onDelete, 
  onStatusChange,
  onAddSubtask,
  onUpdateSubtask,
  onDeleteSubtask
}: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    estimatedHours: task.estimatedHours,
  });

  useEffect(() => {
    const tags = storage.getTags();
    setAvailableTags(tags);
  }, []);

  const handleSave = () => {
    if (!editData.title.trim()) return;
    
    onUpdate(task.id, {
      title: editData.title.trim(),
      description: editData.description.trim() || undefined,
      priority: editData.priority,
      estimatedHours: editData.estimatedHours,
    });
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      estimatedHours: task.estimatedHours,
    });
    setIsEditing(false);
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      onAddSubtask(task.id, newSubtask.trim());
      setNewSubtask('');
    }
  };

  const handleSubtaskToggle = (subtaskId: string, completed: boolean) => {
    onUpdateSubtask(task.id, subtaskId, { completed });
  };

  // Get tag objects for display
  const taskTags = (task.tags || [])
    .map(tagId => availableTags.find(tag => tag.id === tagId))
    .filter(Boolean) as Tag[];

  // Calculate progress
  const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
  const totalSubtasks = task.subtasks.length;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  // Check if overdue
  const isOverdue = task.dueDate && 
    task.status !== 'completed' && 
    isBefore(task.dueDate, startOfDay(new Date()));

  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const PriorityIcon = priorityConfig.icon;

  const isCompleted = task.status === 'completed';

  return (
    <>
      <Card className={`group hover:shadow-md transition-all duration-200 ${
        isOverdue ? 'border-red-200 bg-red-50/50' : 'hover:border-primary/20'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            {isEditing ? (
              <Input
                value={editData.title}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                maxLength={100}
                className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0"
                autoFocus
              />
            ) : (
              <h3 className="text-lg font-semibold leading-tight line-clamp-2">
                {task.title}
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
                
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Target className="h-4 w-4 mr-2" />
                    Change Status
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                      const Icon = config.icon;
                      return (
                        <DropdownMenuItem
                          key={status}
                          onClick={() => onStatusChange(task.id, status as any)}
                          disabled={task.status === status}
                        >
                          <Icon className="h-4 w-4 mr-2" style={{ color: config.color }} />
                          {config.label}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                
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
                placeholder="Add description..."
                maxLength={500}
                rows={3}
              />
              
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
              {task.description && (
                <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
                  {task.description}
                </p>
              )}
              
              {/* Priority and Due Date */}
              <div className="flex items-center gap-4 mb-4 text-xs">
                <div className="flex items-center gap-1">
                  <PriorityIcon className="h-3 w-3" style={{ color: priorityConfig.color }} />
                  <span className="text-muted-foreground">Priority:</span>
                  <Badge 
                    variant="outline" 
                    className="text-xs"
                    style={{ color: priorityConfig.color, borderColor: priorityConfig.color }}
                  >
                    {priorityConfig.label}
                  </Badge>
                </div>
                
                {task.dueDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                      {format(task.dueDate, 'MMM d')}
                      {isOverdue && ' (Overdue)'}
                    </span>
                  </div>
                )}
              </div>

              {/* Time Tracking */}
              {task.estimatedHours && (
                <div className="flex items-center gap-2 mb-4 text-xs">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Est: {task.estimatedHours}h
                    {task.actualHours && ` | Actual: ${task.actualHours}h`}
                  </span>
                </div>
              )}

              {/* Subtasks */}
              {task.subtasks.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      Subtasks ({completedSubtasks}/{totalSubtasks})
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <Progress value={progress} className="h-2 mb-3" />
                  
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {task.subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={subtask.completed}
                          onCheckedChange={(checked) => 
                            handleSubtaskToggle(subtask.id, checked as boolean)
                          }
                        />
                        <span className={`text-sm flex-1 ${
                          subtask.completed ? 'line-through text-muted-foreground' : ''
                        }`}>
                          {subtask.title}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteSubtask(task.id, subtask.id)}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Subtask - Only show if task is not completed */}
              {!isCompleted && (
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Add subtask..."
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubtask();
                      }
                    }}
                    className="text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddSubtask}
                    disabled={!newSubtask.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              {/* Tags */}
              {taskTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {taskTags.map((tag) => (
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
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{task.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => onDelete(task.id)}
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