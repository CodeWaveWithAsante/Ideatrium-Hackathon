export interface Tag {
  id: string;
  name: string;
  color: string;
  category: 'preset' | 'custom';
}

export interface Idea {
  id: string;
  title: string;
  description?: string;
  tags: string[]; // Tag IDs
  impact: number; // 1-5 scale
  effort: number; // 1-5 scale
  quadrant: 'q1' | 'q2' | 'q3' | 'q4'; // Eisenhower Matrix quadrants
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'archived';
}

export interface Quadrant {
  id: 'q1' | 'q2' | 'q3' | 'q4';
  title: string;
  subtitle: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface FilterOptions {
  searchQuery: string;
  selectedTags: string[];
  selectedQuadrants: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy: 'date' | 'title' | 'impact' | 'effort';
  sortOrder: 'asc' | 'desc';
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface Task {
  id: string;
  ideaId: string;
  title: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  subtasks: SubTask[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// Re-export validation types for backward compatibility
export type { 
  IdeaFormData,
  TaskFormData,
  SignInFormData,
  SignUpFormData,
  ResetPasswordFormData,
  TagFormData,
  SubtaskFormData
} from './validations';