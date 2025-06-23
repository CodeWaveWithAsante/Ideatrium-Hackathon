'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Idea, FilterOptions } from '@/lib/types';
import { supabaseStorage } from '@/lib/supabase-storage';
import { useAuth } from '@/lib/auth-context';

export function useIdeas() {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedQuadrants, setSelectedQuadrants] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'impact' | 'effort'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [initialized, setInitialized] = useState(false);

  // Load ideas when user is authenticated
  useEffect(() => {
    let mounted = true;
    let subscription: any = null;

    if (!user) {
      setIdeas([]);
      setIsLoading(false);
      setInitialized(false);
      return;
    }

    const loadIdeas = async () => {
      if (!mounted) return;
      
      try {
        setIsLoading(true);
        const userIdeas = await supabaseStorage.getIdeas();
        if (mounted) {
          setIdeas(userIdeas);
          setInitialized(true);
        }
      } catch (error) {
        console.error('Error loading ideas:', error);
        if (mounted) {
          setIdeas([]);
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
      loadIdeas();
    }

    // Set up real-time subscription only after initial load
    if (initialized) {
      subscription = supabaseStorage.subscribeToIdeas((newIdeas) => {
        if (mounted) {
          setIdeas(newIdeas);
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

  const addIdea = useCallback(async (ideaData: { 
    title: string; 
    description?: string; 
    tags?: string[];
    impact?: number;
    effort?: number;
  }) => {
    if (!user) throw new Error('User not authenticated');
    
    const newIdea = await supabaseStorage.addIdea(ideaData);
    setIdeas(prev => [newIdea, ...prev]);
    return newIdea;
  }, [user]);

  const updateIdea = useCallback(async (id: string, updates: Partial<Omit<Idea, 'id' | 'createdAt'>>) => {
    if (!user) throw new Error('User not authenticated');
    
    const updatedIdea = await supabaseStorage.updateIdea(id, updates);
    setIdeas(prev => prev.map(idea => idea.id === id ? updatedIdea : idea));
    return updatedIdea;
  }, [user]);

  const deleteIdea = useCallback(async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    
    const success = await supabaseStorage.deleteIdea(id);
    if (success) {
      setIdeas(prev => prev.filter(idea => idea.id !== id));
    }
    return success;
  }, [user]);

  const archiveIdea = useCallback(async (id: string) => {
    return updateIdea(id, { status: 'archived' });
  }, [updateIdea]);

  const restoreIdea = useCallback(async (id: string) => {
    return updateIdea(id, { status: 'active' });
  }, [updateIdea]);

  // Bulk operations
  const bulkUpdateIdeas = useCallback(async (ids: string[], updates: Partial<Omit<Idea, 'id' | 'createdAt'>>) => {
    if (!user) throw new Error('User not authenticated');
    
    const success = await supabaseStorage.bulkUpdateIdeas(ids, updates);
    if (success) {
      // Refetch ideas to get updated data
      const userIdeas = await supabaseStorage.getIdeas();
      setIdeas(userIdeas);
    }
    return success;
  }, [user]);

  const bulkDeleteIdeas = useCallback(async (ids: string[]) => {
    if (!user) throw new Error('User not authenticated');
    
    const success = await supabaseStorage.bulkDeleteIdeas(ids);
    if (success) {
      setIdeas(prev => prev.filter(idea => !ids.includes(idea.id)));
    }
    return success;
  }, [user]);

  // Advanced filtering and sorting
  const filteredAndSortedIdeas = useMemo(() => {
    let filtered = ideas;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(idea => 
        idea.title.toLowerCase().includes(query) ||
        (idea.description && idea.description.toLowerCase().includes(query))
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(idea => 
        selectedTags.some(tagId => idea.tags?.includes(tagId))
      );
    }

    // Filter by selected quadrants
    if (selectedQuadrants.length > 0) {
      filtered = filtered.filter(idea => 
        selectedQuadrants.includes(idea.quadrant)
      );
    }

    // Sort ideas
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'impact':
          comparison = a.impact - b.impact;
          break;
        case 'effort':
          comparison = a.effort - b.effort;
          break;
        case 'date':
        default:
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [ideas, searchQuery, selectedTags, selectedQuadrants, sortBy, sortOrder]);

  const activeIdeas = filteredAndSortedIdeas.filter(idea => idea.status === 'active');
  const archivedIdeas = filteredAndSortedIdeas.filter(idea => idea.status === 'archived');

  // Filter presets
  const applyFilterPreset = useCallback((preset: string) => {
    switch (preset) {
      case 'high-impact':
        setSelectedQuadrants(['q1', 'q2']);
        setSortBy('impact');
        setSortOrder('desc');
        break;
      case 'quick-wins':
        setSelectedQuadrants(['q2']);
        setSortBy('effort');
        setSortOrder('asc');
        break;
      case 'recent':
        setSelectedQuadrants([]);
        setSortBy('date');
        setSortOrder('desc');
        break;
      case 'needs-planning':
        setSelectedQuadrants(['q1']);
        setSortBy('impact');
        setSortOrder('desc');
        break;
      default:
        break;
    }
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedTags([]);
    setSelectedQuadrants([]);
    setSortBy('date');
    setSortOrder('desc');
  }, []);

  return {
    ideas: filteredAndSortedIdeas,
    activeIdeas,
    archivedIdeas,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedTags,
    setSelectedTags,
    selectedQuadrants,
    setSelectedQuadrants,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    addIdea,
    updateIdea,
    deleteIdea,
    archiveIdea,
    restoreIdea,
    bulkUpdateIdeas,
    bulkDeleteIdeas,
    applyFilterPreset,
    clearAllFilters,
  };
}