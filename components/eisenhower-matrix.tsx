'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  Rocket, 
  AlertTriangle, 
  Coffee,
  Grid3X3,
  List
} from 'lucide-react';
import { Idea, Quadrant } from '@/lib/types';
import { IdeaCard } from './idea-card';

interface EisenhowerMatrixProps {
  ideas: Idea[];
  onUpdate: (id: string, updates: Partial<Omit<Idea, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => void;
  showArchived?: boolean;
}

const QUADRANTS: Quadrant[] = [
  {
    id: 'q2',
    title: 'Do First',
    subtitle: 'High Impact, Low Effort',
    description: 'Quick wins that deliver maximum value',
    color: '#10B981',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    id: 'q1',
    title: 'Plan',
    subtitle: 'High Impact, High Effort',
    description: 'Important projects that need careful planning',
    color: '#F59E0B',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  {
    id: 'q4',
    title: 'Optional',
    subtitle: 'Low Impact, Low Effort',
    description: 'Nice-to-have ideas for spare time',
    color: '#6B7280',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
  {
    id: 'q3',
    title: 'Reconsider',
    subtitle: 'Low Impact, High Effort',
    description: 'Ideas that may not be worth the investment',
    color: '#EF4444',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
];

const getQuadrantIcon = (quadrantId: string) => {
  switch (quadrantId) {
    case 'q1': return Target;
    case 'q2': return Rocket;
    case 'q3': return AlertTriangle;
    case 'q4': return Coffee;
    default: return Target;
  }
};

export function EisenhowerMatrix({ 
  ideas, 
  onUpdate, 
  onDelete, 
  onArchive, 
  onRestore,
  showArchived = false 
}: EisenhowerMatrixProps) {
  const [viewMode, setViewMode] = useState<'matrix' | 'list'>('matrix');

  const getIdeasByQuadrant = (quadrantId: string) => {
    return ideas.filter(idea => idea.quadrant === quadrantId);
  };

  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Priority List View</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('matrix')}
            className="gap-2"
          >
            <Grid3X3 className="h-4 w-4" />
            Matrix View
          </Button>
        </div>

        {QUADRANTS.map((quadrant) => {
          const quadrantIdeas = getIdeasByQuadrant(quadrant.id);
          if (quadrantIdeas.length === 0) return null;

          const Icon = getQuadrantIcon(quadrant.id);

          return (
            <Card key={quadrant.id} className={`${quadrant.borderColor} border-2`}>
              <CardHeader className={`${quadrant.bgColor} pb-3`}>
                <CardTitle className="flex items-center gap-3">
                  <Icon className="h-5 w-5" style={{ color: quadrant.color }} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span>{quadrant.title}</span>
                      <Badge variant="secondary">{quadrantIdeas.length}</Badge>
                    </div>
                    <p className="text-sm font-normal text-muted-foreground">
                      {quadrant.subtitle}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quadrantIdeas.map((idea) => (
                    <IdeaCard
                      key={idea.id}
                      idea={idea}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                      onArchive={onArchive}
                      onRestore={onRestore}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Eisenhower Matrix</h3>
          <p className="text-sm text-muted-foreground">
            Ideas organized by impact and effort
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewMode('list')}
          className="gap-2"
        >
          <List className="h-4 w-4" />
          List View
        </Button>
      </div>

      {/* Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {QUADRANTS.map((quadrant) => {
          const quadrantIdeas = getIdeasByQuadrant(quadrant.id);
          const Icon = getQuadrantIcon(quadrant.id);

          return (
            <Card 
              key={quadrant.id} 
              className={`${quadrant.borderColor} border-2 min-h-[400px]`}
            >
              <CardHeader className={`${quadrant.bgColor} pb-3`}>
                <CardTitle className="flex items-center gap-3">
                  <Icon className="h-5 w-5" style={{ color: quadrant.color }} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span>{quadrant.title}</span>
                      <Badge variant="secondary">{quadrantIdeas.length}</Badge>
                    </div>
                    <p className="text-sm font-normal text-muted-foreground">
                      {quadrant.subtitle}
                    </p>
                  </div>
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {quadrant.description}
                </p>
              </CardHeader>
              
              <CardContent className="p-4 space-y-4">
                {quadrantIdeas.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No ideas in this quadrant</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {quadrantIdeas.map((idea) => (
                      <IdeaCard
                        key={idea.id}
                        idea={idea}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                        onArchive={onArchive}
                        onRestore={onRestore}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Legend */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span><strong>Do First:</strong> High impact, low effort</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span><strong>Plan:</strong> High impact, high effort</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span><strong>Optional:</strong> Low impact, low effort</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span><strong>Reconsider:</strong> Low impact, high effort</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}