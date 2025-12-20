
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect, useMemo } from 'react';
import { Creation } from '../types';
import { INTERACTIVE_STYLES, DRAG_SCRIPT, SUBTLE_BACKGROUND_STYLE } from '../utils/injection';

/**
 * UTILITY: CSS Extraction & Virtualization
 * Consolidates system framework styles into a single Object URL.
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
  // Strip existing styles to avoid model-provided style conflicts with live injection
  const bodyContent = rawHtml.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '');
  
  const headInjections = [
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">',
    `<link rel="stylesheet" href="${systemCssUrl}">`,
    `<style id="manifest-live-css">${initialCss}</style>`,
    `<script>
      (function() {
        // Master Listener for Real-time Manifestation Control
        window.addEventListener('message', (event) => {
          if (!event.data) return;
          
          // CSS Morphing Logic
          if (event.data.type === 'update-css') {
            const styleTag = document.getElementById('manifest-live-css');
            if (styleTag) styleTag.innerHTML = event.data.css;
          }
          
          // Simulation Drag/Pan Logic
          if (event.data === 'enable-drag' || event.data === 'disable-drag') {
            window.dispatchEvent(new MessageEvent('message', { data: event.data }));
          }
        });
        
        // Error Isolation
        window.onerror = function(msg, url, line) {
          console.debug("[Iframe Runtime] Isolated Error Catch: " + msg);
          return true;
        };
      })();
    </script>`,
    DRAG_SCRIPT 
  ].join('\n    ');

  const lowerHtml = bodyContent.toLowerCase();
  
  // Heuristic: Inject into head if exists, otherwise construct standard wrapper
  if (lowerHtml.includes('</head>')) {
    return bodyContent.replace(/<\/head>/i, `${headInjections}\n</head>`);
  } else if (lowerHtml.includes('<html')) {
    return bodyContent.replace(/(<html[^>]*>)/i, `$1\n<head>\n    ${headInjections}\n</head>`);
  }
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    ${headInjections}
</head>
<body>
    ${bodyContent}
</body>
</html>`;
};

export const useIframeContent = (creation: Creation | null) => {
  const [systemCssUrl, setSystemCssUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = createSystemStylesheet();
    setSystemCssUrl(url);
    
    // Memory Safety
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, []);

  // Compute initial CSS state only when the creation itself changes (avoiding flicker)
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
