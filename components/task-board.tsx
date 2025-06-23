'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  PlayCircle, 
  AlertTriangle,
  Target,
  Zap,
  Minus,
  MoreHorizontal,
  Edit2,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Task } from '@/lib/types';
import { format, isAfter, isBefore, startOfDay } from 'date-fns';
import { TaskCard } from './task-card';

interface TaskBoardProps {
  tasks: Task[];
  onUpdate: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onUpdateSubtask: (taskId: string, subtaskId: string, updates: { title?: string; completed?: boolean }) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
}

const STATUS_COLUMNS = [
  {
    id: 'not_started',
    title: 'Not Started',
    icon: Circle,
    color: '#6B7280',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    icon: PlayCircle,
    color: '#3B82F6',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'completed',
    title: 'Completed',
    icon: CheckCircle2,
    color: '#10B981',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
];

export function TaskBoard({ 
  tasks, 
  onUpdate, 
  onDelete, 
  onAddSubtask, 
  onUpdateSubtask, 
  onDeleteSubtask 
}: TaskBoardProps) {
  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const handleStatusChange = (taskId: string, newStatus: 'not_started' | 'in_progress' | 'completed') => {
    onUpdate(taskId, { status: newStatus });
  };

  if (tasks.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Target className="h-12 w-12" />
            <div>
              <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
              <p className="text-sm">Convert some ideas to tasks to get started!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {STATUS_COLUMNS.map((column) => {
        const columnTasks = getTasksByStatus(column.id);
        const Icon = column.icon;

        return (
          <Card key={column.id} className={`${column.borderColor} border-2 min-h-[500px]`}>
            <CardHeader className={`${column.bgColor} pb-3`}>
              <CardTitle className="flex items-center gap-3">
                <Icon className="h-5 w-5" style={{ color: column.color }} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span>{column.title}</span>
                    <Badge variant="secondary">{columnTasks.length}</Badge>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-4 space-y-4">
              {columnTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No {column.title.toLowerCase()} tasks</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                      onStatusChange={handleStatusChange}
                      onAddSubtask={onAddSubtask}
                      onUpdateSubtask={onUpdateSubtask}
                      onDeleteSubtask={onDeleteSubtask}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}