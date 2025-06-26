import { Idea } from "./types";

interface AISuggestion {
  type: "impact" | "effort" | "tags" | "actionPlan" | "proscons";
  title: string;
  content: string | string[] | { pros: string[]; cons: string[] };
  confidence: number;
  reasoning?: string;
}

interface AIInsight {
  type: "pattern" | "recommendation" | "trend" | "opportunity";
  title: string;
  description: string;
  confidence: number;
  actionable?: boolean;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

class AIService {
  private apiKey: string | null;
  private baseUrl =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  constructor() {
    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!key) {
      throw new Error(
        "Gemini API key not found. Please set GEMINI_API_KEY in your environment variables."
      );
    }
    this.apiKey = key;
  }

  private async callGeminiAPI(prompt: string): Promise<string> {
    console.log("GEMINI API CALL", "SERVER-SIDE");

    if (!this.apiKey) {
      throw new Error(
        "Gemini API key not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY environment variable."
      );
    }

    const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        // safetySettings: [
        //   {
        //     category: "HARM_CATEGORY_HARASSMENT",
        //     threshold: "BLOCK_MEDIUM_AND_ABOVE",
        //   },
        //   {
        //     category: "HARM_CATEGORY_HATE_SPEECH",
        //     threshold: "BLOCK_MEDIUM_AND_ABOVE",
        //   },
        //   {
        //     category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        //     threshold: "BLOCK_MEDIUM_AND_ABOVE",
        //   },
        //   {
        //     category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        //     threshold: "BLOCK_MEDIUM_AND_ABOVE",
        //   },
        // ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Gemini API error: ${response.status} - ${
          errorData.error?.message || "Unknown error"
        }`
      );
    }

    const data: GeminiResponse = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No response generated from Gemini API");
    }

    return data.candidates[0].content.parts[0].text;
  }

  async generateSuggestions(idea: Idea): Promise<AISuggestion[]> {
    const prompt = `
Analyze this idea and provide suggestions in JSON format:

Title: "${idea.title}"
Description: "${idea.description || "No description provided"}"
Current Impact Score: ${idea.impact}/5
Current Effort Score: ${idea.effort}/5

Please provide a JSON response with the following structure:
{
  "suggestions": [
    {
      "type": "impact",
      "title": "Impact Score Suggestion",
      "content": "Suggested impact score with reasoning",
      "confidence": 0.85,
      "reasoning": "Why this impact score makes sense"
    },
    {
      "type": "effort", 
      "title": "Effort Estimation",
      "content": "Suggested effort score with reasoning",
      "confidence": 0.78,
      "reasoning": "Why this effort estimate is appropriate"
    },
    {
      "type": "actionPlan",
      "title": "Suggested Action Plan", 
      "content": ["Step 1", "Step 2", "Step 3", "..."],
      "confidence": 0.92
    },
    {
      "type": "proscons",
      "title": "Pros & Cons Analysis",
      "content": {
        "pros": ["Advantage 1", "Advantage 2", "..."],
        "cons": ["Challenge 1", "Challenge 2", "..."]
      },
      "confidence": 0.88
    }
  ]
}

Focus on practical, actionable insights. Consider market viability, technical feasibility, and resource requirements.
`;

    try {
      const response = await this.callGeminiAPI(prompt);

      // Parse the JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid JSON response from AI");
      }

      const parsedResponse = JSON.parse(jsonMatch[0]);
      return parsedResponse.suggestions || [];
    } catch (error) {
      console.error("AI Service Error:", error);

      // Fallback to mock data if API fails
      return this.generateMockSuggestions(idea);
    }
  }

  private generateMockSuggestions(idea: Idea): AISuggestion[] {
    // Fallback mock suggestions when API is unavailable
    return [
      {
        type: "impact",
        title: "Impact Score Suggestion",
        content: `Based on analysis, suggested impact: ${Math.min(
          5,
          Math.max(1, idea.impact + (Math.random() > 0.5 ? 1 : -1))
        )}/5`,
        confidence: 0.75,
        reasoning: "API unavailable - using fallback analysis",
      },
      {
        type: "effort",
        title: "Effort Estimation",
        content: `Estimated effort level: ${Math.min(
          5,
          Math.max(1, idea.effort + (Math.random() > 0.5 ? 1 : -1))
        )}/5`,
        confidence: 0.7,
        reasoning: "API unavailable - using fallback analysis",
      },
      {
        type: "actionPlan",
        title: "Basic Action Plan",
        content: [
          "Research and validate the concept",
          "Create a detailed project outline",
          "Identify required resources",
          "Develop a prototype or MVP",
          "Test and gather feedback",
          "Iterate and improve",
        ],
        confidence: 0.8,
      },
      {
        type: "proscons",
        title: "General Analysis",
        content: {
          pros: [
            "Addresses a potential need",
            "Could provide value to users",
            "Opportunity for learning",
          ],
          cons: [
            "Requires time investment",
            "May face competition",
            "Success not guaranteed",
          ],
        },
        confidence: 0.65,
      },
    ];
  }

  async generateInsights(ideas: Idea[]): Promise<AIInsight[]> {
    if (ideas.length === 0) return [];

    const prompt = `
Analyze these ${
      ideas.length
    } ideas and provide insights about patterns, trends, and recommendations:

Ideas:
${ideas
  .map(
    (idea, i) =>
      `${i + 1}. "${idea.title}" (Impact: ${idea.impact}/5, Effort: ${
        idea.effort
      }/5, Quadrant: ${idea.quadrant})`
  )
  .join("\n")}

Provide insights in JSON format:
{
  "insights": [
    {
      "type": "pattern",
      "title": "Pattern Title",
      "description": "Description of the pattern found",
      "confidence": 0.85
    },
    {
      "type": "recommendation", 
      "title": "Recommendation Title",
      "description": "Actionable recommendation",
      "confidence": 0.90,
      "actionable": true
    },
    {
      "type": "trend",
      "title": "Trend Title", 
      "description": "Trend analysis",
      "confidence": 0.75
    },
    {
      "type": "opportunity",
      "title": "Opportunity Title",
      "description": "Opportunity identification", 
      "confidence": 0.80,
      "actionable": true
    }
  ]
}

Focus on:
1. Patterns in impact/effort distribution
2. Recommendations for prioritization
3. Trends in creativity/focus areas
4. Opportunities for quick wins
`;

    try {
      const response = await this.callGeminiAPI(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.insights || [];
      }
    } catch (error) {
      console.error("AI Insights Error:", error);
    }

    // Fallback insights
    return this.generateFallbackInsights(ideas);
  }

  private generateFallbackInsights(ideas: Idea[]): AIInsight[] {
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
  }
}

export const aiService = new AIService();

// let _aiService: AIService | null = null;

// export function getAIService() {
//   if (!_aiService) {
//     _aiService = new AIService();
//   }
//   return _aiService;
// }
