
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const THEME_VARIABLES = `/* Manifest Design System - Variable Architecture */
:root {
  /* HSL Base: Brand Identity */
  --m-accent-h: 217;
  --m-accent-s: 91%;
  --m-accent-l: 60%;
  
  /* Semantic Brand Tokens */
  --manifest-accent: hsl(var(--m-accent-h), var(--m-accent-s), var(--m-accent-l));
  --manifest-accent-hover: hsl(var(--m-accent-h), var(--m-accent-s), calc(var(--m-accent-l) - 8%));
  --manifest-accent-glow: hsla(var(--m-accent-h), var(--m-accent-s), var(--m-accent-l), 0.35);

  /* Surface System (Light/Mixed) */
  --manifest-bg-primary: #f8fafc;
  --manifest-bg-secondary: #eff6ff;
  --manifest-bg-tertiary: #f0fdf4;
  --manifest-bg-card: #ffffff;
  --manifest-border: #e2e8f0;

  /* Typography System */
  --manifest-text-main: #0f172a;
  --manifest-text-sub: #475569;
  --manifest-text-muted: #94a3b8;
  --manifest-text-inverse: #ffffff;
  
  /* Layout Geometry */
  --manifest-radius-sm: 0.375rem;
  --manifest-radius-md: 0.75rem;
  --manifest-radius-lg: 1rem;
  --manifest-radius-xl: 1.5rem;
  --manifest-radius-full: 9999px;

  /* Standardized Spacing */
  --manifest-space-1: 0.25rem;
  --manifest-space-2: 0.5rem;
  --manifest-space-3: 0.75rem;
  --manifest-space-4: 1rem;
  --manifest-space-6: 1.5rem;
  --manifest-space-8: 2rem;
  --manifest-space-12: 3rem;
  
  /* Animation Dynamics */
  --manifest-ease: cubic-bezier(0.4, 0, 0.2, 1);
  --manifest-duration: 0.2s;
  --manifest-transition: var(--manifest-duration) var(--manifest-ease);

  /* Elevation/Shadow System */
  --manifest-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --manifest-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --manifest-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --manifest-shadow-active: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
}`;

export const SUBTLE_BACKGROUND_STYLE = `
<style type="text/tailwindcss">
  @layer base {
    /* Modern CSS Reset */
    *, ::before, ::after {
      box-sizing: border-box;
      border-width: 0;
      border-style: solid;
      border-color: var(--manifest-border, currentColor);
    }

    html {
      line-height: 1.5;
      -webkit-text-size-adjust: 100%;
      -moz-tab-size: 4;
      tab-size: 4;
      font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
    }

    body {
      @apply bg-manifest-primary text-manifest-main antialiased min-h-screen m-0;
      background: linear-gradient(300deg, var(--manifest-bg-primary), var(--manifest-bg-secondary), var(--manifest-bg-tertiary));
      background-size: 200% 200%;
      animation: manifest-gradient 15s var(--manifest-ease) infinite;
    }

    /* Media Reset */
    img, svg, video, canvas, audio, iframe, embed, object {
      display: block;
      vertical-align: middle;
      max-width: 100%;
      height: auto;
    }

    /* Inherit fonts for form elements */
    button, input, optgroup, select, textarea {
      font-family: inherit;
      font-size: 100%;
      line-height: inherit;
      color: inherit;
      margin: 0;
      padding: 0;
    }
  }

  @keyframes manifest-gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
</style>
`;

