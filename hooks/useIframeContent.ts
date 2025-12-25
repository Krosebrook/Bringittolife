
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useMemo } from 'react';
import { Creation } from '../types';
import { INTERACTIVE_STYLES, SUBTLE_BACKGROUND_STYLE, THEME_VARIABLES, DRAG_SCRIPT } from '../utils/injection';

/**
 * Assembles the base document structure for the preview sandbox.
 * Focuses on establishing a robust CSS cascade where user overrides 
 * (Layer 2) have ultimate priority over system foundations (Layer 1).
 */
const assembleIframeDoc = (rawHtml: string, initialCss: string): string => {
  // Extract body and strip inline style tags to prevent collision with the Morphing Engine
  const bodyContent = rawHtml.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '');
  
  const headInjections = [
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<!-- Engine Foundation -->',
    '<script src="https://cdn.tailwindcss.com"></script>',
    '<script>',
    '  tailwind.config = {',
    '    darkMode: "class",',
    '    theme: {',
    '      extend: {',
    '        colors: { ',
    '          manifest: { ',
    '            accent: "var(--manifest-accent)", ',
    '            "accent-hover": "var(--manifest-accent-hover)",',
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
    '        borderRadius: { ',
    '          "manifest-sm": "var(--manifest-radius-sm)",',
    '          "manifest-md": "var(--manifest-radius-md)", ',
    '          "manifest-lg": "var(--manifest-radius-lg)",',
    '          "manifest-xl": "var(--manifest-radius-xl)"',
    '        },',
    '        spacing: {',
    '          "manifest-1": "var(--manifest-space-1)",',
    '          "manifest-2": "var(--manifest-space-2)",',
    '          "manifest-3": "var(--manifest-space-3)",',
    '          "manifest-4": "var(--manifest-space-4)",',
    '          "manifest-6": "var(--manifest-space-6)",',
    '          "manifest-8": "var(--manifest-space-8)",',
    '          "manifest-12": "var(--manifest-space-12)"',
    '        },',
    '        boxShadow: {',
    '          "manifest-sm": "var(--manifest-shadow-sm)",',
    '          "manifest-md": "var(--manifest-shadow-md)",',
    '          "manifest-lg": "var(--manifest-shadow-lg)"',
    '        },',
    '        transitionTimingFunction: {',
    '          "manifest-ease": "var(--manifest-ease)"',
    '        }',
    '      }',
    '    }',
    '  }',
    '</script>',
    
    '<!-- Layer 1: Manifest System Base (Overridable) -->',
    `<style type="text/tailwindcss" id="manifest-system-foundation">`,
    `@tailwind base; @tailwind components; @tailwind utilities;`,
    THEME_VARIABLES,
    SUBTLE_BACKGROUND_STYLE.replace(/<style[^>]*>|<\/style>/g, ''),
    INTERACTIVE_STYLES.replace(/<style[^>]*>|<\/style>/g, ''),
    '</style>',
    
    '<!-- Layer 2: Artifact Overrides (Highest Priority) -->',
    `<style type="text/tailwindcss" id="manifest-artifact-styles">`,
    initialCss,
    '</style>',

    `<script>
      // Real-time CSS Hot-Reloading
      window.addEventListener('message', (event) => {
        if (event.data?.type === 'update-css') {
          const artifactStyleTag = document.getElementById('manifest-artifact-styles');
          if (artifactStyleTag) {
            artifactStyleTag.innerHTML = event.data.css;
          }
        }
        // State updates for UI tools
        if (event.data === 'enable-drag' || event.data === 'disable-drag') {
          window.dispatchEvent(new MessageEvent('message', { data: event.data }));
        }
      });
    </script>`,
    DRAG_SCRIPT 
  ].join('\n    ');

  // Ensure head injections are placed properly to maintain cascade priority
  if (bodyContent.toLowerCase().includes('</head>')) {
    return bodyContent.replace(/<\/head>/i, `${headInjections}\n</head>`);
  }
  
  return `<!DOCTYPE html><html><head>${headInjections}</head><body>${bodyContent}</body></html>`;
};

export const useIframeContent = (creation: Creation | null) => {
  const srcDoc = useMemo(() => {
    if (!creation?.html) return '';
    
    // Extract initial CSS from the model output to populate the Artifact layer
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let initialCss = "";
    let match;
    while ((match = styleRegex.exec(creation.html)) !== null) {
        initialCss += match[1].trim() + "\n\n";
    }

    return assembleIframeDoc(creation.html, initialCss);
  }, [creation?.id]);

  return srcDoc;
};
