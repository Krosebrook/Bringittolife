
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
 * Connects the host application design system to the Tailwind CSS typography engine.
 * Strips incoming styles to ensure the editor's Custom CSS is the single source of truth.
 */
const assembleIframeDoc = (rawHtml: string): string => {
  // 1. Core Meta and Frameworks
  const baseInjections = [
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
    '        transitionTimingFunction: { "manifest": "var(--manifest-ease)" },',
    '        boxShadow: {',
    '          "manifest-sm": "var(--manifest-shadow-sm)",',
    '          "manifest-md": "var(--manifest-shadow-md)",',
    '        },',
    '      }',
    '    }',
    '  }',
    '</script>'
  ];

  // 2. Theming and Foundations
  const foundationInjections = [
    '<!-- Core Design Variables (Applied First) -->',
    `<style id="layer-variables">${THEME_VARIABLES}</style>`,
    `<style id="layer-theme-studio"></style>`,
    '<!-- Framework Foundations -->',
    SUBTLE_BACKGROUND_STYLE,
    INTERACTIVE_STYLES,
  ];

  // 3. User Custom Overrides (Applied Last for Priority)
  const overrideInjections = [
    '<!-- User Custom CSS Overlay (Highest Priority) -->',
    `<style type="text/tailwindcss" id="layer-user-patch"></style>`,
    `<script>
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

        if (command === 'enable-drag' || command === 'disable-drag') {
          window.dispatchEvent(new MessageEvent('message', { data: command }));
        }
      });
    </script>`,
    DRAG_SCRIPT,
    ACCESSIBILITY_AUDIT_SCRIPT
  ];

  const allInjections = [...baseInjections, ...foundationInjections, ...overrideInjections].join('\n    ');

  /**
   * REFINEMENT: Strip existing style tags to ensure the editor's 
   * customCss state is the authoritative source for the preview.
   */
  const cleanHtml = rawHtml.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '');
  
  // Ensure the body has the manifest-prose class for automatic high-quality typography.
  const processedHtml = cleanHtml.replace(/<body([^>]*)>/i, '<body$1 class="manifest-prose">');
  
  if (processedHtml.toLowerCase().includes('</head>')) {
    return processedHtml.replace(/<\/head>/i, `${allInjections}\n</head>`);
  }
  
  return `<!DOCTYPE html><html class="dark" lang="en"><head>${allInjections}</head><body class="manifest-prose">${processedHtml}</body></html>`;
};

export const useIframeContent = (creation: Creation | null) => {
  return useMemo(() => {
    if (!creation?.html) return '';
    return assembleIframeDoc(creation.html);
  }, [creation?.id, creation?.html]);
};
