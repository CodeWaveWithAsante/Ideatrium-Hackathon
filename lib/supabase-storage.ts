import { supabase, isSupabaseConfigured } from './supabase';
import { Idea, Tag, Task, SubTask } from './types';
import { Database } from './database.types';

type IdeaRow = Database['public']['Tables']['ideas']['Row'];
type TaskRow = Database['public']['Tables']['tasks']['Row'];
type SubtaskRow = Database['public']['Tables']['subtasks']['Row'];
type TagRow = Database['public']['Tables']['tags']['Row'];

// Helper function to calculate quadrant based on impact and effort
const calculateQuadrant = (impact: number, effort: number): 'q1' | 'q2' | 'q3' | 'q4' => {
  const highImpact = impact >= 3;
  const highEffort = effort >= 3;
  
  if (highImpact && highEffort) return 'q1'; // High Impact, High Effort - Plan
  if (highImpact && !highEffort) return 'q2'; // High Impact, Low Effort - Do First
  if (!highImpact && highEffort) return 'q3'; // Low Impact, High Effort - Reconsider
  return 'q4'; // Low Impact, Low Effort - Optional
};

// Transform database row to Idea type
const transformIdeaFromDB = (row: IdeaRow): Idea => ({
  id: row.id,
  title: row.title,
  description: row.description || undefined,
  tags: row.tags || [],
  impact: row.impact as number,
  effort: row.effort as number,
  quadrant: row.quadrant,
  status: row.status,
  createdAt: new Date(row.created_at as string),
  updatedAt: new Date(row.updated_at as string),
});

// Transform database row to Task type
const transformTaskFromDB = (row: TaskRow, subtasks: SubTask[] = []): Task => ({
  id: row.id,
  ideaId: row.idea_id,
  title: row.title,
  description: row.description || undefined,
  status: row.status,
  priority: row.priority,
  dueDate: row.due_date ? new Date(row.due_date) : undefined,
  estimatedHours: row.estimated_hours || undefined,
  actualHours: row.actual_hours || undefined,
  tags: row.tags || [],
  subtasks,
  createdAt: new Date(row.created_at as string),
  updatedAt: new Date(row.updated_at as string),
  completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
});

// Transform database row to Tag type
const transformTagFromDB = (row: TagRow): Tag => ({
  id: row.id,
  name: row.name,
  color: row.color,
  category: row.category,
});

// Check if Supabase is configured before making requests
const ensureSupabaseConfigured = () => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not properly configured. Please check your environment variables.');
  }
};

