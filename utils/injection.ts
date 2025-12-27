
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const THEME_VARIABLES = `
:root {
  --m-accent-h: 217;
  --m-accent-s: 91%;
  --m-accent-l: 60%;
  
  --manifest-accent: hsl(var(--m-accent-h), var(--m-accent-s), var(--m-accent-l));
  --manifest-accent-hover: hsl(var(--m-accent-h), var(--m-accent-s), calc(var(--m-accent-l) - 8%));
  --manifest-accent-glow: hsla(var(--m-accent-h), var(--m-accent-s), var(--m-accent-l), 0.35);

  --manifest-bg-primary: #f8fafc;
  --manifest-bg-secondary: #eff6ff;
  --manifest-bg-tertiary: #f0fdf4;
  --manifest-bg-card: #ffffff;
  --manifest-border: #e2e8f0;

  --manifest-text-main: #0f172a;
  --manifest-text-sub: #475569;
  --manifest-text-muted: #94a3b8;
  --manifest-text-inverse: #ffffff;
  
  --manifest-radius-sm: 0.375rem;
  --manifest-radius-md: 0.75rem;
  --manifest-radius-lg: 1rem;
  --manifest-radius-xl: 1.5rem;

  --manifest-ease: cubic-bezier(0.4, 0, 0.2, 1);
  --manifest-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --manifest-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
`;

export const SUBTLE_BACKGROUND_STYLE = `
<style type="text/tailwindcss">
  @layer base {
    body {
      @apply bg-manifest-primary text-manifest-main antialiased min-h-screen m-0 
             prose prose-zinc dark:prose-invert max-w-none;
      background: linear-gradient(300deg, var(--manifest-bg-primary), var(--manifest-bg-secondary), var(--manifest-bg-tertiary));
      background-size: 200% 200%;
      animation: manifest-gradient 15s ease infinite;
    }
    
    /* Ensure typography doesn't force a max-width on the app layout */
    .prose {
      max-width: none !important;
    }

    /* Accessibility: Visible Focus States for Keyboard Navigation */
    :focus-visible {
      @apply outline-none ring-2 ring-manifest-accent ring-offset-2 ring-offset-manifest-primary;
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
    .btn {
      @apply cursor-pointer transition-all duration-200 select-none font-medium no-underline inline-flex items-center justify-center;
      border-radius: var(--manifest-radius-md);
    }
    
    .btn-primary {
      @apply bg-manifest-accent text-manifest-inverse shadow-manifest-sm hover:bg-manifest-accent-hover !no-underline;
    }

    .card {
      @apply bg-manifest-card border border-manifest-border rounded-manifest-lg shadow-manifest-sm overflow-hidden not-prose;
    }
  }

  [data-animate="true"] {
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
      if (e.data?.command === 'enable-drag') enabled = true;
      if (e.data?.command === 'disable-drag') enabled = false;
    });

    document.addEventListener('mousedown', (e) => {
      if (!enabled) return;
      activeItem = e.target.closest('div, section, button, img, .card');
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

export const ACCESSIBILITY_AUDIT_SCRIPT = `
<script>
  /**
   * MANIFEST ACCESSIBILITY GUARDIAN v2.0
   * Audits and repairs accessibility gaps in real-time.
   */
  (function() {
    function auditAccessibility() {
      const issues = [];
      
      // 1. Repair Button/Link Labels
      const actions = document.querySelectorAll('button, a, [role="button"]');
      actions.forEach(el => {
        const label = el.innerText.trim() || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
        if (!label) {
          const svg = el.querySelector('svg');
          if (svg) {
            const svgTitle = svg.querySelector('title')?.textContent || "Action Icon";
            el.setAttribute('aria-label', svgTitle);
            if (!svg.getAttribute('aria-hidden')) svg.setAttribute('aria-hidden', 'true');
          } else {
            const fallback = el.id || el.className?.split(' ')[0] || 'Action';
            el.setAttribute('aria-label', fallback.replace(/[-_]/g, ' '));
            issues.push({ type: 'warning', msg: 'Button missing descriptive label.', target: el.tagName });
          }
        }
      });

      // 2. Repair Image Alt Tags
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (!img.hasAttribute('alt')) {
          img.setAttribute('alt', ''); // Default to decorative if missing
          issues.push({ type: 'info', msg: 'Image missing alt attribute.', target: 'IMG' });
        }
      });
      
      // 3. Form Control Labels
      const inputs = document.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        const id = input.id;
        const label = (id && document.querySelector('label[for="' + id + '"]')) || input.getAttribute('aria-label');
        if (!label) {
          const placeholder = input.getAttribute('placeholder');
          if (placeholder) input.setAttribute('aria-label', placeholder);
          issues.push({ type: 'warning', msg: 'Input missing explicit label.', target: input.tagName });
        }
      });

      // 4. Heading Hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      if (headings.length > 0 && headings[0].tagName !== 'H1') {
        issues.push({ type: 'warning', msg: 'Heading hierarchy should start with H1.', target: 'Headings' });
      }

      // Ensure language is set
      if (!document.documentElement.getAttribute('lang')) {
        document.documentElement.setAttribute('lang', 'en');
      }

      // Report to host
      window.parent.postMessage({ type: 'accessibility-audit', issues }, '*');
    }

    window.addEventListener('load', auditAccessibility);
    const observer = new MutationObserver(() => auditAccessibility());
    observer.observe(document.body, { childList: true, subtree: true });
  })();
</script>
`;
