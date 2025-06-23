'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Zap,
  Lightbulb,
  Archive,
  CheckCircle2,
  Clock,
  Calendar,
  Brain
} from 'lucide-react';
import { Idea, Task } from '@/lib/types';
import { format, subDays, isAfter } from 'date-fns';

interface StatsDashboardProps {
  ideas: Idea[];
  tasks?: Task[];
}

export function StatsDashboard({ ideas, tasks = [] }: StatsDashboardProps) {
  const stats = useMemo(() => {
    const totalIdeas = ideas.length;
    const activeIdeas = ideas.filter(idea => idea.status === 'active').length;
    const archivedIdeas = ideas.filter(idea => idea.status === 'archived').length;
    
    // Quadrant distribution
    const quadrantCounts = {
      q1: ideas.filter(idea => idea.quadrant === 'q1').length,
      q2: ideas.filter(idea => idea.quadrant === 'q2').length,
      q3: ideas.filter(idea => idea.quadrant === 'q3').length,
      q4: ideas.filter(idea => idea.quadrant === 'q4').length,
    };

    // Impact/Effort averages
    const avgImpact = totalIdeas > 0 ? 
      ideas.reduce((sum, idea) => sum + idea.impact, 0) / totalIdeas : 0;
    const avgEffort = totalIdeas > 0 ? 
      ideas.reduce((sum, idea) => sum + idea.effort, 0) / totalIdeas : 0;

    // Recent activity (last 7 days)
    const sevenDaysAgo = subDays(new Date(), 7);
    const recentIdeas = ideas.filter(idea => isAfter(idea.createdAt, sevenDaysAgo)).length;

    // Task stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Tag usage
    const allTags = ideas.flatMap(idea => idea.tags || []);
    const uniqueTags = new Set(allTags).size;
    const avgTagsPerIdea = totalIdeas > 0 ? allTags.length / totalIdeas : 0;

    return {
      totalIdeas,
      activeIdeas,
      archivedIdeas,
      quadrantCounts,
      avgImpact,
      avgEffort,
      recentIdeas,
      totalTasks,
      completedTasks,
      taskCompletionRate,
      uniqueTags,
      avgTagsPerIdea,
    };
  }, [ideas, tasks]);

  const quadrantData = [
    { id: 'q2', name: 'Do First', count: stats.quadrantCounts.q2, color: '#10B981', description: 'High Impact, Low Effort' },
    { id: 'q1', name: 'Plan', count: stats.quadrantCounts.q1, color: '#F59E0B', description: 'High Impact, High Effort' },
    { id: 'q4', name: 'Optional', count: stats.quadrantCounts.q4, color: '#6B7280', description: 'Low Impact, Low Effort' },
    { id: 'q3', name: 'Reconsider', count: stats.quadrantCounts.q3, color: '#EF4444', description: 'Low Impact, High Effort' },
  ];

  const statCards = [
    {
      title: 'Total Ideas',
      value: stats.totalIdeas,
      icon: Lightbulb,
      color: '#3B82F6',
      bgColor: 'bg-blue-50',
      description: `${stats.activeIdeas} active, ${stats.archivedIdeas} archived`,
    },
    {
      title: 'Recent Activity',
      value: stats.recentIdeas,
      icon: Calendar,
      color: '#10B981',
      bgColor: 'bg-green-50',
      description: 'Ideas added in last 7 days',
    },
    {
      title: 'Average Impact',
      value: stats.avgImpact.toFixed(1),
      icon: TrendingUp,
      color: '#8B5CF6',
      bgColor: 'bg-purple-50',
      description: 'Out of 5.0 scale',
    },
    {
      title: 'Average Effort',
      value: stats.avgEffort.toFixed(1),
      icon: Zap,
      color: '#F59E0B',
      bgColor: 'bg-amber-50',
      description: 'Out of 5.0 scale',
    },
  ];

  if (stats.totalIdeas === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="p-8 text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">No Statistics Available</h3>
          <p className="text-sm text-muted-foreground">
            Add some ideas to see your creativity statistics and insights.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className="h-4 w-4" style={{ color: stat.color }} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quadrant Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Priority Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quadrantData.map((quadrant) => {
              const percentage = stats.totalIdeas > 0 ? (quadrant.count / stats.totalIdeas) * 100 : 0;
              
              return (
                <div key={quadrant.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: quadrant.color }}
                      />
                      <span className="font-medium">{quadrant.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({quadrant.description})
                      </span>
                    </div>
                    <Badge variant="secondary">
                      {quadrant.count}
                    </Badge>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-2"
                    style={{ 
                      '--progress-background': quadrant.color + '20',
                      '--progress-foreground': quadrant.color 
                    } as any}
                  />
                  <div className="text-xs text-muted-foreground text-right">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Organization & Productivity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Organization Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Unique Tags Used</span>
                <Badge variant="outline">{stats.uniqueTags}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avg Tags per Idea</span>
                <Badge variant="outline">{stats.avgTagsPerIdea.toFixed(1)}</Badge>
              </div>

              {stats.totalTasks > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tasks Created</span>
                    <Badge variant="outline">{stats.totalTasks}</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Task Completion Rate</span>
                      <Badge variant="outline">{stats.taskCompletionRate.toFixed(1)}%</Badge>
                    </div>
                    <Progress value={stats.taskCompletionRate} className="h-2" />
                  </div>
                </>
              )}

              <div className="pt-2 border-t">
                <div className="text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 inline mr-1" />
                  {stats.recentIdeas > 0 ? (
                    <>You've been actively adding ideas recently!</>
                  ) : (
                    <>Consider adding some new ideas to keep the momentum going.</>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}