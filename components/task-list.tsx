'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target } from 'lucide-react';
import { Task } from '@/lib/types';
import { TaskCard } from './task-card';

interface TaskListProps {
  tasks: Task[];
  onUpdate: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onUpdateSubtask: (taskId: string, subtaskId: string, updates: { title?: string; completed?: boolean }) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
}

const STATUS_ORDER = ['not_started', 'in_progress', 'completed'];
const STATUS_LABELS = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export function TaskList({ 
  tasks, 
  onUpdate, 
  onDelete, 
  onAddSubtask, 
  onUpdateSubtask, 
  onDeleteSubtask 
}: TaskListProps) {
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

  // Group tasks by status
  const tasksByStatus = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = tasks.filter(task => task.status === status);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="space-y-8">
      {STATUS_ORDER.map((status) => {
        const statusTasks = tasksByStatus[status];
        if (statusTasks.length === 0) return null;

        return (
          <Card key={status}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>{STATUS_LABELS[status as keyof typeof STATUS_LABELS]}</span>
                <Badge variant="secondary">{statusTasks.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {statusTasks.map((task) => (
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
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}