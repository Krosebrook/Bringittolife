
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
      contents: `Synthesize a high-fidelity technical manifesto for this manifestation: 
      
      Project Name: ${name}
      Source Logic: ${html.slice(0, 5000)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            purpose: { type: Type.STRING, description: "A high-level architectural overview." },
            ioSchema: { type: Type.STRING, description: "Component interface schema in JSON format." },
            internalLogic: { type: Type.STRING, description: "Step-by-step runtime logic in Markdown." }
          },
          required: ["purpose", "ioSchema", "internalLogic"]
        }
      }
    });

    try {
      const data = JSON.parse(response.text || "{}");
      return {
        ...data,
        lastUpdated: new Date().toISOString()
      };
    } catch (e) {
      console.error("[Manifest] Doc Synthesis Fault:", e);
      return {
        purpose: "Documentation synthesis failed for this artifact.",
        ioSchema: "{}",
        internalLogic: "Error during parsing.",
        lastUpdated: new Date().toISOString()
      };
    }
  }
}

export const docsService = new DocsService();
