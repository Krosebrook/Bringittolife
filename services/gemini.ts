
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI, Part } from "@google/genai";
import { GeneratedImageResult, ChatMessage, DesignPersona } from "../types";

const PERSONA_INSTRUCTIONS: Record<DesignPersona, string> = {
  modernist: "Focus on clean typography (Inter), ample whitespace, and subtle gradients. High precision grids with minimal borders.",
  brutalist: "Bold, oversized typography, ultra-high contrast, raw layouts, and intentional overlapping elements.",
  accessible: "WCAG 2.1 Level AAA priority. High contrast ratios, large interactive targets, and semantic ARIA labeling.",
  playful: "Vibrant palettes, organic border-radials (32px+), bouncy micro-interactions, and friendly copy.",
  enterprise: "High information density, professional blue/slate palettes, complex data tables, and standard SaaS patterns."
};

const BASE_SYSTEM_INSTRUCTION = `You are a world-class AI Software Architect and Lead Designer at the Manifestation Lab.
Your mission is to transfigure user intent into high-fidelity, interactive digital artifacts.

CORE ARCHITECTURAL PRINCIPLES:
1. ARCHITECTURE: Output ONLY a complete, self-contained HTML5 file.
2. STYLING: Exclusively use Tailwind CSS. Harness the 'manifest' custom theme variables (e.g., bg-manifest-primary).
3. RUNTIME: Use modern ES6+ Vanilla JavaScript for interactivity.
4. GROUNDING: When the 'googleSearch' tool is invoked, use ACTUAL data (real news, stock prices) to populate the UI.
5. CONTINUITY: For iterations, always return the FULL, functional HTML document.

AESTHETIC GUARDRAILS:
- Always include an elegant, subtle background.
- Use 'Inter' as the primary typeface.
- Ensure buttons have distinct :hover and :active states.
- Group related items in 'card' classes.

FORMATTING: Output only raw code. No markdown code blocks. Start directly with <!DOCTYPE html>.`;

class GeminiService {
  private getClient(): GoogleGenAI {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API_KEY execution context missing.");
    return new GoogleGenAI({ apiKey });
  }

  private getInstruction(persona: DesignPersona = 'modernist') {
    return `${BASE_SYSTEM_INSTRUCTION}\n\nACTIVE DESIGN PERSONA: ${PERSONA_INSTRUCTIONS[persona]}`;
  }

  async generateArtifact(prompt: string, fileBase64?: string, mimeType?: string, persona: DesignPersona = 'modernist'): Promise<{ html: string; grounding?: any[] }> {
    const ai = this.getClient();
    const parts: Part[] = [{ text: prompt }];
    if (fileBase64 && mimeType) {
      parts.push({ inlineData: { data: fileBase64, mimeType } });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        systemInstruction: this.getInstruction(persona),
        tools: [{ googleSearch: {} }],
        temperature: 0.1,
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
      contents: { parts: [{ text: `High-fidelity UI mockup for: ${prompt}` }] }
    });
    
    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (!part?.inlineData) throw new Error("Visual synthesis failed.");
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
}

export const geminiService = new GeminiService();
