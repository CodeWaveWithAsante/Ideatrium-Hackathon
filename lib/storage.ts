import { Idea, Tag, Task, SubTask } from './types';

const STORAGE_KEY = 'ideabox-ideas';
const TAGS_STORAGE_KEY = 'ideabox-tags';
const TASKS_STORAGE_KEY = 'ideabox-tasks';

// Preset tags with colors
const PRESET_TAGS: Tag[] = [
  { id: 'startup', name: 'Startup', color: '#3B82F6', category: 'preset' },
  { id: 'project', name: 'Project', color: '#10B981', category: 'preset' },
  { id: 'personal', name: 'Personal', color: '#8B5CF6', category: 'preset' },
  { id: 'tech', name: 'Tech', color: '#F59E0B', category: 'preset' },
  { id: 'work', name: 'Work', color: '#EF4444', category: 'preset' },
  { id: 'creative', name: 'Creative', color: '#EC4899', category: 'preset' },
  { id: 'learning', name: 'Learning', color: '#06B6D4', category: 'preset' },
  { id: 'health', name: 'Health', color: '#84CC16', category: 'preset' },
  { id: 'business', name: 'Business', color: '#F97316', category: 'preset' },
  { id: 'innovation', name: 'Innovation', color: '#6366F1', category: 'preset' },
];

// Helper function to calculate quadrant based on impact and effort
const calculateQuadrant = (impact: number, effort: number): 'q1' | 'q2' | 'q3' | 'q4' => {
  const highImpact = impact >= 3;
  const highEffort = effort >= 3;
  
  if (highImpact && highEffort) return 'q1'; // High Impact, High Effort - Plan
  if (highImpact && !highEffort) return 'q2'; // High Impact, Low Effort - Do First
  if (!highImpact && highEffort) return 'q3'; // Low Impact, High Effort - Reconsider
  return 'q4'; // Low Impact, Low Effort - Optional
};

