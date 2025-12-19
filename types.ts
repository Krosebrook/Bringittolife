
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ArtifactType = 'app' | 'game' | 'utility' | 'dashboard';

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export interface Creation {
  id: string;
  name: string;
  html: string;
  originalImage?: string; // Base64 data URL
  timestamp: Date;
  metadata?: {
    type?: ArtifactType;
    prompt?: string;
    model?: string;
  };
}

export interface GeneratedImageResult {
  base64: string;
  mimeType: string;
}

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  progressStep: number;
}

export type MimeType = 'image/png' | 'image/jpeg' | 'image/webp' | 'application/pdf';
