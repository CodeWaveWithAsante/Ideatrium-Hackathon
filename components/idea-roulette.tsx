'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shuffle, 
  Play, 
  Pause, 
  RotateCcw,
  Lightbulb,
  TrendingUp,
  Zap,
  Target,
  Sparkles,
  Filter
} from 'lucide-react';
import { Idea } from '@/lib/types';
import { IdeaCard } from './idea-card';

interface IdeaRouletteProps {
  ideas: Idea[];
  onUpdate: (id: string, updates: Partial<Omit<Idea, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
  onArchive?: (id: string) => void;
}

export function IdeaRoulette({ ideas, onUpdate, onDelete, onArchive }: IdeaRouletteProps) {
  const [currentIdea, setCurrentIdea] = useState<Idea | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [filter, setFilter] = useState<'all' | 'high-impact' | 'low-effort' | 'quick-wins'>('all');
  const [spinHistory, setSpinHistory] = useState<string[]>([]);

  const getFilteredIdeas = () => {
    switch (filter) {
      case 'high-impact':
        return ideas.filter(idea => idea.impact >= 4);
      case 'low-effort':
        return ideas.filter(idea => idea.effort <= 2);
      case 'quick-wins':
        return ideas.filter(idea => idea.quadrant === 'q2');
      default:
        return ideas;
    }
  };

  const spinRoulette = () => {
    const filteredIdeas = getFilteredIdeas();
    if (filteredIdeas.length === 0) return;

    setIsSpinning(true);
    
    // Create spinning animation effect
    let spinCount = 0;
    const maxSpins = 10 + Math.floor(Math.random() * 10);
    
    const spinInterval = setInterval(() => {
      const randomIdea = filteredIdeas[Math.floor(Math.random() * filteredIdeas.length)];
      setCurrentIdea(randomIdea);
      spinCount++;
      
      if (spinCount >= maxSpins) {
        clearInterval(spinInterval);
        setIsSpinning(false);
        
        // Select final idea (avoid recent history)
        const availableIdeas = filteredIdeas.filter(idea => 
          !spinHistory.includes(idea.id)
        );
        
        const finalIdea = availableIdeas.length > 0 
          ? availableIdeas[Math.floor(Math.random() * availableIdeas.length)]
          : filteredIdeas[Math.floor(Math.random() * filteredIdeas.length)];
        
        setCurrentIdea(finalIdea);
        setSpinHistory(prev => [...prev.slice(-4), finalIdea.id]);
      }
    }, 100 + spinCount * 20); // Gradually slow down
  };

  const resetRoulette = () => {
    setCurrentIdea(null);
    setSpinHistory([]);
  };

  const filterOptions = [
    { id: 'all', label: 'All Ideas', icon: Lightbulb, count: ideas.length },
    { id: 'high-impact', label: 'High Impact', icon: TrendingUp, count: ideas.filter(i => i.impact >= 4).length },
    { id: 'low-effort', label: 'Low Effort', icon: Zap, count: ideas.filter(i => i.effort <= 2).length },
    { id: 'quick-wins', label: 'Quick Wins', icon: Target, count: ideas.filter(i => i.quadrant === 'q2').length },
  ];

  // Auto-select first idea if none selected
  useEffect(() => {
    if (!currentIdea && ideas.length > 0) {
      const filteredIdeas = getFilteredIdeas();
      if (filteredIdeas.length > 0) {
        setCurrentIdea(filteredIdeas[0]);
      }
    }
  }, [ideas, filter]);

  if (ideas.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="p-8 text-center">
          <Shuffle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">No Ideas for Roulette</h3>
          <p className="text-sm text-muted-foreground">
            Add some ideas to start discovering random inspiration!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Roulette Controls */}
      <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shuffle className="h-5 w-5 text-orange-600" />
            Idea Roulette
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              <Sparkles className="h-3 w-3 mr-1" />
              Inspiration Mode
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Filter Options */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Filter className="h-4 w-4" />
              Filter Ideas
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {filterOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.id}
                    variant={filter === option.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(option.id as any)}
                    disabled={option.count === 0}
                    className="gap-2 h-auto p-3 flex-col"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {option.count}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Spin Controls */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t">
            <Button
              onClick={spinRoulette}
              disabled={isSpinning || getFilteredIdeas().length === 0}
              className="gap-2 bg-orange-600 hover:bg-orange-700"
              size="lg"
            >
              {isSpinning ? (
                <>
                  <Pause className="h-5 w-5" />
                  Spinning...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Spin the Roulette
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={resetRoulette}
              disabled={isSpinning}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            {getFilteredIdeas().length > 0 ? (
              <>Discover random inspiration from {getFilteredIdeas().length} filtered ideas</>
            ) : (
              <>No ideas match the current filter</>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Idea Display */}
      {currentIdea && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">
              {isSpinning ? '🎲 Spinning...' : '✨ Your Random Idea'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isSpinning 
                ? 'Finding your next inspiration...' 
                : 'Here\'s a random idea to spark your creativity!'
              }
            </p>
          </div>
          
          <div className={`transition-all duration-300 ${isSpinning ? 'scale-95 opacity-70' : 'scale-100 opacity-100'}`}>
            <IdeaCard
              idea={currentIdea}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onArchive={onArchive}
              className="border-2 border-orange-300 shadow-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}