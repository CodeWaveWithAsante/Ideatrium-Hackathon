"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateAIInsights } from "@/lib/actions";
import { aiService } from "@/lib/ai-service";
import { Idea } from "@/lib/types";
import {
  BarChart3,
  Brain,
  CheckCircle2,
  Lightbulb,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

interface InsightsDashboardProps {
  ideas: Idea[];
}

interface AIInsight {
  type: "pattern" | "recommendation" | "trend" | "opportunity";
  title: string;
  description: string;
  confidence: number;
  actionable?: boolean;
}

export function InsightsDashboard({ ideas }: InsightsDashboardProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateInsights = async () => {
    if (ideas.length === 0) return;

    setIsLoading(true);
    try {
      const aiInsights = await aiService.generateInsights(ideas);

      setInsights(aiInsights);
      setHasGenerated(true);
    } catch (error) {
      console.error("Error generating insights:", error);
      // Generate fallback insights
      setInsights(generateFallbackInsights());
      setHasGenerated(true);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackInsights = (): AIInsight[] => {
    const totalIdeas = ideas.length;
    const highImpactIdeas = ideas.filter((idea) => idea.impact >= 4).length;
    const lowEffortIdeas = ideas.filter((idea) => idea.effort <= 2).length;
    const quickWins = ideas.filter((idea) => idea.quadrant === "q2").length;

    return [
      {
        type: "pattern",
        title: "Idea Distribution Pattern",
        description: `You have ${totalIdeas} ideas with ${highImpactIdeas} high-impact concepts. ${Math.round(
          (highImpactIdeas / totalIdeas) * 100
        )}% of your ideas show strong potential.`,
        confidence: 0.9,
      },
      {
        type: "opportunity",
        title: "Quick Wins Available",
        description: `${quickWins} ideas are in the "Do First" quadrant - these are your immediate opportunities for high-impact, low-effort wins.`,
        confidence: 0.85,
        actionable: true,
      },
      {
        type: "recommendation",
        title: "Focus Recommendation",
        description:
          lowEffortIdeas > 0
            ? `Consider starting with ${lowEffortIdeas} low-effort ideas to build momentum.`
            : "Focus on breaking down high-effort ideas into smaller, manageable tasks.",
        confidence: 0.8,
        actionable: true,
      },
      {
        type: "trend",
        title: "Creativity Trend",
        description: `Your ideas span ${
          new Set(ideas.flatMap((idea) => idea.tags)).size
        } different categories, showing diverse thinking patterns.`,
        confidence: 0.75,
      },
    ];
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "pattern":
        return BarChart3;
      case "recommendation":
        return Target;
      case "trend":
        return TrendingUp;
      case "opportunity":
        return Zap;
      default:
        return Lightbulb;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "pattern":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "recommendation":
        return "bg-green-50 border-green-200 text-green-800";
      case "trend":
        return "bg-purple-50 border-purple-200 text-purple-800";
      case "opportunity":
        return "bg-orange-50 border-orange-200 text-orange-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  // Auto-generate insights when ideas change
  useEffect(() => {
    if (ideas.length > 0 && !hasGenerated) {
      generateInsights();
    }
  }, [ideas.length]);

  if (ideas.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="p-8 text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">No Ideas to Analyze</h3>
          <p className="text-sm text-muted-foreground">
            Add some ideas to get AI-powered insights and patterns.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader>
        <div className="flex flex-col md:flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Insights Dashboard
            <Badge
              variant="secondary"
              className="bg-purple-100 text-purple-700"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {ideas.length} Ideas Analyzed
            </Badge>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={generateInsights}
            disabled={isLoading}
            className="gap-2 w-full md:w-auto mt-4 md:mt-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isLoading ? "Analyzing..." : "Refresh Insights"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4 md:p-8">
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-purple-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              AI is analyzing your idea patterns...
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-purple-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-purple-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => {
              const Icon = getInsightIcon(insight.type);
              const colorClass = getInsightColor(insight.type);

              return (
                <Card key={index} className={`${colorClass} border-2`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white/80 rounded-lg">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm">
                            {insight.title}
                          </h4>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-current opacity-60" />
                            <span className="text-xs opacity-80">
                              {Math.round(insight.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                        <p className="text-sm opacity-90 leading-relaxed">
                          {insight.description}
                        </p>
                        {insight.actionable && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Actionable
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center pt-4 border-t">
          <Brain className="h-3 w-3 inline mr-1" />
          AI insights help you understand patterns and optimize your idea
          development process
        </div>
      </CardContent>
    </Card>
  );
}
