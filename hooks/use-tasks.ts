'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Task, TaskFormData } from '@/lib/types';
import { supabaseStorage } from '@/lib/supabase-storage';
import { useAuth } from '@/lib/auth-context';

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'created' | 'title'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [initialized, setInitialized] = useState(false);

  // Load tasks when user is authenticated
  useEffect(() => {
    let mounted = true;
    let subscription: any = null;

    if (!user) {
      setTasks([]);
      setIsLoading(false);
      setInitialized(false);
      return;
    }

    const loadTasks = async () => {
      if (!mounted) return;
      
      try {
        setIsLoading(true);
        const userTasks = await supabaseStorage.getTasks();
        if (mounted) {
          setTasks(userTasks);
          setInitialized(true);
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
        if (mounted) {
          setTasks([]);
          setInitialized(true);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Only load if not already initialized for this user
    if (!initialized) {
      loadTasks();
    }

    // Set up real-time subscription only after initial load
    if (initialized) {
      subscription = supabaseStorage.subscribeToTasks((newTasks) => {
        if (mounted) {
          setTasks(newTasks);
        }
      });
    }

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [user, initialized]);

  const addTask = useCallback(async (ideaId: string, taskData: TaskFormData) => {
    if (!user) throw new Error('User not authenticated');
    
    const newTask = await supabaseStorage.addTask({
      ideaId,
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      dueDate: taskData.dueDate,
      estimatedHours: taskData.estimatedHours,
      tags: taskData.tags,
      subtasks: taskData.subtasks,
    });
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  }, [user]);

  const updateTask = useCallback(async (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    if (!user) throw new Error('User not authenticated');
    
    const updatedTask = await supabaseStorage.updateTask(id, updates);
    setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
    return updatedTask;
  }, [user]);

  const deleteTask = useCallback(async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    
    const success = await supabaseStorage.deleteTask(id);
    if (success) {
      setTasks(prev => prev.filter(task => task.id !== id));
    }
    return success;
  }, [user]);

  const addSubtask = useCallback(async (taskId: string, title: string) => {
    if (!user) throw new Error('User not authenticated');
    
    const newSubtask = await supabaseStorage.addSubtask(taskId, title);
    if (newSubtask) {
      setTasks(prev => prev.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: [...task.subtasks, newSubtask],
            updatedAt: new Date(),
          };
        }
        return task;
      }));
    }
    return newSubtask;
  }, [user]);

  const updateSubtask = useCallback(async (taskId: string, subtaskId: string, updates: { title?: string; completed?: boolean }) => {
    if (!user) throw new Error('User not authenticated');
    
    const success = await supabaseStorage.updateSubtask(taskId, subtaskId, updates);
    if (success) {
      setTasks(prev => prev.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: task.subtasks.map(subtask => 
              subtask.id === subtaskId ? { ...subtask, ...updates } : subtask
            ),
            updatedAt: new Date(),
          };
        }
        return task;
      }));
    }
    return success;
  }, [user]);

  const deleteSubtask = useCallback(async (taskId: string, subtaskId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    const success = await supabaseStorage.deleteSubtask(taskId, subtaskId);
    if (success) {
      setTasks(prev => prev.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: task.subtasks.filter(subtask => subtask.id !== subtaskId),
            updatedAt: new Date(),
          };
        }
        return task;
      }));
    }
    return success;
  }, [user]);

  // Advanced filtering and sorting
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(task => 
        selectedTags.some(tagId => task.tags?.includes(tagId))
      );
    }

    // Filter by selected statuses
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(task => 
        selectedStatuses.includes(task.status)
      );
    }

    // Filter by selected priorities
    if (selectedPriorities.length > 0) {
      filtered = filtered.filter(task => 
        selectedPriorities.includes(task.priority)
      );
    }

    // Sort tasks
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) comparison = 0;
          else if (!a.dueDate) comparison = 1;
          else if (!b.dueDate) comparison = -1;
          else comparison = a.dueDate.getTime() - b.dueDate.getTime();
          break;
        case 'created':
        default:
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [tasks, searchQuery, selectedTags, selectedStatuses, selectedPriorities, sortBy, sortOrder]);

  // Task statistics
  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    const inProgress = tasks.filter(task => task.status === 'in_progress').length;
    const notStarted = tasks.filter(task => task.status === 'not_started').length;
    const overdue = tasks.filter(task => 
      task.dueDate && 
      task.status !== 'completed' && 
      task.dueDate < new Date()
    ).length;

    return {
      total,
      completed,
      inProgress,
      notStarted,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [tasks]);

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedTags([]);
    setSelectedStatuses([]);
    setSelectedPriorities([]);
    setSortBy('dueDate');
    setSortOrder('asc');
  }, []);

  return {
    tasks: filteredAndSortedTasks,
    allTasks: tasks,
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
  };
}