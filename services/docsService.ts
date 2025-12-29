/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI, Type } from "@google/genai";
import { WorkflowDoc } from "../types";

export class DocsService {
  async generateDocumentation(name: string, html: string): Promise<WorkflowDoc> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate comprehensive technical documentation for this HTML/Tailwind component: 
      
      Name: ${name}
      Code Fragment: ${html.slice(0, 5000)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            purpose: { type: Type.STRING, description: "A high-level human-readable description." },
            ioSchema: { type: Type.STRING, description: "Expected inputs and outputs in JSON Schema format." },
            internalLogic: { type: Type.STRING, description: "Step-by-step logic explanation in Markdown." }
          },
          required: ["purpose", "ioSchema", "internalLogic"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return {
      ...data,
      lastUpdated: new Date().toISOString()
    };
  }
}

export const docsService = new DocsService();
