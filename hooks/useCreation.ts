
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useCallback } from 'react';
import { Creation, GenerationState, ChatMessage, ThemeState, DesignPersona } from '../types';
import { geminiService } from '../services/gemini';
import { liveDesignService } from '../services/live';
import { fileToBase64 } from '../utils/fileHelpers';

const INITIAL_STATE: GenerationState = {
  isLoading: false,
  isListening: false,
  error: null,
  progressStep: 0,
};

export const useCreation = (addCreationToHistory: (c: Creation) => void) => {
  const [activeCreation, setActiveCreation] = useState<Creation | null>(null);
  const [state, setState] = useState<GenerationState>(INITIAL_STATE);
  const [persona, setPersona] = useState<DesignPersona>('modernist');

  const updateTheme = useCallback((theme: ThemeState) => {
    setActiveCreation(prev => prev ? { ...prev, theme } : null);
  }, []);

  const changePersona = useCallback((newPersona: DesignPersona) => {
    setPersona(newPersona);
    setActiveCreation(prev => prev ? { ...prev, persona: newPersona } : null);
  }, []);

  const refine = useCallback(async (prompt: string, isVoice = false) => {
    if (!activeCreation) return;
    setState(s => ({ ...s, isLoading: true, error: null, progressStep: 3 }));
    
    try {
      const { html, grounding } = await geminiService.refineArtifact(
        activeCreation.chatHistory || [],
        prompt,
        activeCreation.persona || persona
      );

      const formattedGrounding = grounding?.map((g: any) => ({
        title: g.web?.title,
        uri: g.web?.uri,
        snippet: g.web?.snippet
      }));

      const updatedHistory: ChatMessage[] = [
        ...(activeCreation.chatHistory || []),
        { role: 'user', text: prompt, timestamp: new Date(), isVoiceInput: isVoice },
        { 
          role: 'model', 
          text: 'Artifact updated with refinement logic.', 
          timestamp: new Date(), 
          grounding: formattedGrounding 
        }
      ];

      const updatedCreation: Creation = {
        ...activeCreation,
        html,
        chatHistory: updatedHistory,
        timestamp: new Date()
      };

      setActiveCreation(updatedCreation);
      addCreationToHistory(updatedCreation);
      setState(INITIAL_STATE);
    } catch (error) {
      console.error("[CreationHook] Refinement failure:", error);
      setState(s => ({ ...s, isLoading: false, error: "Refinement synthesis failed. Check connection." }));
    }
  }, [activeCreation, persona, addCreationToHistory]);

  const toggleVoiceMode = useCallback(async () => {
    if (state.isListening) {
      liveDesignService.close();
      setState(s => ({ ...s, isListening: false }));
      return;
    }

    setState(s => ({ ...s, isListening: true }));
    try {
      await liveDesignService.connect(
        (command) => refine(command, true),
        (err) => setState(s => ({ ...s, error: "Voice session lost.", isListening: false }))
      );
      await liveDesignService.startListening();
    } catch (e) {
      setState(s => ({ ...s, isListening: false, error: "Microphone access denied." }));
    }
  }, [state.isListening, refine]);

  const generateFromPrompt = useCallback(async (promptText: string, file?: File) => {
    setState(s => ({ ...s, isLoading: true, error: null, progressStep: 0 }));
    try {
      let imageBase64: string | undefined;
      let mimeType: string | undefined;

      if (file) {
        imageBase64 = await fileToBase64(file);
        mimeType = file.type.toLowerCase();
      }

      const { html, grounding } = await geminiService.generateArtifact(promptText, imageBase64, mimeType, persona);
      
      const newCreation: Creation = {
        id: crypto.randomUUID(),
        name: file ? file.name : 'Web Manifestation',
        html,
        originalImage: imageBase64 && mimeType ? `data:${mimeType};base64,${imageBase64}` : undefined,
        timestamp: new Date(),
        chatHistory: [{ role: 'user', text: promptText, timestamp: new Date() }],
        theme: { h: 217, s: 91, l: 60 },
        persona
      };
      
      setActiveCreation(newCreation);
      addCreationToHistory(newCreation);
      setState(INITIAL_STATE);
    } catch (error) {
      setState(s => ({ ...s, isLoading: false, error: "Initial synthesis failed." }));
    }
  }, [persona, addCreationToHistory]);

  const generateFromText = useCallback(async (prompt: string) => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      const { base64, mimeType } = await geminiService.generateStarterImage(prompt);
      const { html } = await geminiService.generateArtifact(prompt, base64, mimeType, persona);

      const newCreation: Creation = {
        id: crypto.randomUUID(),
        name: prompt.substring(0, 30),
        html,
        originalImage: `data:${mimeType};base64,${base64}`,
        timestamp: new Date(),
        chatHistory: [{ role: 'user', text: prompt, timestamp: new Date() }],
        theme: { h: 217, s: 91, l: 60 },
        persona
      };

      setActiveCreation(newCreation);
      addCreationToHistory(newCreation);
      setState(INITIAL_STATE);
    } catch (error) {
      setState(s => ({ ...s, isLoading: false, error: "Text-to-Artifact synthesis failed." }));
    }
  }, [persona, addCreationToHistory]);

  return {
    activeCreation,
    isGenerating: state.isLoading,
    isListening: state.isListening,
    generationError: state.error,
    persona,
    generateFromPrompt,
    generateFromText,
    refine,
    toggleVoiceMode,
    updateTheme,
    changePersona,
    reset: () => { setActiveCreation(null); setState(INITIAL_STATE); },
    setActiveCreation
  };
};
