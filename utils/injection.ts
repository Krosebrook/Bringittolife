
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const THEME_VARIABLES = `
:root {
  /* HSL Base: Brand Identity - Defaults provided, overridden by Theme Studio */
  --m-accent-h: 217;
  --m-accent-s: 91%;
  --m-accent-l: 60%;
  
  /* Semantic Brand Tokens - Calculated for contrast and vibrancy */
  --manifest-accent: hsl(var(--m-accent-h), var(--m-accent-s), var(--m-accent-l));
  --manifest-accent-hover: hsl(var(--m-accent-h), var(--m-accent-s), calc(var(--m-accent-l) - 8%));
  --manifest-accent-glow: hsla(var(--m-accent-h), var(--m-accent-s), var(--m-accent-l), 0.35);

  /* Surface System - Adaptive Neutral Palette */
  --manifest-bg-primary: #f8fafc;
  --manifest-bg-secondary: #eff6ff;
  --manifest-bg-tertiary: #f0fdf4;
  --manifest-bg-card: #ffffff;
  --manifest-border: #e2e8f0;

  /* Typography System - Optimized for Readability */
  --manifest-text-main: #0f172a;
  --manifest-text-sub: #475569;
  --manifest-text-muted: #94a3b8;
  --manifest-text-inverse: #ffffff;
  
  /* Layout Geometry - Consistent Radials */
  --manifest-radius-sm: 0.375rem;
  --manifest-radius-md: 0.75rem;
  --manifest-radius-lg: 1rem;
  --manifest-radius-xl: 1.5rem;
  --manifest-radius-full: 9999px;

  /* Animation Dynamics - Fluid Motion */
  --manifest-ease: cubic-bezier(0.4, 0, 0.2, 1);
  --manifest-duration: 0.2s;
  --manifest-transition: var(--manifest-duration) var(--manifest-ease);

  /* Elevation/Shadow System */
  --manifest-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --manifest-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --manifest-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
`;

export const SUBTLE_BACKGROUND_STYLE = `
<style type="text/tailwindcss">
  @layer base {
    /* Comprehensive Reset Layer */
    *, *::before, *::after {
      box-sizing: border-box;
    }
    * {
      margin: 0;
    }
    html, body {
      height: 100%;
    }
    body {
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      @apply bg-manifest-primary text-manifest-main antialiased min-h-screen m-0;
      background: linear-gradient(300deg, var(--manifest-bg-primary), var(--manifest-bg-secondary), var(--manifest-bg-tertiary));
      background-size: 200% 200%;
      animation: manifest-gradient 15s var(--manifest-ease) infinite;
    }
    img, picture, video, canvas, svg {
      display: block;
      max-width: 100%;
    }
    input, button, textarea, select {
      font: inherit;
    }
    p, h1, h2, h3, h4, h5, h6 {
      overflow-wrap: break-word;
    }
    
    html {
      -webkit-text-size-adjust: 100%;
      -moz-tab-size: 4;
      tab-size: 4;
      font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
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
    /* Design System Abstractions leveraging Tailwind Manifest Tokens */
    .btn, button:not([class*="manifest-ignore"]) {
      @apply cursor-pointer transition-all duration-200 select-none touch-manipulation font-medium;
      border-radius: var(--manifest-radius-md);
    }
    
    .btn-primary, button.primary {
      @apply bg-manifest-accent text-manifest-inverse shadow-manifest-sm hover:shadow-manifest-md hover:bg-manifest-accent-hover;
    }

    .card {
      @apply bg-manifest-card border border-manifest-border rounded-manifest-lg shadow-manifest-sm overflow-hidden;
    }
    
    input, textarea, select {
      @apply bg-manifest-card border-manifest-border transition-all duration-200 outline-none px-3 py-2;
      border-width: 1px;
      border-radius: var(--manifest-radius-sm);
    }
    
    input:focus, textarea:focus, select:focus {
      @apply ring-2 ring-manifest-accent ring-opacity-20 border-manifest-accent;
    }
  }

  /* Universal Animation Entrance */
  [data-animate="true"], section, article {
    @apply animate-manifest-fade;
  }

  @keyframes manifest-fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
`;

export const DRAG_SCRIPT = `
<script>
  (function() {
    let enabled = false; 
    let activeItem = null;
    let initialX, initialY, xOffset = 0, yOffset = 0;

    window.addEventListener('message', (e) => {
      const command = e.data?.command;
      if (command === 'enable-drag') {
        enabled = true;
        document.body.setAttribute('data-manifest-drag', 'true');
      } else if (command === 'disable-drag') {
        enabled = false;
        document.body.setAttribute('data-manifest-drag', 'false');
      }
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
      activeItem.style.transition = 'none';
      activeItem.style.zIndex = '9999';
    });

    document.addEventListener('mousemove', (e) => {
      if (!activeItem) return;
      e.preventDefault();
      const currentX = e.clientX - initialX;
      const currentY = e.clientY - initialY;
      activeItem.style.transform = 'translate3d(' + currentX + 'px, ' + currentY + 'px, 0)';
    });

    document.addEventListener('mouseup', () => {
      if (activeItem) {
        activeItem.style.zIndex = '';
        activeItem.style.transition = '';
      }
      activeItem = null;
    });
  })();
</script>
`;
