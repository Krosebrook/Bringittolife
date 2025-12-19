
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI, Part, GenerateContentParameters } from "@google/genai";
import { GeneratedImageResult } from "../types";

const CONFIG = {
  MODELS: {
    TEXT: 'gemini-3-pro-preview', // For complex reasoning and code generation
    IMAGE: 'gemini-2.5-flash-image', // For image generation
  },
  GENERATION: {
    temperature: 0.4,
    topP: 0.95,
  }
};

const SYSTEM_INSTRUCTION = `You are a world-class AI Architect and Product Designer.
Your mission: "Manifest digital reality from analog artifacts".

STRATEGIC DIRECTIVES:
1. ABSTRACT & ENHANCE: 
   - Napkin Sketches: Convert to modern, responsive, high-fidelity UI using Tailwind CSS.
   - Real-world Photos: Transform the essence into a Tool or Game.
2. VISUAL RESTRICTIONS:
   - ZERO EXTERNAL ASSETS: No img tags to external URLs.
   - NATIVE RENDERING: Use Tailwind colors, CSS Gradients, Lucide-style SVG paths.
3. SEMANTIC ARCHITECTURE:
   - Use clean, modular HTML5 tags: <header>, <main>, <section>, <footer>, <nav>, <article>.
   - These structural markers are critical for componentization.
4. INTERACTIVITY FIRST:
   - Every artifact must be "alive" with state management (JS) and transitions.
   - Use vanilla JS that is clear and well-commented.
5. PACKAGING:
   - Single-file HTML masterpiece starting with <!DOCTYPE html>.
   - Return ONLY the HTML. No conversational text outside markers.`;

class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API_KEY is missing from environment.");
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateArtifact(prompt: string, fileBase64?: string, mimeType?: string): Promise<string> {
    const parts: Part[] = this.prepareParts(prompt, fileBase64, mimeType);

    const params: GenerateContentParameters = {
      model: CONFIG.MODELS.TEXT,
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: CONFIG.GENERATION.temperature,
        topP: CONFIG.GENERATION.topP,
      },
    };

    try {
      const response = await this.ai.models.generateContent(params);
      const rawText = response.text || "";
      
      // Robust extraction of HTML block
      const htmlMatch = rawText.match(/<!DOCTYPE html>[\s\S]*?<\/html>/i) || 
                        rawText.match(/<html[\s\S]*?<\/html>/i);
      
      if (htmlMatch) {
        return htmlMatch[0].trim();
      }

      // Fallback: Clean standard markdown blocks
      return rawText.replace(/^```html\s*/i, '').replace(/^```\s*/, '').replace(/```$/, '').trim();
    } catch (error) {
      console.error("[GeminiService] Manifestation failed:", error);
      throw new Error("The logic gate failed to process the artifact. Try a clearer image.");
    }
  }

  async generateStarterImage(prompt: string): Promise<GeneratedImageResult> {
    try {
      const response = await this.ai.models.generateContent({
        model: CONFIG.MODELS.IMAGE,
        contents: { parts: [{ text: `A clear, high-fidelity UI sketch or technical diagram for: ${prompt}` }] }
      });

      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (!part?.inlineData) throw new Error("Manifestation sequence failed to produce a visual seed.");

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
    const context = "Analyze the visual cues in this artifact and manifest its digital soul. Reconstruct all visuals with SVGs/CSS. Ensure the code is semantic and modular.";
    const parts: Part[] = [{ text: prompt ? `${context}\n\nUser Request: ${prompt}` : context }];

    if (fileBase64 && mimeType) {
      parts.push({
        inlineData: { data: fileBase64, mimeType }
      });
    }

    return parts;
  }
}

export const geminiService = new GeminiService();
export const bringToLife = (p: string, f?: string, m?: string) => geminiService.generateArtifact(p, f, m);
export const generateImage = (p: string) => geminiService.generateStarterImage(p);
