
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect, useMemo } from 'react';
import { Creation } from '../types';
import { INTERACTIVE_STYLES, DRAG_SCRIPT, SUBTLE_BACKGROUND_STYLE } from '../utils/injection';

/**
 * UTILITY: CSS Extraction & Virtualization
 * Edge Case: Model sometimes puts styles in <style> or directly in body. 
 * We consolidate them into a controlled virtual stylesheet.
 */
const createSystemStylesheet = (): string => {
  const stripTags = (html: string) => html.replace(/<style[^>]*>|<\/style>/gi, '');
  
  let cohesiveCss = "/* --- SYSTEM FRAMEWORK --- */\n";
  cohesiveCss += stripTags(SUBTLE_BACKGROUND_STYLE) + "\n";
  cohesiveCss += stripTags(INTERACTIVE_STYLES) + "\n";

  const blob = new Blob([cohesiveCss], { type: 'text/css' });
  return URL.createObjectURL(blob);
};

const assembleIframeDoc = (rawHtml: string, systemCssUrl: string, initialCss: string): string => {
  // Edge Case: Handle fragments of HTML that might not have body/html tags
  const bodyContent = rawHtml.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '');
  
  const headInjections = [
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">',
    `<link rel="stylesheet" href="${systemCssUrl}">`,
    `<style id="manifest-live-css">${initialCss}</style>`,
    `<script>
      (function() {
        window.addEventListener('message', (event) => {
          if (!event.data) return;
          
          // Case 1: Live CSS Sync
          if (event.data.type === 'update-css') {
            const styleTag = document.getElementById('manifest-live-css');
            if (styleTag) styleTag.innerHTML = event.data.css;
          }
          
          // Case 2: Drag Mode Control
          if (event.data === 'enable-drag' || event.data === 'disable-drag') {
            window.dispatchEvent(new MessageEvent('message', { data: event.data }));
          }
        });
        
        // Error isolation for user scripts
        window.onerror = function(msg, url, line) {
          console.warn("[Manifested Artifact Runtime] " + msg + " at line " + line);
          return true;
        };
      })();
    </script>`,
    DRAG_SCRIPT 
  ].join('\n    ');

  // Edge Case: If model provided a full document, inject into head. Otherwise wrap.
  const lowerHtml = bodyContent.toLowerCase();
  if (lowerHtml.includes('</head>')) {
    return bodyContent.replace(/<\/head>/i, `${headInjections}\n</head>`);
  } else if (lowerHtml.includes('<html')) {
    return bodyContent.replace(/(<html[^>]*>)/i, `$1\n<head>\n    ${headInjections}\n</head>`);
  }
  
  return `<!DOCTYPE html>
<html lang="en">
<head>${headInjections}</head>
<body>${bodyContent}</body>
</html>`;
};

export const useIframeContent = (creation: Creation | null) => {
  const [systemCssUrl, setSystemCssUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = createSystemStylesheet();
    setSystemCssUrl(url);
    
    // Memory Safety: Revoke Blob URL on unmount to prevent leaks
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, []);

  const initialCss = useMemo(() => {
    if (!creation?.html) return '';
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let css = "";
    let match;
    while ((match = styleRegex.exec(creation.html)) !== null) {
        css += match[1].trim() + "\n\n";
    }
    return css.trim();
  }, [creation?.id]);

  const srcDoc = useMemo(() => {
    if (!creation?.html || !systemCssUrl) return '';
    return assembleIframeDoc(creation.html, systemCssUrl, initialCss);
  }, [creation?.id, systemCssUrl, initialCss]);

  return srcDoc;
};
