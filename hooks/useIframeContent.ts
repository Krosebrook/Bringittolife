
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useMemo } from 'react';
import { Creation } from '../types';
import { INTERACTIVE_STYLES, SUBTLE_BACKGROUND_STYLE, THEME_VARIABLES, DRAG_SCRIPT } from '../utils/injection';

/**
 * HIGH-PRECEDENCE IFRAME ARCHITECT
 * Manages the transition from machine-generated HTML to a fully customizable,
 * Tailwind-powered Design System.
 */
const assembleIframeDoc = (rawHtml: string, artifactCss: string): string => {
  // Purge existing styles from raw HTML to centralize design control in the layers
  const cleanedHtml = rawHtml.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '');
  
  const headInjections = [
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<script src="https://cdn.tailwindcss.com"></script>',
    '<script>',
    '  tailwind.config = {',
    '    darkMode: "class",',
    '    theme: {',
    '      extend: {',
    '        colors: { ',
    '          manifest: { ',
    '            accent: "hsl(var(--m-accent-h) var(--m-accent-s) var(--m-accent-l) / <alpha-value>)", ',
    '            "accent-hover": "hsl(var(--m-accent-h) var(--m-accent-s) calc(var(--m-accent-l) - 8%) / <alpha-value>)",',
    '            primary: "var(--manifest-bg-primary)",',
    '            secondary: "var(--manifest-bg-secondary)",',
    '            tertiary: "var(--manifest-bg-tertiary)",',
    '            card: "var(--manifest-bg-card)",',
    '            border: "var(--manifest-border)",',
    '            main: "var(--manifest-text-main)",',
    '            sub: "var(--manifest-text-sub)",',
    '            muted: "var(--manifest-text-muted)",',
    '            inverse: "var(--manifest-text-inverse)"',
    '          } ',
    '        },',
    '        animation: {',
    '          "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",',
    '        }',
    '      }',
    '    }',
    '  }',
    '</script>',
    
    '<!-- Layer 1: Global Design Tokens -->',
    `<style id="layer-variables">${THEME_VARIABLES}</style>`,
    
    '<!-- Layer 2: Theme Foundation & Base Transitions -->',
    SUBTLE_BACKGROUND_STYLE,
    INTERACTIVE_STYLES,

    '<!-- Layer 3: Theme Studio (Dynamic HSL Injection) -->',
    `<style id="layer-theme-studio"></style>`,

    '<!-- Layer 4: Original Artifact Styles -->',
    `<style type="text/tailwindcss" id="layer-artifact">${artifactCss}</style>`,

    '<!-- Layer 5: High-Priority User Patch (The Master Override) -->',
    `<style type="text/tailwindcss" id="layer-user-patch"></style>`,

    `<script>
      // Runtime Style Synchronization Bridge
      window.addEventListener('message', (event) => {
        const { type, css, h, s, l, command } = event.data || {};
        
        if (type === 'update-css') {
          const patchLayer = document.getElementById('layer-user-patch');
          if (patchLayer) patchLayer.innerHTML = css;
        }
        
        if (type === 'update-theme') {
          const themeLayer = document.getElementById('layer-theme-studio');
          if (themeLayer) {
            themeLayer.innerHTML = \`
              :root {
                --m-accent-h: \${h};
                --m-accent-s: \${s}%;
                --m-accent-l: \${l}%;
              }\`;
          }
        }
      });
    </script>`,
    DRAG_SCRIPT 
  ].join('\n    ');

  // Insert injections into head, ensuring they are the last thing in head for maximum specificity
  if (cleanedHtml.toLowerCase().includes('</head>')) {
    return cleanedHtml.replace(/<\/head>/i, `${headInjections}\n</head>`);
  }
  
  return `<!DOCTYPE html><html><head>${headInjections}</head><body>${cleanedHtml}</body></html>`;
};

export const useIframeContent = (creation: Creation | null) => {
  return useMemo(() => {
    if (!creation?.html) return '';
    
    // Extract initial artifact styles to populate Layer 4
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let artifactCss = "";
    let match;
    while ((match = styleRegex.exec(creation.html)) !== null) {
        artifactCss += match[1].trim() + "\n\n";
    }
    
    return assembleIframeDoc(creation.html, artifactCss);
  }, [creation?.id, creation?.html]);
};
