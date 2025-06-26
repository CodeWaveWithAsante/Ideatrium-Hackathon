"use server";

import { aiService } from "./ai-service";
// import { getAIService } from "./ai-service";
import { Idea } from "./types";

export async function generateAISuggestions(idea: Idea) {
  console.log("SERVER-SIDE ACTION ");
  const ai = aiService;
  //   const ai = getAIService();

  return ai.generateSuggestions(idea);
}

export async function generateAIInsights(ideas: Idea[]) {
  //   const ai = getAIService();
  return aiService.generateInsights(ideas);
}
