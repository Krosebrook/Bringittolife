
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useMemo } from 'react';
import { Creation } from '../types';
import { INTERACTIVE_STYLES, SUBTLE_BACKGROUND_STYLE, THEME_VARIABLES, DRAG_SCRIPT, ACCESSIBILITY_AUDIT_SCRIPT } from '../utils/injection';

/**
 * PRODUCTION-GRADE IFRAME ARCHITECT
 * ---------------------------------------------------------
 * This function constructs the runtime environment for the generated artifacts.
 * It implements a "Design System Bridge" that connects the CSS variables in the
 * host app to the Tailwind CSS engine inside the iframe.
 */
const assembleIframeDoc = (rawHtml: string): string => {
  // Purge any existing style tags from the raw artifact to prevent "ghost styles"
  // and ensure the CSS Editor remains the single source of truth for the final design.
  const cleanedHtml = rawHtml.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '');
  
  const headInjections = [
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<!-- Tailwind Play CDN -->',
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
    '            "accent-glow": "hsla(var(--m-accent-h), var(--m-accent-s), var(--m-accent-l), 0.35)",',
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
    '        boxShadow: {',
    '          "manifest-sm": "var(--manifest-shadow-sm)",',
    '          "manifest-md": "var(--manifest-shadow-md)",',
    '        },',
    '        typography: ({ theme }) => ({',
    '          zinc: {',
    '            css: {',
    '              "--tw-prose-body": "var(--manifest-text-main)",',
    '              "--tw-prose-headings": "var(--manifest-text-main)",',
    '              "--tw-prose-lead": "var(--manifest-text-sub)",',
    '              "--tw-prose-links": "var(--manifest-accent)",',
    '              "--tw-prose-bold": "var(--manifest-text-main)",',
    '              "--tw-prose-counters": "var(--manifest-text-muted)",',
    '              "--tw-prose-bullets": "var(--manifest-text-muted)",',
    '              "--tw-prose-hr": "var(--manifest-border)",',
    '              "--tw-prose-quotes": "var(--manifest-text-main)",',
    '              "--tw-prose-quote-borders": "var(--manifest-accent)",',
    '              "--tw-prose-captions": "var(--manifest-text-muted)",',
    '              "--tw-prose-code": "var(--manifest-text-main)",',
    '              "--tw-prose-pre-code": "var(--manifest-text-inverse)",',
    '              "--tw-prose-pre-bg": "var(--manifest-text-main)",',
    '              "--tw-prose-th-borders": "var(--manifest-border)",',
    '              "--tw-prose-td-borders": "var(--manifest-border)",',
    '            },',
    '          },',
    '        }),',
    '      }',
    '    }',
    '  }',
    '</script>',
    
    '<!-- LAYER 1: Core System & Brand Identity Variables -->',
    `<style id="layer-variables">${THEME_VARIABLES}</style>`,
    `<style id="layer-theme-studio"></style>`,
    
    '<!-- LAYER 2 & 3: Framework Foundation & Interactive Patterns -->',
    SUBTLE_BACKGROUND_STYLE,
    INTERACTIVE_STYLES,

    '<!-- LAYER 4: The Final Override (Highest Precedence) -->',
    '<!-- This block handles custom CSS from the editor, injected at runtime. -->',
    '<!-- It uses type="text/tailwindcss" so users can use @apply and other Tailwind directives. -->',
    `<style type="text/tailwindcss" id="layer-user-patch"></style>`,

    `<script>
      /**
       * DESIGN SYNCHRONIZATION BRIDGE
       * Listens for messages from the host to update styles and themes without reloading.
       */
      window.addEventListener('message', (event) => {
        const { type, css, h, s, l, command } = event.data || {};
        
        if (type === 'update-css') {
          const patchLayer = document.getElementById('layer-user-patch');
          if (patchLayer) {
            // Update the CSS content. Tailwind's Play CDN automatically re-processes 
            // when it detects a change in a <style type="text/tailwindcss"> tag.
            patchLayer.innerHTML = css;
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
    DRAG_SCRIPT,
    ACCESSIBILITY_AUDIT_SCRIPT
  ].join('\n    ');

  // Inject at the end of <head> for maximum CSS specificity over any model-generated remnants
  if (cleanedHtml.toLowerCase().includes('</head>')) {
    return cleanedHtml.replace(/<\/head>/i, `${headInjections}\n</head>`);
  }
  
  return `<!DOCTYPE html><html class="dark" lang="en"><head>${headInjections}</head><body>${cleanedHtml}</body></html>`;
};

export const useIframeContent = (creation: Creation | null) => {
  return useMemo(() => {
    if (!creation?.html) return '';
    return assembleIframeDoc(creation.html);
  }, [creation?.id, creation?.html]);
};
