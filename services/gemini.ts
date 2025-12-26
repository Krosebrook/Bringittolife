
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI, Part, Chat } from "@google/genai";
import { GeneratedImageResult, ChatMessage, DesignPersona } from "../types";

const PERSONA_INSTRUCTIONS: Record<DesignPersona, string> = {
  modernist: "Focus on clean typography, ample whitespace, and subtle gradients. Use Inter for fonts.",
  brutalist: "Use bold typography, high contrast, raw layout structures, and unconventional navigation patterns.",
  accessible: "Prioritize high color contrast, large touch targets, and ARIA-compliant semantic structures. Design for screen readers.",
  playful: "Use vibrant colors, rounded corners (large border-radius), bouncy transitions, and friendly micro-interactions.",
  enterprise: "Focus on high information density, clear grids, standard UI patterns, and trust-building neutral color palettes."
};

const BASE_SYSTEM_INSTRUCTION = `You are a world-class AI Software Architect and UI/UX Designer. 
Your goal is to manifest and refine interactive digital artifacts.

TECHNICAL RULES:
1. Output ONLY a complete, self-contained HTML5 file.
2. STYLING: Use Tailwind CSS. Integrate with Manifest Design System variables (e.g., bg-manifest-primary).
3. INTERACTIVITY: Use Vanilla JS. Focus on smooth transitions and state management within the page.
4. GROUNDING: If using real-world info, use the provided googleSearch tool and INJECT actual data (titles, prices, news) into the UI elements rather than using placeholders.
5. ITERATION: If the user asks for changes, return the FULL updated HTML file.

FORMATTING: No markdown backticks. Start with <!DOCTYPE html>.`;

class GeminiService {
  private getClient(): GoogleGenAI {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API_KEY not found.");
    return new GoogleGenAI({ apiKey });
  }

  private getInstruction(persona: DesignPersona = 'modernist') {
    return `${BASE_SYSTEM_INSTRUCTION}\n\nSTRATEGIC DESIGN PERSONA: ${PERSONA_INSTRUCTIONS[persona]}`;
  }

  async generateArtifact(prompt: string, fileBase64?: string, mimeType?: string, persona: DesignPersona = 'modernist'): Promise<{ html: string; grounding?: any[] }> {
    const ai = this.getClient();
    const parts = this.prepareParts(prompt, fileBase64, mimeType);

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        systemInstruction: this.getInstruction(persona),
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      },
    });

    return { 
      html: this.extractRobustHtml(response.text || ""), 
      grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks 
    };
  }

  async refineArtifact(history: ChatMessage[], newPrompt: string, persona: DesignPersona = 'modernist'): Promise<{ html: string; grounding?: any[] }> {
    const ai = this.getClient();
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: this.getInstruction(persona),
        tools: [{ googleSearch: {} }],
      },
      history: history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }]
      }))
    });

    const response = await chat.sendMessage({ message: newPrompt });
    return { 
      html: this.extractRobustHtml(response.text || ""), 
      grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks 
    };
  }

  async generateStarterImage(prompt: string): Promise<GeneratedImageResult> {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `A high-fidelity mockup for: ${prompt}` }] }
    });
    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (!part?.inlineData) throw new Error("Image synthesis failed.");
    return { base64: part.inlineData.data, mimeType: part.inlineData.mimeType || 'image/png' };
  }

  private extractRobustHtml(text: string): string {
    const trimmed = text.trim();
    const fullDocMatch = trimmed.match(/<!DOCTYPE html>[\s\S]*?<\/html>/i);
    if (fullDocMatch) return fullDocMatch[0];
    const mdBlockMatch = trimmed.match(/```(?:html|xml)?\s*([\s\S]*?)\s*```/i);
    if (mdBlockMatch) return mdBlockMatch[1];
    return trimmed;
  }

  private prepareParts(prompt: string, fileBase64?: string, mimeType?: string): Part[] {
    const parts: Part[] = [{ text: prompt }];
    if (fileBase64 && mimeType) {
      parts.push({ inlineData: { data: fileBase64, mimeType } });
    }
    return parts;
  }
}

export const geminiService = new GeminiService();