export const supabaseStorage = {
  // Ideas
  async getIdeas(): Promise<Idea[]> {
    ensureSupabaseConfigured();
    
    const { data: userData, error: authError } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) throw new Error('User not authenticated');

    console.log('🔍 Fetching ideas for user:', user.id);

    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('user_id.id', user.id as string)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching ideas:', error);
      throw new Error(`Failed to fetch ideas: ${error.message}`);
    }

    console.log('✅ Successfully fetched', data?.length || 0, 'ideas');
    return data.map(transformIdeaFromDB);
  },

  async addIdea(ideaData: {
    title: string;
    description?: string;
    tags?: string[];
    impact?: number;
    effort?: number;
  }): Promise<Idea> {
    ensureSupabaseConfigured();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const impact = ideaData.impact || 3;
    const effort = ideaData.effort || 3;
    const quadrant = calculateQuadrant(impact, effort);

    console.log('📝 Adding new idea for user:', user.id, {
      title: ideaData.title,
      impact,
      effort,
      quadrant
    });

    const { data, error } = await supabase
      .from('ideas')
      .insert({
        user_id: user.id,
        title: ideaData.title,
        description: ideaData.description,
        tags: ideaData.tags || [],
        impact,
        effort,
        quadrant,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error adding idea:', error);
      throw new Error(`Failed to add idea: ${error.message}`);
    }

    console.log('✅ Successfully added idea:', data.id);
    return transformIdeaFromDB(data);
  },

  async updateIdea(id: string, updates: Partial<Omit<Idea, 'id' | 'createdAt'>>): Promise<Idea> {
    ensureSupabaseConfigured();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.status !== undefined) updateData.status = updates.status;
    
    if (updates.impact !== undefined || updates.effort !== undefined) {
      // Get current idea to calculate new quadrant
      const { data: currentIdea } = await supabase
        .from('ideas')
        .select('impact, effort')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      const impact = updates.impact !== undefined ? updates.impact : currentIdea?.impact || 3;
      const effort = updates.effort !== undefined ? updates.effort : currentIdea?.effort || 3;
      
      updateData.impact = impact;
      updateData.effort = effort;
      updateData.quadrant = calculateQuadrant(impact, effort);
    }

    console.log('📝 Updating idea:', id, updateData);

    const { data, error } = await supabase
      .from('ideas')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating idea:', error);
      throw new Error(`Failed to update idea: ${error.message}`);
    }

    console.log('✅ Successfully updated idea:', id);
    return transformIdeaFromDB(data);
  },

  async deleteIdea(id: string): Promise<boolean> {
    ensureSupabaseConfigured();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    console.log('🗑️ Deleting idea:', id);

    // Delete related tasks first
    await supabase
      .from('tasks')
      .delete()
      .eq('idea_id', id)
      .eq('user_id', user.id);

    const { error } = await supabase
      .from('ideas')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('❌ Error deleting idea:', error);
      throw new Error(`Failed to delete idea: ${error.message}`);
    }

    console.log('✅ Successfully deleted idea:', id);
    return true;
  },

  async bulkUpdateIdeas(ids: string[], updates: Partial<Omit<Idea, 'id' | 'createdAt'>>): Promise<boolean> {
    ensureSupabaseConfigured();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    
    if (updates.impact !== undefined && updates.effort !== undefined) {
      updateData.impact = updates.impact;
      updateData.effort = updates.effort;
      updateData.quadrant = calculateQuadrant(updates.impact, updates.effort);
    }

    console.log('📝 Bulk updating ideas:', ids.length, 'items');

    const { error } = await supabase
      .from('ideas')
      .update(updateData)
      .in('id', ids)
      .eq('user_id', user.id);

    if (error) {
      console.error('❌ Error bulk updating ideas:', error);
      throw new Error(`Failed to bulk update ideas: ${error.message}`);
    }

    console.log('✅ Successfully bulk updated ideas');
    return true;
  },

  async bulkDeleteIdeas(ids: string[]): Promise<boolean> {
    ensureSupabaseConfigured();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    console.log('🗑️ Bulk deleting ideas:', ids.length, 'items');

    // Delete related tasks first
    await supabase
      .from('tasks')
      .delete()
      .in('idea_id', ids)
      .eq('user_id', user.id);

    const { error } = await supabase
      .from('ideas')
      .delete()
      .in('id', ids)
      .eq('user_id', user.id);

    if (error) {
      console.error('❌ Error bulk deleting ideas:', error);
      throw new Error(`Failed to bulk delete ideas: ${error.message}`);
    }

    console.log('✅ Successfully bulk deleted ideas');
    return true;
  },

  // Tags
  async getTags(): Promise<Tag[]> {
    ensureSupabaseConfigured();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', user.id)
      .order('name');

    if (error) {
      console.error('❌ Error fetching tags:', error);
      throw new Error(`Failed to fetch tags: ${error.message}`);
    }

    return data.map(transformTagFromDB);
  },

  async addTag(tagData: { name: string; color: string }): Promise<Tag> {
    ensureSupabaseConfigured();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('tags')
      .insert({
        user_id: user.id,
        name: tagData.name,
        color: tagData.color,
        category: 'custom',
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error adding tag:', error);
      throw new Error(`Failed to add tag: ${error.message}`);
    }

    return transformTagFromDB(data);
  },

  // Tasks
  async getTasks(): Promise<Task[]> {
    ensureSupabaseConfigured();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (tasksError) {
      console.error('❌ Error fetching tasks:', tasksError);
      throw new Error(`Failed to fetch tasks: ${tasksError.message}`);
    }

    const { data: subtasks, error: subtasksError } = await supabase
      .from('subtasks')
      .select('*')
      .in('task_id', tasks.map(t => t.id));

    if (subtasksError) {
      console.error('❌ Error fetching subtasks:', subtasksError);
      throw new Error(`Failed to fetch subtasks: ${subtasksError.message}`);
    }

    return tasks.map(task => {
      const taskSubtasks = subtasks
        .filter(st => st.task_id === task.id)
        .map(st => ({
          id: st.id,
          title: st.title,
          completed: st.completed,
          createdAt: new Date(st.created_at),
        }));

      return transformTaskFromDB(task, taskSubtasks);
    });
  },

  async addTask(taskData: {
    ideaId: string;
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    dueDate?: Date;
    estimatedHours?: number;
    tags?: string[];
    subtasks?: string[];
  }): Promise<Task> {
    ensureSupabaseConfigured();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        idea_id: taskData.ideaId,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority || 'medium',
        due_date: taskData.dueDate?.toISOString(),
        estimated_hours: taskData.estimatedHours,
        tags: taskData.tags || [],
        status: 'not_started',
      })
      .select()
      .single();

    if (taskError) {
      console.error('❌ Error adding task:', taskError);
      throw new Error(`Failed to add task: ${taskError.message}`);
    }

    // Add subtasks if provided
    const subtasks: SubTask[] = [];
    if (taskData.subtasks && taskData.subtasks.length > 0) {
      const { data: subtaskData, error: subtaskError } = await supabase
        .from('subtasks')
        .insert(
          taskData.subtasks.map(title => ({
            task_id: task.id,
            title,
            completed: false,
          }))
        )
        .select();

      if (subtaskError) {
        console.error('❌ Error adding subtasks:', subtaskError);
        throw new Error(`Failed to add subtasks: ${subtaskError.message}`);
      }
      
      subtasks.push(...subtaskData.map(st => ({
        id: st.id,
        title: st.title,
        completed: st.completed,
        createdAt: new Date(st.created_at),
      })));
    }

    return transformTaskFromDB(task, subtasks);
  },

  async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task> {
    ensureSupabaseConfigured();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) {
      updateData.status = updates.status;
      if (updates.status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      } else {
        updateData.completed_at = null;
      }
    }
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate?.toISOString();
    if (updates.estimatedHours !== undefined) updateData.estimated_hours = updates.estimatedHours;
    if (updates.actualHours !== undefined) updateData.actual_hours = updates.actualHours;
    if (updates.tags !== undefined) updateData.tags = updates.tags;

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating task:', error);
      throw new Error(`Failed to update task: ${error.message}`);
    }

    // Get subtasks
    const { data: subtasks } = await supabase
      .from('subtasks')
      .select('*')
      .eq('task_id', id);

    const taskSubtasks = (subtasks || []).map(st => ({
      id: st.id,
      title: st.title,
      completed: st.completed,
      createdAt: new Date(st.created_at),
    }));

    return transformTaskFromDB(data, taskSubtasks);
  },

  async deleteTask(id: string): Promise<boolean> {
    ensureSupabaseConfigured();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Delete subtasks first
    await supabase
      .from('subtasks')
      .delete()
      .eq('task_id', id);

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('❌ Error deleting task:', error);
      throw new Error(`Failed to delete task: ${error.message}`);
    }

    return true;
  },

  async addSubtask(taskId: string, title: string): Promise<SubTask> {
    ensureSupabaseConfigured();
    
    const { data, error } = await supabase
      .from('subtasks')
      .insert({
        task_id: taskId,
        title,
        completed: false,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error adding subtask:', error);
      throw new Error(`Failed to add subtask: ${error.message}`);
    }
    
    return {
      id: data.id,
      title: data.title,
      completed: data.completed,
      createdAt: new Date(data.created_at),
    };
  },

  async updateSubtask(taskId: string, subtaskId: string, updates: { title?: string; completed?: boolean }): Promise<boolean> {
    ensureSupabaseConfigured();
    
    const { error } = await supabase
      .from('subtasks')
      .update(updates)
      .eq('id', subtaskId)
      .eq('task_id', taskId);

    if (error) {
      console.error('❌ Error updating subtask:', error);
      throw new Error(`Failed to update subtask: ${error.message}`);
    }
    
    return true;
  },

  async deleteSubtask(taskId: string, subtaskId: string): Promise<boolean> {
    ensureSupabaseConfigured();
    
    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', subtaskId)
      .eq('task_id', taskId);

    if (error) {
      console.error('❌ Error deleting subtask:', error);
      throw new Error(`Failed to delete subtask: ${error.message}`);
    }
    
    return true;
  },

  // Real-time subscriptions
  subscribeToIdeas(callback: (ideas: Idea[]) => void) {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured, skipping real-time subscription');
      return { unsubscribe: () => {} };
    }

    return supabase
      .channel('ideas_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ideas' },
        () => {
          // Refetch ideas when changes occur
          this.getIdeas().then(callback).catch(console.error);
        }
      )
      .subscribe();
  },

  subscribeToTasks(callback: (tasks: Task[]) => void) {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured, skipping real-time subscription');
      return { unsubscribe: () => {} };
    }

    return supabase
      .channel('tasks_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          this.getTasks().then(callback).catch(console.error);
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'subtasks' },
        () => {
          this.getTasks().then(callback).catch(console.error);
        }
      )
      .subscribe();
  },
};