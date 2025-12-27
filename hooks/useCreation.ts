
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

/**
 * THE MANIFESTATION ORCHESTRATOR
 * ---------------------------------------------------------
 * Manages the entire lifecycle of an artifact: from initial 
 * multimodal synthesis to voice-driven refinements.
 * 
 * @param onCreationFinalized Callback fired when a stable artifact is ready for the archive.
 */
export const useCreation = (onCreationFinalized: (c: Creation) => void) => {
  const [activeCreation, setActiveCreation] = useState<Creation | null>(null);
  const [state, setState] = useState<GenerationState>(INITIAL_STATE);
  const [persona, setPersona] = useState<DesignPersona>('modernist');

  /**
   * Updates the HSL brand identity of the active artifact.
   */
  const updateTheme = useCallback((theme: ThemeState) => {
    setActiveCreation(prev => prev ? { ...prev, theme } : null);
  }, []);

  /**
   * Swaps the design persona for the current session.
   */
  const changePersona = useCallback((newPersona: DesignPersona) => {
    setPersona(newPersona);
    setActiveCreation(prev => prev ? { ...prev, persona: newPersona } : null);
  }, []);

  /**
   * Internal helper to commit refinement requests to the Gemini API.
   */
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
          text: 'Refinement synthesis complete.', 
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
      onCreationFinalized(updatedCreation);
      setState(INITIAL_STATE);
    } catch (error) {
      console.error("[Manifestation] Refinement Cycle Fault:", error);
      setState(s => ({ 
        ...s, 
        isLoading: false, 
        error: "Refinement cycle failed. The neural bridge timed out." 
      }));
    }
  }, [activeCreation, persona, onCreationFinalized]);

  /**
   * Toggles the low-latency voice design session.
   */
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
        (err) => {
          console.error("[Live] Bridge Error:", err);
          setState(s => ({ ...s, error: "Voice session lost. Check connectivity.", isListening: false }));
        }
      );
      await liveDesignService.startListening();
    } catch (e) {
      setState(s => ({ ...s, isListening: false, error: "Hardware access (Microphone) was denied by the OS." }));
    }
  }, [state.isListening, refine]);

  /**
   * Generates a new artifact from text or image input.
   */
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
        name: file ? file.name : (promptText.length > 20 ? promptText.substring(0, 20) + "..." : promptText),
        html,
        originalImage: imageBase64 && mimeType ? `data:${mimeType};base64,${imageBase64}` : undefined,
        timestamp: new Date(),
        chatHistory: [{ role: 'user', text: promptText, timestamp: new Date() }],
        theme: { h: 217, s: 91, l: 60 },
        persona
      };
      
      setActiveCreation(newCreation);
      onCreationFinalized(newCreation);
      setState(INITIAL_STATE);
    } catch (error) {
      console.error("[Manifestation] Synthesis Fault:", error);
      setState(s => ({ ...s, isLoading: false, error: "Initial manifestation failed. High load detected." }));
    }
  }, [persona, onCreationFinalized]);

  /**
   * Generates a starter reference image before manifestating code.
   * Useful for text-only prompts to provide visual grounding.
   */
  const generateFromText = useCallback(async (prompt: string) => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      const { base64, mimeType } = await geminiService.generateStarterImage(prompt);
      const { html } = await geminiService.generateArtifact(prompt, base64, mimeType, persona);

      const newCreation: Creation = {
        id: crypto.randomUUID(),
        name: prompt.length > 20 ? prompt.substring(0, 20) + "..." : prompt,
        html,
        originalImage: `data:${mimeType};base64,${base64}`,
        timestamp: new Date(),
        chatHistory: [{ role: 'user', text: prompt, timestamp: new Date() }],
        theme: { h: 217, s: 91, l: 60 },
        persona
      };

      setActiveCreation(newCreation);
      onCreationFinalized(newCreation);
      setState(INITIAL_STATE);
    } catch (error) {
      console.error("[Manifestation] Sequential Synthesis Fault:", error);
      setState(s => ({ ...s, isLoading: false, error: "Visual-to-Code synthesis cycle failed." }));
    }
  }, [persona, onCreationFinalized]);

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
