
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI, Part } from "@google/genai";
import { GeneratedImageResult } from "../types";

const CONFIG = {
  MODELS: {
    TEXT: 'gemini-3-pro-preview', // High-fidelity reasoning for code generation
    IMAGE: 'gemini-2.5-flash-image', // Efficient image generation for seed concepts
  },
  GENERATION: {
    temperature: 0.15, // Slightly lower for more deterministic code generation
    topP: 0.95,
  }
};

const SYSTEM_INSTRUCTION = `You are a world-class AI Software Architect and UI/UX Designer. 
Your goal is to manifest interactive, high-fidelity digital artifacts based on user inputs.

TECHNICAL REQUIREMENTS:
1. Return ONLY valid, self-contained HTML5 code.
2. STYLING: Use Tailwind CSS utility classes exclusively for layout, spacing, typography, and responsive design.
3. DESIGN SYSTEM: Incorporate custom Manifest variables where applicable (e.g., bg-manifest-primary, text-manifest-main, rounded-manifest-md).
4. INTERACTION: Use Vanilla JavaScript for all logic and interactivity. No external libraries unless requested.
5. ACCESSIBILITY: Use semantic HTML5 tags and appropriate ARIA attributes.
6. FORMATTING: No markdown wrappers (\`\`\`html). Start directly with <!DOCTYPE html>.

STYLE GUIDELINE:
- Prefer clean, modern, and professional aesthetics.
- Ensure the interface is responsive across desktop, tablet, and mobile.
- If using <style> tags, use the @apply directive to map Tailwind utilities to custom classes.`;

class GeminiService {
  private getClient(): GoogleGenAI {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API_KEY environment variable is not defined.");
    return new GoogleGenAI({ apiKey });
  }

  async generateArtifact(prompt: string, fileBase64?: string, mimeType?: string): Promise<string> {
    const ai = this.getClient();
    const parts = this.prepareParts(prompt, fileBase64, mimeType);

    try {
      const response = await ai.models.generateContent({
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
      throw new Error("The manifestation gateway rejected the request. Please verify your prompt or try a different approach.");
    }
  }

  private extractRobustHtml(text: string): string {
    const trimmed = text.trim();
    
    // Strategy 1: Look for full document
    const fullDocMatch = trimmed.match(/<!DOCTYPE html>[\s\S]*?<\/html>/i);
    if (fullDocMatch) return fullDocMatch[0];

    // Strategy 2: Look for root html tag
    const htmlTagMatch = trimmed.match(/<html[\s\S]*?<\/html>/i);
    if (htmlTagMatch) return htmlTagMatch[0];

    // Strategy 3: Clean markdown blocks if present
    const mdBlockMatch = trimmed.match(/```(?:html|xml)?\s*([\s\S]*?)\s*```/i);
    if (mdBlockMatch) return mdBlockMatch[1];

    // Strategy 4: Heuristic fallback
    if (trimmed.includes('<body') || trimmed.includes('<div')) {
      return trimmed;
    }

    return "<!-- Error: Manifestation sequence failed to produce valid HTML. -->";
  }

  async generateStarterImage(prompt: string): Promise<GeneratedImageResult> {
    const ai = this.getClient();
    try {
      const response = await ai.models.generateContent({
        model: CONFIG.MODELS.IMAGE,
        contents: { parts: [{ text: `A professional, high-fidelity UI design concept or technical wireframe for: ${prompt}` }] }
      });

      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (!part?.inlineData) throw new Error("Image synthesis failed.");

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
    const prefix = "Transmute this prompt and visual reference into a fully functional, high-fidelity digital artifact. Use Tailwind CSS for all styling.";
    const parts: Part[] = [{ text: prompt ? `${prefix}\n\nUser Intent: ${prompt}` : prefix }];
    
    if (fileBase64 && mimeType) {
      parts.push({ inlineData: { data: fileBase64, mimeType } });
    }
    
    return parts;
  }
}

export const geminiService = new GeminiService();
