/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Creation {
  id: string;
  name: string;
  html: string;
  originalImage?: string; // Base64 data URL
  timestamp: Date;
}

export interface GeneratedImageResult {
  base64: string;
  mimeType: string;
}
