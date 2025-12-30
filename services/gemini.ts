
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI, Part } from "@google/genai";
import { GeneratedImageResult, ChatMessage, DesignPersona } from "../types";

// Model Configuration Constants
const GEMINI_MODELS = {
  CODE_GENERATION: 'gemini-3-pro-preview',
  IMAGE_GENERATION: 'gemini-2.5-flash-image',
} as const;

const MODEL_CONFIG = {
  TEMPERATURE: 0.1, // High precision for code generation
  THINKING_BUDGET: 4000, // Token budget for deep reasoning
} as const;

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

/**
 * GeminiService
 * 
 * Handles all interactions with Google Gemini AI models for code generation,
 * artifact refinement, and image generation.
 * 
 * @example
 * ```typescript
 * const { html, grounding } = await geminiService.generateArtifact(
 *   "Create a modern dashboard",
 *   base64Image,
 *   "image/png",
 *   "modernist"
 * );
 * ```
 */
class GeminiService {
  /**
   * Creates and returns a configured Gemini AI client.
   * 
   * @private
   * @returns {GoogleGenAI} Configured Gemini client
   * @throws {Error} If API_KEY environment variable is not set
   */
  private getClient(): GoogleGenAI {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API_KEY execution context missing.");
    return new GoogleGenAI({ apiKey });
  }

  /**
   * Constructs the system instruction with the specified design persona.
   * 
   * @private
   * @param {DesignPersona} persona - The design persona to apply (default: 'modernist')
   * @returns {string} Complete system instruction with persona guidelines
   */
  private getInstruction(persona: DesignPersona = 'modernist') {
    return `${BASE_SYSTEM_INSTRUCTION}\n\nACTIVE DESIGN PERSONA: ${PERSONA_INSTRUCTIONS[persona]}`;
  }

  /**
   * Generates a complete HTML artifact from a text prompt and optional image.
   * 
   * Uses Gemini 3 Pro Preview with:
   * - High precision (temperature: 0.1)
   * - Deep thinking (4000 token budget)
   * - Google Search grounding for accuracy
   * 
   * @param {string} prompt - Text description of what to generate
   * @param {string} [fileBase64] - Base64-encoded image data (optional)
   * @param {string} [mimeType] - MIME type of the image (optional)
   * @param {DesignPersona} [persona='modernist'] - Design system to apply
   * @returns {Promise<{html: string, grounding?: any[]}>} Generated HTML and grounding sources
   * @throws {Error} If API call fails or API key is missing
   * 
   * @example
   * ```typescript
   * // With image
   * const result = await geminiService.generateArtifact(
   *   "Create a landing page",
   *   imageBase64,
   *   "image/png",
   *   "modernist"
   * );
   * 
   * // Text only
   * const result = await geminiService.generateArtifact(
   *   "Create a login form"
   * );
   * ```
   */
  async generateArtifact(prompt: string, fileBase64?: string, mimeType?: string, persona: DesignPersona = 'modernist'): Promise<{ html: string; grounding?: any[] }> {
    const ai = this.getClient();
    const parts: Part[] = [{ text: prompt }];
    if (fileBase64 && mimeType) {
      parts.push({ inlineData: { data: fileBase64, mimeType } });
    }

    const response = await ai.models.generateContent({
      model: GEMINI_MODELS.CODE_GENERATION,
      contents: { parts },
      config: {
        systemInstruction: this.getInstruction(persona),
        tools: [{ googleSearch: {} }],
        temperature: MODEL_CONFIG.TEMPERATURE,
        thinkingConfig: { thinkingBudget: MODEL_CONFIG.THINKING_BUDGET }
      },
    });

    return { 
      html: this.extractRobustHtml(response.text || ""), 
      grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks 
    };
  }

  /**
   * Refines an existing artifact based on conversational history and a new instruction.
   * 
   * Maintains context from previous interactions to enable iterative refinement.
   * Uses the same Gemini 3 Pro model with chat-based API for context continuity.
   * 
   * @param {ChatMessage[]} history - Previous conversation history
   * @param {string} newPrompt - New refinement instruction
   * @param {DesignPersona} [persona='modernist'] - Design system to maintain
   * @returns {Promise<{html: string, grounding?: any[]}>} Refined HTML and grounding sources
   * @throws {Error} If API call fails
   * 
   * @example
   * ```typescript
   * const refined = await geminiService.refineArtifact(
   *   chatHistory,
   *   "Make the header blue and add a search bar"
   * );
   * ```
   */
  async refineArtifact(history: ChatMessage[], newPrompt: string, persona: DesignPersona = 'modernist'): Promise<{ html: string; grounding?: any[] }> {
    const ai = this.getClient();
    const chatHistory = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    }));

    const chat = ai.chats.create({
      model: GEMINI_MODELS.CODE_GENERATION,
      config: {
        systemInstruction: this.getInstruction(persona),
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: MODEL_CONFIG.THINKING_BUDGET }
      },
      history: chatHistory
    });

    const response = await chat.sendMessage({ message: newPrompt });
    return { 
      html: this.extractRobustHtml(response.text || ""), 
      grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks 
    };
  }

  /**
   * Generates a high-quality UI mockup image from a text prompt.
   * 
   * Uses Gemini 2.5 Flash Image model optimized for fast, high-quality image generation.
   * Automatically enhances the prompt with professional photography and design terms.
   * 
   * @param {string} prompt - Description of the UI to generate
   * @returns {Promise<GeneratedImageResult>} Base64-encoded image with MIME type
   * @throws {Error} If image generation fails or response is invalid
   * 
   * @example
   * ```typescript
   * const { base64, mimeType } = await geminiService.generateStarterImage(
   *   "E-commerce checkout page"
   * );
   * const imageUrl = `data:${mimeType};base64,${base64}`;
   * ```
   */
  async generateStarterImage(prompt: string): Promise<GeneratedImageResult> {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: GEMINI_MODELS.IMAGE_GENERATION,
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

  /**
   * Extracts clean HTML from AI response, handling various formats.
   * 
   * Supports:
   * - Full HTML documents (<!DOCTYPE html>...)
   * - Markdown code blocks (```html...```)
   * - Plain HTML fragments
   * 
   * @private
   * @param {string} text - Raw text from AI response
   * @returns {string} Extracted HTML code
   * 
   * @example
   * ```typescript
   * // Handles markdown
   * const html = this.extractRobustHtml("```html\n<div>Hello</div>\n```");
   * // Returns: "<div>Hello</div>"
   * 
   * // Handles full documents
   * const html = this.extractRobustHtml("<!DOCTYPE html>...");
   * // Returns: Complete HTML document
   * ```
   */
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
