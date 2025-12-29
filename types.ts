
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ArtifactType = 'app' | 'game' | 'utility' | 'dashboard';
export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export type DesignPersona = 'modernist' | 'brutalist' | 'accessible' | 'playful' | 'enterprise';

export interface GroundingSource {
  title?: string;
  uri: string;
  snippet?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  grounding?: GroundingSource[];
  isVoiceInput?: boolean;
}

export interface ThemeState {
  h: number;
  s: number;
  l: number;
}

export interface AccessibilityIssue {
  id: string;
  type: 'critical' | 'warning' | 'info';
  element: string;
  message: string;
  suggestion: string;
  selector: string;
}

export interface WorkflowDoc {
  purpose: string;
  ioSchema: string;
  internalLogic: string;
  lastUpdated: string;
}

export interface PipelineStep {
  id: string;
  name: string;
  type: 'lint' | 'test' | 'build' | 'deploy';
  status: 'pending' | 'active' | 'success' | 'failed';
}

export interface Creation {
  id: string;
  name: string;
  html: string;
  originalImage?: string; 
  timestamp: Date;
  chatHistory?: ChatMessage[];
  theme?: ThemeState;
  persona?: DesignPersona;
  documentation?: WorkflowDoc;
  pipeline?: PipelineStep[];
  metadata?: {
    type?: ArtifactType;
    prompt?: string;
    model?: string;
  };
}

export interface GenerationState {
  isLoading: boolean;
  isListening: boolean;
  error: string | null;
  progressStep: number;
}

export interface GeneratedImageResult {
  base64: string;
  mimeType: string;
}