export const INTERACTIVE_STYLES = `
<style type="text/tailwindcss">
  @layer components {
    /* Semantic Interactive Classes mapped to System Variables */
    button, .btn, .button, [role="button"] {
      @apply cursor-pointer transition-all duration-200 select-none touch-manipulation;
      border-radius: var(--manifest-radius-md);
    }
    
    button:hover, .btn:hover {
      @apply -translate-y-px brightness-105 shadow-manifest-md;
    }

    button:active, .btn:active {
      @apply translate-y-px scale-[0.98] brightness-95 duration-75;
      box-shadow: var(--manifest-shadow-active) !important;
    }

    a {
      @apply text-manifest-accent transition-all duration-200;
      text-decoration-color: transparent;
    }
    
    a:hover {
      @apply text-manifest-accent-hover;
      text-decoration-color: currentColor;
    }
    
    input, textarea, select {
      @apply bg-manifest-card border-manifest-border transition-all duration-200;
      border-width: 1px;
      border-radius: var(--manifest-radius-sm);
      padding: var(--manifest-space-2) var(--manifest-space-3);
    }
    
    input:focus, textarea:focus, select:focus {
      @apply outline-none ring-2 ring-manifest-accent ring-opacity-20 border-manifest-accent;
    }
  }

  /* Entrance Transitions */
  main > *, section, .card {
    animation: manifest-fade-in 0.7s var(--manifest-ease) forwards;
    opacity: 0;
  }

  @keyframes manifest-fade-in {
    from { opacity: 0; transform: translateY(var(--manifest-space-2)); filter: blur(4px); }
    to { opacity: 1; transform: translateY(0); filter: blur(0); }
  }
</style>
`;

export const DRAG_SCRIPT = `
<script>
  (function() {
    let enabled = true; 
    let activeItem = null;
    let initialX, initialY, xOffset = 0, yOffset = 0;

    function setupDrag() {
      const style = document.createElement('style');
      style.innerHTML = \`
        [data-manifest-drag="true"] * { cursor: grab !important; }
        .manifest-dragging { 
          cursor: grabbing !important; 
          z-index: 99999 !important; 
          transform: scale(1.02) !important; 
          outline: 2px dashed var(--manifest-accent) !important; 
          outline-offset: 4px !important; 
          box-shadow: var(--manifest-shadow-lg) !important;
          pointer-events: none;
          will-change: transform;
        }
        .manifest-blueprint-highlight {
          outline: 1.5px solid var(--manifest-accent-glow);
          outline-offset: -1px;
          transition: outline-color 0.2s ease;
        }
      \`;
      document.head.appendChild(style);
      document.body.setAttribute('data-manifest-drag', 'true');
    }

    window.addEventListener('message', (e) => {
      if (e.data === 'enable-drag') {
        enabled = true;
        document.body.setAttribute('data-manifest-drag', 'true');
      } else if (e.data === 'disable-drag') {
        enabled = false;
        document.body.setAttribute('data-manifest-drag', 'false');
      }
    });

    document.addEventListener('mouseover', (e) => {
        if (!enabled) return;
        const item = e.target.closest('div, section, button, img, p, h1, h2, h3, h4, h5, h6, a, span, .card');
        if (item) item.classList.add('manifest-blueprint-highlight');
    });

    document.addEventListener('mouseout', (e) => {
        const item = e.target.closest('div, section, button, img, p, h1, h2, h3, h4, h5, h6, a, span, .card');
        if (item) item.classList.remove('manifest-blueprint-highlight');
    });

    document.addEventListener('mousedown', (e) => {
      if (!enabled || e.target === document.body) return;
      activeItem = e.target.closest('div, section, button, img, p, h1, h2, h3, h4, h5, h6, a, span, .card');
      if (!activeItem) return;

      const style = window.getComputedStyle(activeItem);
      const matrix = new DOMMatrixReadOnly(style.transform);
      xOffset = matrix.m41;
      yOffset = matrix.m42;
      
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
      activeItem.classList.add('manifest-dragging');
    });

    document.addEventListener('mousemove', (e) => {
      if (!activeItem) return;
      e.preventDefault();
      const currentX = e.clientX - initialX;
      const currentY = e.clientY - initialY;
      activeItem.style.transform = 'translate3d(' + currentX + 'px, ' + currentY + 'px, 0)';
    });

    document.addEventListener('mouseup', () => {
      if (activeItem) activeItem.classList.remove('manifest-dragging');
      activeItem = null;
    });

    setupDrag();
  })();
</script>
`;