export const storage = {
  getIdeas: (): Idea[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const ideas = JSON.parse(stored);
      return ideas.map((idea: any) => ({
        ...idea,
        tags: idea.tags || [],
        impact: idea.impact || 3,
        effort: idea.effort || 3,
        quadrant: idea.quadrant || calculateQuadrant(idea.impact || 3, idea.effort || 3),
        createdAt: new Date(idea.createdAt),
        updatedAt: new Date(idea.updatedAt),
      }));
    } catch (error) {
      console.error('Error loading ideas:', error);
      return [];
    }
  },

  saveIdeas: (ideas: Idea[]): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
    } catch (error) {
      console.error('Error saving ideas:', error);
    }
  },

  getTags: (): Tag[] => {
    if (typeof window === 'undefined') return PRESET_TAGS;
    
    try {
      const stored = localStorage.getItem(TAGS_STORAGE_KEY);
      if (!stored) {
        // Initialize with preset tags
        storage.saveTags(PRESET_TAGS);
        return PRESET_TAGS;
      }
      
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading tags:', error);
      return PRESET_TAGS;
    }
  },

  saveTags: (tags: Tag[]): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
    } catch (error) {
      console.error('Error saving tags:', error);
    }
  },

  addTag: (tagData: { name: string; color: string }): Tag => {
    const newTag: Tag = {
      id: crypto.randomUUID(),
      name: tagData.name,
      color: tagData.color,
      category: 'custom',
    };

    const tags = storage.getTags();
    tags.push(newTag);
    storage.saveTags(tags);
    
    return newTag;
  },

  deleteTag: (tagId: string): boolean => {
    const tags = storage.getTags();
    const filteredTags = tags.filter(tag => tag.id !== tagId && tag.category !== 'preset');
    
    if (filteredTags.length === tags.length) return false;
    
    storage.saveTags(filteredTags);
    
    // Remove tag from all ideas
    const ideas = storage.getIdeas();
    const updatedIdeas = ideas.map(idea => ({
      ...idea,
      tags: idea.tags.filter(id => id !== tagId)
    }));
    storage.saveIdeas(updatedIdeas);
    
    // Remove tag from all tasks
    const tasks = storage.getTasks();
    const updatedTasks = tasks.map(task => ({
      ...task,
      tags: task.tags.filter(id => id !== tagId)
    }));
    storage.saveTasks(updatedTasks);
    
    return true;
  },

  addIdea: (ideaData: { 
    title: string; 
    description?: string; 
    tags?: string[];
    impact?: number;
    effort?: number;
  }): Idea => {
    const impact = ideaData.impact || 3;
    const effort = ideaData.effort || 3;
    
    const newIdea: Idea = {
      id: crypto.randomUUID(),
      title: ideaData.title,
      description: ideaData.description,
      tags: ideaData.tags || [],
      impact,
      effort,
      quadrant: calculateQuadrant(impact, effort),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
    };

    const ideas = storage.getIdeas();
    ideas.unshift(newIdea);
    storage.saveIdeas(ideas);
    
    return newIdea;
  },

  updateIdea: (id: string, updates: Partial<Omit<Idea, 'id' | 'createdAt'>>): Idea | null => {
    const ideas = storage.getIdeas();
    const index = ideas.findIndex(idea => idea.id === id);
    
    if (index === -1) return null;
    
    const currentIdea = ideas[index];
    const impact = updates.impact !== undefined ? updates.impact : currentIdea.impact;
    const effort = updates.effort !== undefined ? updates.effort : currentIdea.effort;
    
    const updatedIdea = {
      ...currentIdea,
      ...updates,
      impact,
      effort,
      quadrant: calculateQuadrant(impact, effort),
      updatedAt: new Date(),
    };
    
    ideas[index] = updatedIdea;
    storage.saveIdeas(ideas);
    
    return updatedIdea;
  },

  deleteIdea: (id: string): boolean => {
    const ideas = storage.getIdeas();
    const filteredIdeas = ideas.filter(idea => idea.id !== id);
    
    if (filteredIdeas.length === ideas.length) return false;
    
    storage.saveIdeas(filteredIdeas);
    
    // Also delete related tasks
    const tasks = storage.getTasks();
    const filteredTasks = tasks.filter(task => task.ideaId !== id);
    storage.saveTasks(filteredTasks);
    
    return true;
  },

  // Bulk operations
  bulkUpdateIdeas: (ids: string[], updates: Partial<Omit<Idea, 'id' | 'createdAt'>>): boolean => {
    const ideas = storage.getIdeas();
    let hasChanges = false;
    
    const updatedIdeas = ideas.map(idea => {
      if (ids.includes(idea.id)) {
        hasChanges = true;
        const impact = updates.impact !== undefined ? updates.impact : idea.impact;
        const effort = updates.effort !== undefined ? updates.effort : idea.effort;
        
        return {
          ...idea,
          ...updates,
          impact,
          effort,
          quadrant: calculateQuadrant(impact, effort),
          updatedAt: new Date(),
        };
      }
      return idea;
    });
    
    if (hasChanges) {
      storage.saveIdeas(updatedIdeas);
    }
    
    return hasChanges;
  },

  bulkDeleteIdeas: (ids: string[]): boolean => {
    const ideas = storage.getIdeas();
    const filteredIdeas = ideas.filter(idea => !ids.includes(idea.id));
    
    if (filteredIdeas.length === ideas.length) return false;
    
    storage.saveIdeas(filteredIdeas);
    
    // Also delete related tasks
    const tasks = storage.getTasks();
    const filteredTasks = tasks.filter(task => !ids.includes(task.ideaId));
    storage.saveTasks(filteredTasks);
    
    return true;
  },

  // Task Management
  getTasks: (): Task[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(TASKS_STORAGE_KEY);
      if (!stored) return [];
      
      const tasks = JSON.parse(stored);
      return tasks.map((task: any) => ({
        ...task,
        tags: task.tags || [],
        subtasks: task.subtasks.map((subtask: any) => ({
          ...subtask,
          createdAt: new Date(subtask.createdAt),
        })),
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
      }));
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  },

  saveTasks: (tasks: Task[]): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  },

  addTask: (taskData: {
    ideaId: string;
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    dueDate?: Date;
    estimatedHours?: number;
    tags?: string[];
    subtasks?: string[];
  }): Task => {
    const subtasks: SubTask[] = (taskData.subtasks || []).map(title => ({
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: new Date(),
    }));

    const newTask: Task = {
      id: crypto.randomUUID(),
      ideaId: taskData.ideaId,
      title: taskData.title,
      description: taskData.description,
      status: 'not_started',
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate,
      estimatedHours: taskData.estimatedHours,
      subtasks,
      tags: taskData.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const tasks = storage.getTasks();
    tasks.unshift(newTask);
    storage.saveTasks(tasks);
    
    return newTask;
  },

  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Task | null => {
    const tasks = storage.getTasks();
    const index = tasks.findIndex(task => task.id === id);
    
    if (index === -1) return null;
    
    const currentTask = tasks[index];
    const updatedTask = {
      ...currentTask,
      ...updates,
      updatedAt: new Date(),
      completedAt: updates.status === 'completed' && currentTask.status !== 'completed' 
        ? new Date() 
        : updates.status !== 'completed' 
          ? undefined 
          : currentTask.completedAt,
    };
    
    tasks[index] = updatedTask;
    storage.saveTasks(tasks);
    
    return updatedTask;
  },

  deleteTask: (id: string): boolean => {
    const tasks = storage.getTasks();
    const filteredTasks = tasks.filter(task => task.id !== id);
    
    if (filteredTasks.length === tasks.length) return false;
    
    storage.saveTasks(filteredTasks);
    return true;
  },

  addSubtask: (taskId: string, title: string): SubTask | null => {
    const tasks = storage.getTasks();
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) return null;
    
    const newSubtask: SubTask = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: new Date(),
    };
    
    tasks[taskIndex].subtasks.push(newSubtask);
    tasks[taskIndex].updatedAt = new Date();
    storage.saveTasks(tasks);
    
    return newSubtask;
  },

  updateSubtask: (taskId: string, subtaskId: string, updates: Partial<Omit<SubTask, 'id' | 'createdAt'>>): boolean => {
    const tasks = storage.getTasks();
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) return false;
    
    const subtaskIndex = tasks[taskIndex].subtasks.findIndex(subtask => subtask.id === subtaskId);
    
    if (subtaskIndex === -1) return false;
    
    tasks[taskIndex].subtasks[subtaskIndex] = {
      ...tasks[taskIndex].subtasks[subtaskIndex],
      ...updates,
    };
    
    tasks[taskIndex].updatedAt = new Date();
    storage.saveTasks(tasks);
    
    return true;
  },

  deleteSubtask: (taskId: string, subtaskId: string): boolean => {
    const tasks = storage.getTasks();
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) return false;
    
    const originalLength = tasks[taskIndex].subtasks.length;
    tasks[taskIndex].subtasks = tasks[taskIndex].subtasks.filter(subtask => subtask.id !== subtaskId);
    
    if (tasks[taskIndex].subtasks.length === originalLength) return false;
    
    tasks[taskIndex].updatedAt = new Date();
    storage.saveTasks(tasks);
    
    return true;
  },
};