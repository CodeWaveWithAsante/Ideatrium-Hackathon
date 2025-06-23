'use client';

import { useState } from 'react';
import { useTasks } from '@/hooks/use-tasks';
import { useIdeas } from '@/hooks/use-ideas';
import { Header } from '@/components/header';
import { TaskBoard } from '@/components/task-board';
import { TaskList } from '@/components/task-list';
import { TaskStatsDashboard } from '@/components/task-stats-dashboard';
import { AdvancedFilterPanel } from '@/components/advanced-filter-panel';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { ArrowLeft, Target, List, Kanban } from 'lucide-react';
import { TaskFormData } from '@/lib/types';
import Link from 'next/link';
import {SpinnerLoader} from "@/components/spinner-loader"

export default function TasksPage() {
  const {
    tasks,
    isLoading,
    taskStats,
    searchQuery,
    setSearchQuery,
    selectedTags,
    setSelectedTags,
    selectedStatuses,
    setSelectedStatuses,
    selectedPriorities,
    setSelectedPriorities,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    addTask,
    updateTask,
    deleteTask,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    clearAllFilters,
  } = useTasks();

  const { activeIdeas } = useIdeas();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  const handleUpdateTask = async (id: string, updates: Partial<Omit<import('@/lib/types').Task, 'id' | 'createdAt'>>) => {
    try {
      await updateTask(id, updates);
      if (updates.status === 'completed') {
        toast.success('Task completed! 🎉', {
          description: 'Great job on finishing this task!',
        });
      } else {
        toast.success('Task updated', {
          description: 'Your changes have been saved.',
        });
      }
    } catch (error: any) {
      toast.error('Failed to update task', {
        description: error.message || 'Please try again.',
      });
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
      toast.success('Task deleted', {
        description: 'The task has been permanently removed.',
      });
    } catch (error: any) {
      toast.error('Failed to delete task', {
        description: error.message || 'Please try again.',
      });
    }
  };

  const handleAddSubtask = async (taskId: string, title: string) => {
    try {
      await addSubtask(taskId, title);
      toast.success('Subtask added', {
        description: `"${title}" has been added to the task.`,
      });
    } catch (error: any) {
      toast.error('Failed to add subtask', {
        description: error.message || 'Please try again.',
      });
    }
  };

  const handleUpdateSubtask = async (taskId: string, subtaskId: string, updates: { title?: string; completed?: boolean }) => {
    try {
      await updateSubtask(taskId, subtaskId, updates);
      if (updates.completed !== undefined) {
        toast.success(updates.completed ? 'Subtask completed!' : 'Subtask reopened', {
          description: updates.completed ? 'One step closer to completion!' : 'Subtask marked as incomplete.',
        });
      }
    } catch (error: any) {
      toast.error('Failed to update subtask', {
        description: error.message || 'Please try again.',
      });
    }
  };

  const handleDeleteSubtask = async (taskId: string, subtaskId: string) => {
    try {
      await deleteSubtask(taskId, subtaskId);
      toast.success('Subtask removed', {
        description: 'The subtask has been deleted.',
      });
    } catch (error: any) {
      toast.error('Failed to delete subtask', {
        description: error.message || 'Please try again.',
      });
    }
  };

  const handleConvertToTask = async (ideaId: string, taskData: TaskFormData) => {
    try {
      const newTask = await addTask(ideaId, taskData);
      toast.success('Task created!', {
        description: `"${newTask.title}" has been added to your task list.`,
      });
    } catch (error: any) {
      toast.error('Failed to create task', {
        description: error.message || 'Please try again.',
      });
    }
  };

  const handleClearFilters = () => {
    clearAllFilters();
    toast.info('Filters cleared', {
      description: 'All filters have been reset to default.',
    });
  };

  if (isLoading) {
    return (
     <SpinnerLoader 
       title="Loading your tasks..."
       message="Please wait while we load your tasks"
       />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        activeCount={activeIdeas.length}
        archivedCount={0}
        showArchived={false}
        onToggleArchived={() => {}}
        onNewIdea={() => {}}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Ideas
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                Task Management
              </h1>
              <p className="text-muted-foreground">
                Track and manage your actionable tasks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'board' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('board')}
              className="gap-2 dark:text-white"
            >
              <Kanban className="h-4 w-4" />
              Board
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="gap-2 dark:text-white"
            >
              <List className="h-4 w-4" />
              List
            </Button>
          </div>
        </div>

        {/* Task Statistics */}
        <TaskStatsDashboard stats={taskStats} />

        {/* Filters */}
        <AdvancedFilterPanel
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          selectedQuadrants={selectedStatuses}
          onQuadrantsChange={setSelectedStatuses}
          sortBy={sortBy as any}
          onSortByChange={setSortBy as any}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          onApplyPreset={() => {}}
          onClearAll={handleClearFilters}
          isExpanded={showFilters}
          onToggleExpanded={() => setShowFilters(!showFilters)}
        />

        {/* Task View */}
        {viewMode === 'board' ? (
          <TaskBoard
            tasks={tasks}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
            onAddSubtask={handleAddSubtask}
            onUpdateSubtask={handleUpdateSubtask}
            onDeleteSubtask={handleDeleteSubtask}
          />
        ) : (
          <TaskList
            tasks={tasks}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
            onAddSubtask={handleAddSubtask}
            onUpdateSubtask={handleUpdateSubtask}
            onDeleteSubtask={handleDeleteSubtask}
          />
        )}
      </main>

      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
    </div>
  );
}