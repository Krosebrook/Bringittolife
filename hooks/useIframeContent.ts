
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
const assembleIframeDoc = (rawHtml: string): string => {
  // Purge existing styles from raw HTML to centralize design control in the layers.
  // This prevents legacy or model-generated style tags from polluting the cascade.
  const cleanedHtml = rawHtml.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '');
  
  const headInjections = [
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<!-- Tailwind Play CDN with essential plugins -->',
    '<script src="https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio,line-clamp"></script>',
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
    '        borderRadius: {',
    '          "manifest-sm": "var(--manifest-radius-sm)",',
    '          "manifest-md": "var(--manifest-radius-md)",',
    '          "manifest-lg": "var(--manifest-radius-lg)",',
    '          "manifest-xl": "var(--manifest-radius-xl)",',
    '        },',
    '        transitionTimingFunction: {',
    '          "manifest": "var(--manifest-ease)",',
    '        },',
    '        animation: {',
    '          "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",',
    '          "manifest-fade": "manifest-fade-in 0.6s var(--manifest-ease) forwards",',
    '        },',
    '        boxShadow: {',
    '          "manifest-sm": "var(--manifest-shadow-sm)",',
    '          "manifest-md": "var(--manifest-shadow-md)",',
    '          "manifest-lg": "var(--manifest-shadow-lg)",',
    '        }',
    '      }',
    '    }',
    '  }',
    '</script>',
    
    '<!-- Layer 1: Core System Variables (Low Priority) -->',
    `<style id="layer-variables">${THEME_VARIABLES}</style>`,
    
    '<!-- Layer 2: Design System Foundation (Tailwind Layers) -->',
    SUBTLE_BACKGROUND_STYLE,
    INTERACTIVE_STYLES,

    '<!-- Layer 3: Dynamic Theme Studio (Mid Priority) -->',
    `<style id="layer-theme-studio"></style>`,

    '<!-- Layer 4: Custom CSS Editor / Artifact Styles (High Priority - Final Override) -->',
    '<!-- This layer uses type="text/tailwindcss" so users can use @apply directives -->',
    `<style type="text/tailwindcss" id="layer-user-patch"></style>`,

    `<script>
      // Style Synchronization Bridge
      window.addEventListener('message', (event) => {
        const { type, css, h, s, l, command } = event.data || {};
        
        if (type === 'update-css') {
          const patchLayer = document.getElementById('layer-user-patch');
          if (patchLayer) {
            patchLayer.innerHTML = css;
            // Trigger Tailwind to re-process if the CDN provides a refresh mechanism
            if (window.tailwind && typeof window.tailwind.reprocess === 'function') {
               window.tailwind.reprocess();
            }
          }
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

        if (command === 'enable-drag' || command === 'disable-drag') {
          window.dispatchEvent(new MessageEvent('message', { data: command }));
        }
      });
    </script>`,
    DRAG_SCRIPT 
  ].join('\n    ');

  // Insert injections at the end of head for maximum specificity over default browser/Tailwind resets
  if (cleanedHtml.toLowerCase().includes('</head>')) {
    return cleanedHtml.replace(/<\/head>/i, `${headInjections}\n</head>`);
  }
  
  return `<!DOCTYPE html><html><head>${headInjections}</head><body>${cleanedHtml}</body></html>`;
};

export const useIframeContent = (creation: Creation | null) => {
  return useMemo(() => {
    if (!creation?.html) return '';
    return assembleIframeDoc(creation.html);
  }, [creation?.id, creation?.html]);
};
