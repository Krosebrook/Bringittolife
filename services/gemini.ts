
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI, Part, GenerateContentParameters } from "@google/genai";
import { GeneratedImageResult } from "../types";

const CONFIG = {
  MODELS: {
    TEXT: 'gemini-3-pro-preview',
    IMAGE: 'gemini-2.5-flash-image',
  },
  GENERATION: {
    temperature: 0.3, // Lowered for higher code consistency
    topP: 0.9,
  }
};

const SYSTEM_INSTRUCTION = `You are a world-class AI Architect. 
Return ONLY high-fidelity, interactive HTML5/Tailwind/VanillaJS code. 
Must start with <!DOCTYPE html>. 
No markdown markers unless strictly necessary. 
No text before or after the code block.`;

class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API_KEY environment variable is not defined.");
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateArtifact(prompt: string, fileBase64?: string, mimeType?: string): Promise<string> {
    const parts = this.prepareParts(prompt, fileBase64, mimeType);

    try {
      const response = await this.ai.models.generateContent({
        model: CONFIG.MODELS.TEXT,
        contents: { parts },
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: CONFIG.GENERATION.temperature,
          topP: CONFIG.GENERATION.topP,
        },
      });

      return this.extractRobustHtml(response.text || "");
    } catch (error) {
      console.error("[GeminiService] Content generation failed:", error);
      throw new Error("The manifestation gateway timed out. Please verify your prompt or image clarity.");
    }
  }

  /**
   * Multi-pass HTML Extraction
   * Pass 1: Look for standard doctype
   * Pass 2: Look for html tags
   * Pass 3: Look for markdown code blocks
   * Pass 4: Greedy capture between first and last tags
   */
  private extractRobustHtml(text: string): string {
    const trimmed = text.trim();
    
    // Pass 1 & 2
    const docMatch = trimmed.match(/<!DOCTYPE html>[\s\S]*?<\/html>/i) || 
                     trimmed.match(/<html[\s\S]*?<\/html>/i);
    if (docMatch) return docMatch[0];

    // Pass 3: Markdown Extraction with cleaning
    const mdMatch = trimmed.match(/```(?:html)?\s*([\s\S]*?)\s*```/i);
    if (mdMatch) return mdMatch[1];

    // Pass 4: Heuristic fallback
    if (trimmed.toLowerCase().includes('<body') || trimmed.toLowerCase().includes('<div')) {
      return trimmed;
    }

    return "<!-- System Error: Failed to extract valid manifest from model response. -->";
  }

  async generateStarterImage(prompt: string): Promise<GeneratedImageResult> {
    try {
      const response = await this.ai.models.generateContent({
        model: CONFIG.MODELS.IMAGE,
        contents: { parts: [{ text: `High fidelity UI concept sketch: ${prompt}` }] }
      });

      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (!part?.inlineData) throw new Error("Image synthesis rejected.");

      return {
        base64: part.inlineData.data,
        mimeType: part.inlineData.mimeType || 'image/png'
      };
    } catch (error) {
      console.error("[GeminiService] Seed generation failed:", error);
      throw error;
    }
  }

  private prepareParts(prompt: string, fileBase64?: string, mimeType?: string): Part[] {
    const parts: Part[] = [{ text: prompt || "Manifest a functional tool or experience based on this artifact." }];
    if (fileBase64 && mimeType) {
      parts.push({ inlineData: { data: fileBase64, mimeType } });
    }
    return parts;
  }
}

export const geminiService = new GeminiService();
