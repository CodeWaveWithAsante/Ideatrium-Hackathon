'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Brain, 
  Lightbulb, 
  Target, 
  TrendingUp, 
  Zap, 
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  BarChart3,
  ListChecks,
  ExternalLink
} from 'lucide-react';
import { Idea } from '@/lib/types';
import { aiService } from '@/lib/ai-service';

interface AIAssistantProps {
  idea: Idea;
  onUpdateIdea: (updates: Partial<Omit<Idea, 'id' | 'createdAt'>>) => void;
}

interface AISuggestion {
  type: 'impact' | 'effort' | 'tags' | 'actionPlan' | 'proscons';
  title: string;
  content: string | string[] | { pros: string[]; cons: string[] };
  confidence: number;
  reasoning?: string;
}

export function AIAssistant({ idea, onUpdateIdea }: AIAssistantProps) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newSuggestions = await aiService.generateSuggestions(idea);
      setSuggestions(newSuggestions);
      setHasGenerated(true);
      toast.success('AI suggestions generated!', {
        description: 'Review the AI recommendations for your idea.',
      });
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      setError('Failed to generate AI suggestions. Please try again.');
      toast.error('AI suggestions failed', {
        description: 'Unable to generate suggestions. Using fallback analysis.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySuggestion = (suggestion: AISuggestion) => {
    switch (suggestion.type) {
      case 'impact':
        if (typeof suggestion.content === 'string') {
          const impactMatch = suggestion.content.match(/(\d)/);
          if (impactMatch) {
            onUpdateIdea({ impact: parseInt(impactMatch[1]) });
            toast.success('Impact score updated!', {
              description: `Applied AI suggestion: ${impactMatch[1]}/5`,
            });
          }
        }
        break;
      case 'effort':
        if (typeof suggestion.content === 'string') {
          const effortMatch = suggestion.content.match(/(\d)/);
          if (effortMatch) {
            onUpdateIdea({ effort: parseInt(effortMatch[1]) });
            toast.success('Effort score updated!', {
              description: `Applied AI suggestion: ${effortMatch[1]}/5`,
            });
          }
        }
        break;
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'impact': return TrendingUp;
      case 'effort': return Zap;
      case 'tags': return Target;
      case 'actionPlan': return ListChecks;
      case 'proscons': return BarChart3;
      default: return Lightbulb;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-500';
    if (confidence >= 0.8) return 'bg-blue-500';
    if (confidence >= 0.7) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const renderSuggestionContent = (suggestion: AISuggestion) => {
    if (suggestion.type === 'proscons' && typeof suggestion.content === 'object' && 'pros' in suggestion.content) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h6 className="font-medium text-green-700 dark:text-green-400 mb-2 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              Pros
            </h6>
            <ul className="space-y-1">
              {suggestion.content.pros.map((pro, i) => (
                <li key={i} className="text-sm text-green-600 dark:text-green-400 flex items-start gap-1">
                  <div className="w-1 h-1 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                  {pro}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h6 className="font-medium text-red-700 dark:text-red-400 mb-2 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              Cons
            </h6>
            <ul className="space-y-1">
              {suggestion.content.cons.map((con, i) => (
                <li key={i} className="text-sm text-red-600 dark:text-red-400 flex items-start gap-1">
                  <div className="w-1 h-1 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                  {con}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    } else if (Array.isArray(suggestion.content)) {
      return (
        <ol className="space-y-2">
          {suggestion.content.map((step, i) => (
            <li key={i} className="text-sm flex items-start gap-2">
              <Badge variant="outline" className="text-xs px-2 py-0 mt-0.5">
                {i + 1}
              </Badge>
              {step}
            </li>
          ))}
        </ol>
      );
    } else if (typeof suggestion.content === 'string') {
      return (
        <p className="text-sm text-muted-foreground">{suggestion.content}</p>
      );
    } else {
      // Fallback for any unexpected content type
      return (
        <p className="text-sm text-muted-foreground">Content not available</p>
      );
    }
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 dark:border-purple-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          AI Assistant
          <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-800/50 dark:text-purple-300">
            <Sparkles className="h-3 w-3 mr-1" />
            Powered by Gemini
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!hasGenerated && !error && (
          <div className="text-center py-6">
            <Brain className="h-12 w-12 mx-auto mb-4 text-purple-400" />
            <h3 className="font-semibold mb-2">Get AI-Powered Insights</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Let AI analyze your idea and provide intelligent suggestions for impact, effort, and action plans.
            </p>
            <Button 
              onClick={handleGenerateSuggestions}
              disabled={isLoading}
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate AI Suggestions
                </>
              )}
            </Button>
          </div>
        )}

        {error && (
          <div className="text-center py-6">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-400" />
            <h3 className="font-semibold mb-2 text-red-700 dark:text-red-400">AI Service Unavailable</h3>
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
            <div className="space-y-2">
              <Button 
                onClick={handleGenerateSuggestions}
                variant="outline"
                className="gap-2"
              >
                <Brain className="h-4 w-4" />
                Try Again
              </Button>
              <p className="text-xs text-muted-foreground">
                <ExternalLink className="h-3 w-3 inline mr-1" />
                Requires Google Gemini API key configuration
              </p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
              <Loader2 className="h-4 w-4 animate-spin" />
              AI is analyzing your idea...
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-purple-200 dark:bg-purple-800 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-purple-100 dark:bg-purple-900 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-purple-800 dark:text-purple-200">AI Suggestions</h4>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleGenerateSuggestions}
                className="gap-2"
                disabled={isLoading}
              >
                <Brain className="h-4 w-4" />
                Regenerate
              </Button>
            </div>

            {suggestions.map((suggestion, index) => {
              const Icon = getSuggestionIcon(suggestion.type);
              
              return (
                <Card key={index} className="bg-white/80 dark:bg-gray-800/80 border border-purple-200 dark:border-purple-700">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-purple-600" />
                        <h5 className="font-medium">{suggestion.title}</h5>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <div 
                            className={`w-2 h-2 rounded-full ${getConfidenceColor(suggestion.confidence)}`}
                          />
                          <span className="text-xs text-muted-foreground">
                            {Math.round(suggestion.confidence * 100)}%
                          </span>
                        </div>
                        {(suggestion.type === 'impact' || suggestion.type === 'effort') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApplySuggestion(suggestion)}
                            className="gap-1"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Apply
                          </Button>
                        )}
                      </div>
                    </div>

                    {renderSuggestionContent(suggestion)}

                    {suggestion.reasoning && (
                      <div className="mt-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded text-xs text-purple-700 dark:text-purple-300">
                        <strong>AI Reasoning:</strong> {suggestion.reasoning}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          <Brain className="h-3 w-3 inline mr-1" />
          Powered by Google Gemini AI • Review suggestions carefully
        </div>
      </CardContent>
    </Card>
  );
}