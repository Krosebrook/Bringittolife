/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState } from 'react';
import { Creation } from '../types';
import { bringToLife, generateImage } from '../services/gemini';
import { fileToBase64 } from '../utils/fileHelpers';

export const useCreation = (addCreationToHistory: (c: Creation) => void) => {
  const [activeCreation, setActiveCreation] = useState<Creation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateFromPrompt = async (promptText: string, file?: File) => {
    setIsGenerating(true);
    setActiveCreation(null);

    try {
      let imageBase64: string | undefined;
      let mimeType: string | undefined;

      if (file) {
        imageBase64 = await fileToBase64(file);
        mimeType = file.type.toLowerCase();
      }

      const html = await bringToLife(promptText, imageBase64, mimeType);
      
      if (html) {
        const newCreation: Creation = {
          id: crypto.randomUUID(),
          name: file ? file.name : 'New Creation',
          html: html,
          originalImage: imageBase64 && mimeType ? `data:${mimeType};base64,${imageBase64}` : undefined,
          timestamp: new Date(),
        };
        setActiveCreation(newCreation);
        addCreationToHistory(newCreation);
      }
    } catch (error) {
      console.error("Failed to generate:", error);
      alert("Something went wrong while bringing your file to life. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFromText = async (prompt: string) => {
    setIsGenerating(true);
    setActiveCreation(null);

    try {
        const { base64, mimeType } = await generateImage(prompt);
        const html = await bringToLife(prompt, base64, mimeType);

        if (html) {
            const newCreation: Creation = {
                id: crypto.randomUUID(),
                name: prompt.length > 30 ? prompt.substring(0, 30) + '...' : prompt,
                html: html,
                originalImage: `data:${mimeType};base64,${base64}`,
                timestamp: new Date(),
            };
            setActiveCreation(newCreation);
            addCreationToHistory(newCreation);
        }
    } catch (error) {
        console.error("Failed to generate from text:", error);
        alert("Failed to generate idea. Please try again.");
    } finally {
        setIsGenerating(false);
    }
  };

  const reset = () => {
    setActiveCreation(null);
    setIsGenerating(false);
  };

  return {
    activeCreation,
    isGenerating,
    generateFromPrompt,
    generateFromText,
    reset,
    setActiveCreation
  };
};