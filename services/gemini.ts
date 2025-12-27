
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI, Part } from "@google/genai";
import { GeneratedImageResult, ChatMessage, DesignPersona } from "../types";

/**
 * STRATEGIC DESIGN PERSONA ENGINE
 * Injected into the system instructions to steer the model's creative direction
 * towards specific aesthetic frameworks.
 */
const PERSONA_INSTRUCTIONS: Record<DesignPersona, string> = {
  modernist: "Focus on clean typography (Inter), ample whitespace, and subtle gradients. High precision grids with minimal borders.",
  brutalist: "Bold, oversized typography, ultra-high contrast (black/white/neon), raw layouts, and intentional 'glitch' or overlapping elements.",
  accessible: "WCAG 2.1 Level AAA priority. High contrast ratios, large interactive targets (min 44px), clear focus states, and semantic ARIA labeling.",
  playful: "Vibrant palettes (pastels/neons), organic border-radials (32px+), bouncy micro-interactions (spring eases), and friendly, informal copy.",
  enterprise: "High information density, professional blue/slate palettes, complex data tables, breadcrumbs, and standard B2B SaaS patterns."
};

/**
 * CORE ARCHITECTURAL INSTRUCTIONS
 * This prompt establishes the model as a Lead Architect, enforcing strictly
 * defined output formats and design principles.
 */
const BASE_SYSTEM_INSTRUCTION = `You are a world-class AI Software Architect and Lead Designer at the Manifestation Lab.
Your mission is to transfigure user intent into high-fidelity, interactive digital artifacts.

CORE ARCHITECTURAL PRINCIPLES:
1. ARCHITECTURE: Output ONLY a complete, self-contained HTML5 file.
2. STYLING: Exclusively use Tailwind CSS. Harness the 'manifest' custom theme variables (e.g., bg-manifest-primary, text-manifest-accent).
3. RUNTIME: Use modern ES6+ Vanilla JavaScript for interactivity. Implement smooth state transitions and event delegation.
4. GROUNDING: When the 'googleSearch' tool is invoked, use ACTUAL data (real news, live prices, precise locations) to populate the UI.
5. CONTINUITY: For iterations, always return the FULL, functional HTML document. Do not output diffs.

AESTHETIC GUARDRAILS:
- Always include an elegant, subtle background (gradient or mesh).
- Use 'Inter' as the primary typeface for professional readability.
- Ensure buttons have distinct :hover and :active states using manifest-accent-hover variables.
- Group related items in 'card' classes for structural depth.

FORMATTING: Output only raw code. No markdown code blocks. Start directly with <!DOCTYPE html>.`;

/**
 * GeminiService: The Intelligence Orchestrator
 * Handles all communication with the Gemini 3 and 2.5 series models.
 */
class GeminiService {
  /**
   * Initializes a fresh instance of the Google GenAI client.
   * Leverages process.env.API_KEY injected by the environment.
   */
  private getClient(): GoogleGenAI {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API_KEY execution context missing.");
    return new GoogleGenAI({ apiKey });
  }

  /**
   * Constructs the full system instruction string based on the active persona.
   */
  private getInstruction(persona: DesignPersona = 'modernist') {
    return `${BASE_SYSTEM_INSTRUCTION}\n\nACTIVE DESIGN PERSONA: ${PERSONA_INSTRUCTIONS[persona]}`;
  }

  /**
   * Manifests a new artifact from a text prompt and optional file reference.
   * @param prompt The user's descriptive prompt.
   * @param fileBase64 Optional base64 encoded image or PDF data.
   * @param mimeType Optional MIME type for the provided file.
   * @param persona The aesthetic style to apply.
   */
  async generateArtifact(prompt: string, fileBase64?: string, mimeType?: string, persona: DesignPersona = 'modernist'): Promise<{ html: string; grounding?: any[] }> {
    const ai = this.getClient();
    const parts = this.prepareParts(prompt, fileBase64, mimeType);

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        systemInstruction: this.getInstruction(persona),
        tools: [{ googleSearch: {} }],
        temperature: 0.2, // Balanced for creativity vs structural reliability
      },
    });

    return { 
      html: this.extractRobustHtml(response.text || ""), 
      grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks 
    };
  }

  /**
   * Refines an existing artifact based on conversation history.
   * @param history Previous chat messages for context.
   * @param newPrompt The refinement request.
   * @param persona The aesthetic style to maintain or change to.
   */
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

  /**
   * Generates a starter visual reference using the flash image model.
   * Useful for "text-to-artifact" flows where a visual anchor helps the coding model.
   */
  async generateStarterImage(prompt: string): Promise<GeneratedImageResult> {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `High-fidelity, professional UI mockup for: ${prompt}` }] }
    });
    
    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (!part?.inlineData) throw new Error("Visual synthesis failed.");
    return { base64: part.inlineData.data, mimeType: part.inlineData.mimeType || 'image/png' };
  }

  /**
   * Cleans the model output to ensure valid HTML.
   * Handles markdown code blocks, trailing text, or raw strings.
   */
  private extractRobustHtml(text: string): string {
    const trimmed = text.trim();
    // Case 1: Full document detection
    const fullDocMatch = trimmed.match(/<!DOCTYPE html>[\s\S]*?<\/html>/i);
    if (fullDocMatch) return fullDocMatch[0];
    
    // Case 2: Markdown code block detection
    const mdBlockMatch = trimmed.match(/```(?:html|xml)?\s*([\s\S]*?)\s*```/i);
    if (mdBlockMatch) return mdBlockMatch[1];
    
    // Case 3: Fallback (return as is if it looks like HTML)
    return trimmed.startsWith('<') ? trimmed : `<!-- Error: Non-HTML output detected -->\n${trimmed}`;
  }

  /**
   * Prepares input parts for multimodal requests.
   */
  private prepareParts(prompt: string, fileBase64?: string, mimeType?: string): Part[] {
    const parts: Part[] = [{ text: prompt }];
    if (fileBase64 && mimeType) {
      parts.push({ inlineData: { data: fileBase64, mimeType } });
    }
    return parts;
  }
}

export const geminiService = new GeminiService();
