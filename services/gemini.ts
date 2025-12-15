/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { GeneratedImageResult } from "../types";

// Using gemini-3-pro-preview for complex coding tasks.
const GEMINI_MODEL = 'gemini-3-pro-preview';
const GEMINI_IMAGE_MODEL = 'gemini-2.5-flash-image';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `You are an expert AI Engineer and Product Designer specializing in "bringing artifacts to life".
Your goal is to take a user uploaded file—which might be a polished UI design, a messy napkin sketch, a photo of a whiteboard with jumbled notes, or a picture of a real-world object (like a messy desk)—and instantly generate a fully functional, interactive, single-page HTML/JS/CSS application.

CORE DIRECTIVES:
1. **Analyze & Abstract**: Look at the image.
    - **Sketches/Wireframes**: Detect buttons, inputs, and layout. Turn them into a modern, clean UI.
    - **Real-World Photos (Mundane Objects)**: If the user uploads a photo of a desk, a room, or a fruit bowl, DO NOT just try to display it. **Gamify it** or build a **Utility** around it.
      - *Cluttered Desk* -> Create a "Clean Up" game where clicking items (represented by emojis or SVG shapes) clears them, or a Trello-style board.
      - *Fruit Bowl* -> A nutrition tracker or a still-life painting app.
    - **Documents/Forms**: specific interactive wizards or dashboards.

2. **NO EXTERNAL IMAGES**:
    - **CRITICAL**: Do NOT use <img src="..."> with external URLs (like imgur, placeholder.com, or generic internet URLs). They will fail.
    - **INSTEAD**: Use **CSS shapes**, **inline SVGs**, **Emojis**, or **CSS gradients** to visually represent the elements you see in the input.
    - If you see a "coffee cup" in the input, render a ☕ emoji or draw a cup with CSS. Do not try to load a jpg of a coffee cup.

3. **Make it Interactive**: The output MUST NOT be static. It needs buttons, sliders, drag-and-drop, or dynamic visualizations.
4. **Self-Contained**: The output must be a single HTML file with embedded CSS (<style>) and JavaScript (<script>). No external dependencies unless absolutely necessary (Tailwind via CDN is allowed).
5. **Robust & Creative**: If the input is messy or ambiguous, generate a "best guess" creative interpretation. Never return an error. Build *something* fun and functional.

RESPONSE FORMAT:
Return ONLY the raw HTML code. Do not wrap it in markdown code blocks (\`\`\`html ... \`\`\`). Start immediately with <!DOCTYPE html>.`;

/**
 * Sends a prompt and optional image to Gemini to generate an HTML application.
 */
export async function bringToLife(prompt: string, fileBase64?: string, mimeType?: string): Promise<string> {
  const parts: Part[] = [];
  
  const baseInstruction = "Analyze this image/document. Detect what functionality is implied. If it is a real-world object (like a desk), gamify it (e.g., a cleanup game). Build a fully interactive web app. IMPORTANT: Do NOT use external image URLs. Recreate the visuals using CSS, SVGs, or Emojis.";
  
  const finalPrompt = fileBase64 
    ? (prompt ? `${baseInstruction}\n\nUser Context/Request: ${prompt}` : baseInstruction)
    : prompt || "Create a demo app that shows off your capabilities.";

  parts.push({ text: finalPrompt });

  if (fileBase64 && mimeType) {
    parts.push({
      inlineData: {
        data: fileBase64,
        mimeType: mimeType,
      },
    });
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: parts
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.5, // Higher temperature for more creativity with mundane inputs
      },
    });

    let text = response.text || "<!-- Failed to generate content -->";

    // Cleanup if the model still included markdown fences despite instructions
    text = text.replace(/^```html\s*/, '').replace(/^```\s*/, '').replace(/```$/, '');

    return text;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
}

/**
 * Generates an image from a text prompt using Gemini Imagen 3.
 */
export async function generateImage(prompt: string): Promise<GeneratedImageResult> {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_IMAGE_MODEL,
      contents: {
        parts: [{ text: prompt }]
      }
    });

    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData) {
          return {
            base64: part.inlineData.data,
            mimeType: part.inlineData.mimeType || 'image/png'
          };
        }
      }
    }
    throw new Error("No image generated from prompt.");
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    throw error;
  }
}
