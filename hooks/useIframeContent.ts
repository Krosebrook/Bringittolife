
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect, useMemo } from 'react';
import { Creation } from '../types';
import { INTERACTIVE_STYLES, DRAG_SCRIPT, SUBTLE_BACKGROUND_STYLE } from '../utils/injection';

/**
 * UTILITY: CSS Extraction & Virtualization
 * 
 * Aggregates all styles into a single cohesive CSS document and 
 * exposes it via a secure Blob URL to simulate an external stylesheet.
 */
const createVirtualStylesheet = (rawHtml: string): string => {
  // 1. Gather Styles from the Artifact
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let cohesiveCss = "/* --- MANIFESTED ARTIFACT STYLES --- */\n\n";
  
  let match;
  while ((match = styleRegex.exec(rawHtml)) !== null) {
    cohesiveCss += `/* Source Block */\n${match[1].trim()}\n\n`;
  }

  // 2. Gather System Injections (Interactive Polish & Transitions)
  const stripTags = (html: string) => html.replace(/<style[^>]*>|<\/style>/gi, '');
  
  cohesiveCss += "/* --- SYSTEM FRAMEWORK INJECTIONS --- */\n";
  cohesiveCss += "/* Aesthetic Baseline */\n" + stripTags(SUBTLE_BACKGROUND_STYLE) + "\n\n";
  cohesiveCss += "/* Interactive Behaviors */\n" + stripTags(INTERACTIVE_STYLES) + "\n";

  // 3. Manifest the Virtual File
  const blob = new Blob([cohesiveCss], { type: 'text/css' });
  return URL.createObjectURL(blob);
};

/**
 * UTILITY: Document Assembly
 * 
 * Constructs the final HTML5 structure, linking the virtual stylesheet 
 * and required system scripts into the artifact's context.
 */
const assembleIframeDoc = (rawHtml: string, cssUrl: string): string => {
  // Purge internal style tags to avoid redundancy and specificity conflicts
  const cleanBody = rawHtml.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '');
  
  const headInjections = [
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">',
    // The "Separate CSS File" Link
    `<link rel="stylesheet" href="${cssUrl}">`,
    // System Scripts
    DRAG_SCRIPT 
  ].join('\n    ');

  /**
   * REUSABLE: Standard HTML5 Wrapper
   */
  const wrap = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    ${headInjections}
</head>
<body>
    ${content}
</body>
</html>`.trim();

  // Intelligent Injection Strategy
  if (cleanBody.includes('</head>')) {
    return cleanBody.replace('</head>', `${headInjections}\n</head>`);
  } else if (cleanBody.toLowerCase().includes('<html')) {
    return cleanBody.replace(/(<html[^>]*>)/i, `$1\n<head>\n    ${headInjections}\n</head>`);
  } else if (cleanBody.toLowerCase().includes('<body')) {
    const bodyContentMatch = cleanBody.match(/<body[\s\S]*<\/body>/i);
    return wrap(bodyContentMatch ? bodyContentMatch[0] : cleanBody);
  }
  
  return wrap(cleanBody);
};

/**
 * CUSTOM HOOK: useIframeContent
 * 
 * Manages the lifecycle of virtual assets and document state for the LivePreview component.
 */
export const useIframeContent = (creation: Creation | null) => {
  const [cssUrl, setCssUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!creation?.html) return;

    // Generate the virtual CSS file
    const url = createVirtualStylesheet(creation.html);
    setCssUrl(url);

    // Revoke URL on cleanup to prevent memory leaks
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [creation?.html]);

  const srcDoc = useMemo(() => {
    if (!creation?.html || !cssUrl) return '';
    return assembleIframeDoc(creation.html, cssUrl);
  }, [creation?.html, cssUrl]);

  return srcDoc;
};
