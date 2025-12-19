/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useCallback } from 'react';
import { Creation, GenerationState } from '../types';
import { geminiService } from '../services/gemini';
import { fileToBase64 } from '../utils/fileHelpers';

const INITIAL_STATE: GenerationState = {
  isLoading: false,
  error: null,
  progressStep: 0,
};

export const useCreation = (addCreationToHistory: (c: Creation) => void) => {
  const [activeCreation, setActiveCreation] = useState<Creation | null>(null);
  const [state, setState] = useState<GenerationState>(INITIAL_STATE);

  const startGeneration = useCallback(() => {
    setState({ isLoading: true, error: null, progressStep: 0 });
    setActiveCreation(null);
  }, []);

  const handleGenerationError = useCallback((err: any) => {
    const message = err instanceof Error ? err.message : "Manifestation engine failure.";
    setState({ isLoading: false, error: message, progressStep: 0 });
  }, []);

  const finalizeCreation = useCallback((html: string, name: string, imageBase64?: string, mimeType?: string) => {
    const newCreation: Creation = {
      id: crypto.randomUUID(),
      name,
      html,
      originalImage: imageBase64 && mimeType ? `data:${mimeType};base64,${imageBase64}` : undefined,
      timestamp: new Date(),
    };
    setActiveCreation(newCreation);
    addCreationToHistory(newCreation);
    setState(INITIAL_STATE);
  }, [addCreationToHistory]);

  const generateFromPrompt = useCallback(async (promptText: string, file?: File) => {
    startGeneration();
    try {
      let imageBase64: string | undefined;
      let mimeType: string | undefined;

      if (file) {
        imageBase64 = await fileToBase64(file);
        mimeType = file.type.toLowerCase();
      }

      const html = await geminiService.generateArtifact(promptText, imageBase64, mimeType);
      
      if (html) {
        finalizeCreation(html, file ? file.name : 'Web Manifestation', imageBase64, mimeType);
      }
    } catch (error) {
      handleGenerationError(error);
    }
  }, [startGeneration, finalizeCreation, handleGenerationError]);

  const generateFromText = useCallback(async (prompt: string) => {
    startGeneration();
    try {
      // 1. Generate seed image
      const { base64, mimeType } = await geminiService.generateStarterImage(prompt);
      
      // 2. Transmute to artifact
      const html = await geminiService.generateArtifact(prompt, base64, mimeType);

      if (html) {
        const name = prompt.length > 30 ? `${prompt.substring(0, 30)}...` : prompt;
        finalizeCreation(html, name, base64, mimeType);
      }
    } catch (error) {
      handleGenerationError(error);
    }
  }, [startGeneration, finalizeCreation, handleGenerationError]);

  const reset = useCallback(() => {
    setActiveCreation(null);
    setState(INITIAL_STATE);
  }, []);

  return {
    activeCreation,
    isGenerating: state.isLoading,
    generationError: state.error,
    generateFromPrompt,
    generateFromText,
    reset,
    setActiveCreation
  };
};
