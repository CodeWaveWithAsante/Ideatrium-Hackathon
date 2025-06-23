'use client';

import { useState } from 'react';
import { useIdeas } from '@/hooks/use-ideas';
import { useTasks } from '@/hooks/use-tasks';
import { useAuth } from '@/lib/auth-context';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Header } from '@/components/header';
import { IdeaCaptureForm } from '@/components/idea-capture-form';
import { IdeaCaptureModal } from '@/components/idea-capture-modal';
import { IdeasGrid } from '@/components/ideas-grid';
import { EisenhowerMatrix } from '@/components/eisenhower-matrix';
import { AdvancedFilterPanel } from '@/components/advanced-filter-panel';
import { BulkActionsPanel } from '@/components/bulk-actions-panel';
import { InsightsDashboard } from '@/components/insights-dashboard';
import { IdeaRoulette } from '@/components/idea-roulette';
import { StatsDashboard } from '@/components/stats-dashboard';
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts';
import { DebugPanel } from '@/components/debug-panel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { 
  Grid3X3, 
  List, 
  CheckSquare, 
  Target, 
  Brain, 
  Shuffle, 
  BarChart3,
  Sparkles,
  Cloud,
  Plus,
  Lightbulb
} from 'lucide-react';
import { IdeaFormData, TaskFormData } from '@/lib/types';
import Link from 'next/link';
import { SpinnerLoader } from "@/components/spinner-loader";
import Image from 'next/image';

