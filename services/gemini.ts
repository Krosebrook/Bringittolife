
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI, Part, Type } from "@google/genai";
import { GeneratedImageResult, ChatMessage, DesignPersona, PipelineStep } from "../types";

const PERSONA_INSTRUCTIONS: Record<DesignPersona, string> = {
  modernist: "Focus on clean typography (Inter), ample whitespace, and subtle gradients. High precision grids with minimal borders.",
  brutalist: "Bold, oversized typography, ultra-high contrast, raw layouts, and intentional overlapping elements.",
  accessible: "WCAG 2.1 Level AAA priority. High contrast ratios, large interactive targets, and semantic ARIA labeling.",
  playful: "Vibrant palettes, organic border-radials (32px+), bouncy micro-interactions, and friendly copy.",
  enterprise: "High information density, professional blue/slate palettes, complex data tables, and standard SaaS patterns."
};

const BASE_SYSTEM_INSTRUCTION = `You are a world-class AI Software Architect and Lead Designer at the Manifestation Lab. 
Your mission is to transfigure user intent into production-grade, high-fidelity interactive digital artifacts.

CORE ARCHITECTURAL PRINCIPLES:
1. OUTPUT: Return ONLY a complete, self-contained HTML5 file. 
2. STYLING: Exclusively use Tailwind CSS.
3. TYPOGRAPHY: The environment is 'Prose-First'. All semantic tags (h1-h6, p, ul, ol, blockquote) are automatically styled to high-fidelity standards. Focus on using correct semantic structure (<header>, <main>, <article>, <aside>, etc.).
4. LAYOUT: For complex UI components (navigation bars, buttons, sidebars) that should NOT inherit typographic margins or styles, apply the 'not-prose' class to their container.
5. INTERACTIVITY: Implement robust ES6+ JavaScript. Handle state changes smoothly.
6. ACCESSIBILITY: Every interactive element MUST have an aria-label.

AESTHETIC GUARDRAILS:
- Use sophisticated typography (Inter).
- Ensure focus states are beautifully styled (glow/ring).
- Buttons must have distinct :hover and :active states.

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
        thinkingConfig: { thinkingBudget: 4000 }
      },
    });

    return { 
      html: this.extractRobustHtml(response.text || ""), 
      grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks 
    };
  }

  async refineArtifact(history: ChatMessage[], newPrompt: string, persona: DesignPersona = 'modernist'): Promise<{ html: string; grounding?: any[] }> {
    const ai = this.getClient();
    const chatHistory = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    }));

    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: this.getInstruction(persona),
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 4000 }
      },
      history: chatHistory
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
      contents: { parts: [{ text: `High-fidelity, award-winning UI/UX mockup for: ${prompt}. Cinematic lighting, 4K detail, professional color grading.` }] }
    });
    
    // Nano banana models may contain both image and text parts
    const candidate = response.candidates?.[0];
    if (!candidate) throw new Error("Synthesis candidate missing.");
    
    const part = candidate.content.parts.find(p => p.inlineData);
    if (!part?.inlineData) throw new Error("Visual synthesis failed: Image part not found.");
    
    return { 
      base64: part.inlineData.data, 
      mimeType: part.inlineData.mimeType || 'image/png' 
    };
  }

  async suggestPipeline(code: string): Promise<PipelineStep[]> {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following web artifact code and generate a realistic CI/CD pipeline JSON structure. 
      Tailor the steps (Lint, Test, Build, Deploy) based on the complexity (e.g. simple static sites need less steps than complex apps).
      
      Code Snippet:
      ${code.slice(0, 5000)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['lint', 'test', 'build', 'deploy'] },
              status: { type: Type.STRING, enum: ['pending', 'active', 'success', 'failed'] }
            },
            required: ['id', 'name', 'type', 'status']
          }
        }
      }
    });

    try {
      const steps = JSON.parse(response.text || "[]");
      return steps;
    } catch (e) {
      console.error("Pipeline synthesis failed", e);
      return [
        { id: '1', name: 'Lint (Standard)', type: 'lint', status: 'pending' },
        { id: '2', name: 'Build', type: 'build', status: 'pending' }
      ];
    }
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
