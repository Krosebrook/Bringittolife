
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
    temperature: 0.3, 
    topP: 0.9,
  }
};

const SYSTEM_INSTRUCTION = `You are a world-class AI Architect. 
Return ONLY high-fidelity, interactive HTML5/Tailwind/VanillaJS code. 
Must start with <!DOCTYPE html>. 
No markdown markers unless strictly necessary. 
No text before or after the code block. 
Ensure accessibility (ARIA) and responsive design are built-in.`;

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

      const raw = response.text || "";
      return this.extractRobustHtml(raw);
    } catch (error) {
      console.error("[GeminiService] Content generation failed:", error);
      throw new Error("The manifestation gateway timed out or rejected the request. Please verify your prompt or image clarity.");
    }
  }

  /**
   * Multi-pass Heuristic HTML Extraction
   * Handles conversational filler, malformed markdown, and fragments.
   */
  private extractRobustHtml(text: string): string {
    const trimmed = text.trim();
    
    // Pass 1: Standard Full Document
    const fullDocMatch = trimmed.match(/<!DOCTYPE html>[\s\S]*?<\/html>/i);
    if (fullDocMatch) return fullDocMatch[0];

    // Pass 2: Root Tag Capture
    const htmlTagMatch = trimmed.match(/<html[\s\S]*?<\/html>/i);
    if (htmlTagMatch) return htmlTagMatch[0];

    // Pass 3: Markdown Block Extraction
    const mdBlockMatch = trimmed.match(/```(?:html|xml)?\s*([\s\S]*?)\s*```/i);
    if (mdBlockMatch) return mdBlockMatch[1];

    // Pass 4: Greedy Fragment Recovery
    const fragmentMatch = trimmed.match(/<(head|body|div|section)[\s\S]*<\/\1>/i);
    if (fragmentMatch) return fragmentMatch[0];

    // Fallback: If it looks like code, return as-is
    if (trimmed.includes('<') && trimmed.includes('>')) {
      return trimmed;
    }

    return "<!-- Error: Failed to extract artifact logic from model response. -->";
  }

  async generateStarterImage(prompt: string): Promise<GeneratedImageResult> {
    try {
      const response = await this.ai.models.generateContent({
        model: CONFIG.MODELS.IMAGE,
        contents: { parts: [{ text: `High fidelity UI concept or technical blueprint for: ${prompt}` }] }
      });

      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (!part?.inlineData) throw new Error("Image synthesis sequence failed.");

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
    const prefix = "Analyze these visual/textual signals and manifest a high-fidelity digital artifact. Use Tailwind for styling and Vanilla JS for interactions. Semantic HTML5 is mandatory.";
    const parts: Part[] = [{ text: prompt ? `${prefix}\n\nUser Request: ${prompt}` : prefix }];
    
    if (fileBase64 && mimeType) {
      parts.push({ inlineData: { data: fileBase64, mimeType } });
    }
    
    return parts;
  }
}

export const geminiService = new GeminiService();