function HomePage() {
  const { user } = useAuth();
  const {
    activeIdeas,
    archivedIdeas,
    addIdea,
    updateIdea,
    deleteIdea,
    archiveIdea,
    restoreIdea,
    bulkUpdateIdeas,
    bulkDeleteIdeas,
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
    applyFilterPreset,
    clearAllFilters,
  } = useIdeas();

  const { addTask, allTasks } = useTasks();

  const [showArchived, setShowArchived] = useState(false);
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'matrix'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [enableBulkSelect, setEnableBulkSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('ideas');

  const handleAddIdea = async (data: IdeaFormData) => {
    try {
      console.log('🚀 Attempting to add idea:', data);
      const newIdea = await addIdea(data);
      toast.success('Idea created successfully!', {
        description: `"${newIdea.title}" has been added to your collection.`,
        action: {
          label: 'View',
          onClick: () => setActiveTab('ideas'),
        },
      });
    } catch (error: any) {
      console.error('❌ Failed to create idea:', error);
      toast.error('Failed to create idea', {
        description: error.message || 'Please try again.',
      });
    }
  };

  const handleUpdateIdea = async (id: string, updates: Partial<Omit<import('@/lib/types').Idea, 'id' | 'createdAt'>>) => {
    try {
      await updateIdea(id, updates);
      toast.success('Idea updated!', {
        description: 'Your changes have been saved to the cloud.',
      });
    } catch (error: any) {
      toast.error('Failed to update idea', {
        description: error.message || 'Please try again.',
      });
    }
  };

  const handleDeleteIdea = async (id: string) => {
    try {
      await deleteIdea(id);
      toast.success('Idea deleted', {
        description: 'The idea has been permanently removed.',
      });
    } catch (error: any) {
      toast.error('Failed to delete idea', {
        description: error.message || 'Please try again.',
      });
    }
  };

  const handleArchiveIdea = async (id: string) => {
    try {
      await archiveIdea(id);
      toast.success('Idea archived', {
        description: 'The idea has been moved to your archive.',
      });
    } catch (error: any) {
      toast.error('Failed to archive idea', {
        description: error.message || 'Please try again.',
      });
    }
  };

  const handleRestoreIdea = async (id: string) => {
    try {
      await restoreIdea(id);
      toast.success('Idea restored', {
        description: 'The idea has been moved back to active ideas.',
      });
    } catch (error: any) {
      toast.error('Failed to restore idea', {
        description: error.message || 'Please try again.',
      });
    }
  };

  const handleBulkUpdate = async (ids: string[], updates: Partial<Omit<import('@/lib/types').Idea, 'id' | 'createdAt'>>) => {
    try {
      await bulkUpdateIdeas(ids, updates);
      toast.success(`${ids.length} ideas updated`, {
        description: 'Bulk changes have been applied successfully.',
      });
      setSelectedIds([]);
    } catch (error: any) {
      toast.error('Failed to update ideas', {
        description: error.message || 'Please try again.',
      });
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    try {
      await bulkDeleteIdeas(ids);
      toast.success(`${ids.length} ideas deleted`, {
        description: 'Selected ideas have been permanently removed.',
      });
      setSelectedIds([]);
    } catch (error: any) {
      toast.error('Failed to delete ideas', {
        description: error.message || 'Please try again.',
      });
    }
  };

  const handleConvertToTask = async (ideaId: string, taskData: TaskFormData) => {
    try {
      const newTask = await addTask(ideaId, taskData);
      toast.success('Task created!', {
        description: `"${newTask.title}" has been added to your task list.`,
        action: {
          label: 'View Tasks',
          onClick: () => window.open('/tasks', '_blank'),
        },
      });
    } catch (error: any) {
      toast.error('Failed to create task', {
        description: error.message || 'Please try again.',
      });
    }
  };

  const handleToggleArchived = () => {
    setShowArchived(!showArchived);
    setSelectedIds([]);
    setEnableBulkSelect(false);
    
    toast.info(showArchived ? 'Viewing active ideas' : 'Viewing archived ideas', {
      description: showArchived ? 'Switched to your active idea collection.' : 'Switched to your archived ideas.',
    });
  };

  const handleNewIdea = () => {
    setShowCaptureModal(true);
    setShowArchived(false);
    setActiveTab('ideas');
  };

  const handleToggleBulkSelect = () => {
    setEnableBulkSelect(!enableBulkSelect);
    setSelectedIds([]);
    
    if (!enableBulkSelect) {
      toast.info('Bulk selection enabled', {
        description: 'Select multiple ideas to perform bulk actions.',
      });
    }
  };

  const handleApplyFilterPreset = (preset: string) => {
    applyFilterPreset(preset);
    toast.info('Filter preset applied', {
      description: `Applied "${preset}" filter to your ideas.`,
    });
  };

  const handleClearAllFilters = () => {
    clearAllFilters();
    toast.info('Filters cleared', {
      description: 'All filters have been reset to default.',
    });
  };

  // Keyboard shortcut handlers
  const handleToggleSearch = () => {
    const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      toast.info('Search focused', {
        description: 'Start typing to search your ideas.',
      });
    }
  };

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
    toast.info(showFilters ? 'Filters collapsed' : 'Filters expanded', {
      description: showFilters ? 'Filter panel has been hidden.' : 'Filter panel is now visible.',
    });
  };

  const handleToggleView = () => {
    if (activeTab === 'ideas' && !showArchived) {
      const newMode = viewMode === 'grid' ? 'matrix' : 'grid';
      setViewMode(newMode);
      toast.info(`Switched to ${newMode} view`, {
        description: newMode === 'matrix' ? 'Ideas organized by Eisenhower Matrix.' : 'Ideas displayed in grid layout.',
      });
    }
  };

  const handleOpenRoulette = () => {
    setActiveTab('roulette');
    toast.info('Idea Roulette opened', {
      description: 'Discover random inspiration from your ideas!',
    });
  };

  if (isLoading) {
    return (
      <SpinnerLoader 
        title="Loading your ideas..."
        message="Preparing your creative workspace"
        />
    );
  }

  const currentIdeas = showArchived ? archivedIdeas : activeIdeas;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header
        activeCount={activeIdeas.length}
        archivedCount={archivedIdeas.length}
        showArchived={showArchived}
        onToggleArchived={handleToggleArchived}
        onNewIdea={handleNewIdea}
      />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className=" mb-12 animate-in fade-in duration-1000">
          <div className="flex items-center justify-center gap-3 mb-6 animate-in slide-in-from-top duration-700">
            <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-3xl group-hover:scale-105 transition-transform duration-300">
                  <Lightbulb className="h-12 w-12 text-white" />
                </div>
              </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Ideatrium
              </h1>
              <p className="text-lg text-muted-foreground mt-1">Transform thoughts into action</p>
            </div>
            {user && (
              <div className="flex items-center gap-2 ml-4 animate-in slide-in-from-right duration-700 delay-300">
                <div className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 dark:bg-opacity-20 rounded-full hover:bg-green-200 dark:hover:bg-green-900 dark:hover:bg-opacity-30 transition-colors duration-200">
                  <Cloud className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">Synced</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-center gap-4 mb-8 animate-in slide-in-from-bottom duration-700 delay-200">
            <KeyboardShortcuts
              onNewIdea={handleNewIdea}
              onToggleSearch={handleToggleSearch}
              onToggleFilters={handleToggleFilters}
              onToggleView={handleToggleView}
              onToggleArchived={handleToggleArchived}
              onOpenRoulette={handleOpenRoulette}
            />
            
            <Link href="/tasks">
              <Button variant="outline" size="sm" className="gap-2 bg-white bg-opacity-50 backdrop-blur-sm border-white border-opacity-20 hover:bg-white hover:bg-opacity-70 hover:scale-105 transition-all duration-200">
                <Target className="h-4 w-4" />
                View Tasks
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center animate-in slide-in-from-bottom duration-700 delay-400">
            <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-white bg-opacity-50 dark:bg-slate-800 dark:bg-opacity-50 backdrop-blur-sm border border-white border-opacity-20 dark:border-slate-700 dark:border-opacity-50">
              <TabsTrigger value="ideas" className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 hover:bg-white hover:bg-opacity-70 dark:hover:bg-slate-700 dark:hover:bg-opacity-70 transition-all duration-200">
                <Image 
                  src="/logo.svg" 
                  alt="Ideas" 
                  width={16} 
                  height={16}
                />
                Ideas
              </TabsTrigger>
              <TabsTrigger value="insights" className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 hover:bg-white hover:bg-opacity-70 dark:hover:bg-slate-700 dark:hover:bg-opacity-70 transition-all duration-200">
                <Brain className="h-4 w-4" />
                AI Insights
              </TabsTrigger>
              <TabsTrigger value="roulette" className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 hover:bg-white hover:bg-opacity-70 dark:hover:bg-slate-700 dark:hover:bg-opacity-70 transition-all duration-200">
                <Shuffle className="h-4 w-4" />
                Roulette
              </TabsTrigger>
              <TabsTrigger value="stats" className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 hover:bg-white hover:bg-opacity-70 dark:hover:bg-slate-700 dark:hover:bg-opacity-70 transition-all duration-200">
                <BarChart3 className="h-4 w-4" />
                Statistics
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="ideas" className="space-y-8 animate-in fade-in duration-500">
            {!showArchived && (
              <div className="relative animate-in slide-in-from-bottom duration-700 delay-200">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
                <div className="relative">
                  <IdeaCaptureForm
                    onToggleExpanded={() => setShowCaptureModal(true)}
                  />
                </div>
              </div>
            )}

            <IdeaCaptureModal
              open={showCaptureModal}
              onOpenChange={setShowCaptureModal}
              onSubmit={handleAddIdea}
            />

            <div className="animate-in slide-in-from-bottom duration-700 delay-300">
              <AdvancedFilterPanel
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
                selectedQuadrants={selectedQuadrants}
                onQuadrantsChange={setSelectedQuadrants}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
                onApplyPreset={handleApplyFilterPreset}
                onClearAll={handleClearAllFilters}
                isExpanded={showFilters}
                onToggleExpanded={() => setShowFilters(!showFilters)}
              />
            </div>

            {enableBulkSelect && (
              <div className="animate-in slide-in-from-top duration-500">
                <BulkActionsPanel
                  ideas={currentIdeas}
                  selectedIds={selectedIds}
                  onSelectionChange={setSelectedIds}
                  onBulkUpdate={handleBulkUpdate}
                  onBulkDelete={handleBulkDelete}
                  showArchived={showArchived}
                />
              </div>
            )}

            <div className="space-y-6 animate-in slide-in-from-bottom duration-700 delay-400">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {showArchived ? 'Archived Ideas' : 'Your Ideas'}
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {showArchived 
                      ? 'Ideas you\'ve archived for future reference'
                      : viewMode === 'matrix' 
                        ? 'Ideas organized by impact and effort using the Eisenhower Matrix'
                        : enableBulkSelect
                          ? 'Select multiple ideas to perform bulk actions'
                          : 'Capture and organize your brilliant ideas'
                    }
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  {!showArchived && currentIdeas.length > 0 && (
                    <>
                      <Button
                        variant={enableBulkSelect ? 'default' : 'outline'}
                        size="sm"
                        onClick={handleToggleBulkSelect}
                        className="gap-2 hover:scale-105 transition-all duration-200"
                      >
                        <CheckSquare className="h-4 w-4" />
                        Bulk Select
                      </Button>
                      
                      <div className="h-6 w-px bg-border opacity-50" />
                      
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="gap-2 hover:scale-105 transition-all duration-200 dark:text-white"
                      >
                        <List className="h-4 w-4" />
                        Grid
                      </Button>
                      <Button
                        variant={viewMode === 'matrix' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('matrix')}
                        className="gap-2 hover:scale-105 transition-all duration-200 dark:text-white"
                      >
                        <Grid3X3 className="h-4 w-4" />
                        Matrix
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="animate-in fade-in duration-700 delay-500">
                {!showArchived && viewMode === 'matrix' ? (
                  <EisenhowerMatrix
                    ideas={currentIdeas}
                    onUpdate={handleUpdateIdea}
                    onDelete={handleDeleteIdea}
                    onArchive={handleArchiveIdea}
                    showArchived={showArchived}
                  />
                ) : (
                  <IdeasGrid
                    ideas={currentIdeas}
                    onUpdate={handleUpdateIdea}
                    onDelete={handleDeleteIdea}
                    onArchive={!showArchived ? handleArchiveIdea : undefined}
                    onRestore={showArchived ? handleRestoreIdea : undefined}
                    onConvertToTask={handleConvertToTask}
                    showArchived={showArchived}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    enableBulkSelect={enableBulkSelect}
                  />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center mb-8 animate-in slide-in-from-top duration-700">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl group-hover:scale-105 transition-transform duration-300">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AI-Powered Insights
                </h2>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover patterns and get intelligent recommendations for your ideas using advanced AI analysis
              </p>
            </div>
            <div className="animate-in slide-in-from-bottom duration-700 delay-200">
              <InsightsDashboard ideas={activeIdeas} />
            </div>
          </TabsContent>

          <TabsContent value="roulette" className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center mb-8 animate-in slide-in-from-top duration-700">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-to-r from-orange-600 to-red-600 p-3 rounded-xl group-hover:scale-105 transition-transform duration-300">
                    <Shuffle className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Idea Roulette
                </h2>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover random inspiration from your idea collection and break through creative blocks
              </p>
            </div>
            <div className="animate-in slide-in-from-bottom duration-700 delay-200">
              <IdeaRoulette
                ideas={activeIdeas}
                onUpdate={handleUpdateIdea}
                onDelete={handleDeleteIdea}
                onArchive={handleArchiveIdea}
              />
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center mb-8 animate-in slide-in-from-top duration-700">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 p-3 rounded-xl group-hover:scale-105 transition-transform duration-300">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Statistics & Analytics
                </h2>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Track your creativity patterns and productivity metrics with detailed insights
              </p>
            </div>
            <div className="animate-in slide-in-from-bottom duration-700 delay-200">
              <StatsDashboard ideas={activeIdeas} tasks={allTasks} />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Debug Panel - Only visible in development */}
      {process.env.NODE_ENV === 'development' && <DebugPanel />}

      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
            backdropFilter: 'blur(8px)',
          },
        }}
      />
    </div>
  );
}

export default function Home() {
  return (
    <AuthGuard>
      <HomePage />
    </AuthGuard>
  );
}