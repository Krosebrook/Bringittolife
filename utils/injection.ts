
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

.dark {
  --manifest-bg-primary: #020617;
  --manifest-bg-secondary: #0f172a;
  --manifest-bg-tertiary: #1e293b;
  --manifest-bg-card: #0f172a;
  --manifest-border: #1e293b;
  --manifest-text-main: #f8fafc;
  --manifest-text-sub: #94a3b8;
  --manifest-text-muted: #64748b;
}
`;

export const SUBTLE_BACKGROUND_STYLE = `
<style type="text/tailwindcss">
  @layer base {
    body {
      @apply bg-manifest-primary text-manifest-main antialiased min-h-screen m-0;
      background: linear-gradient(30deg, var(--manifest-bg-primary), var(--manifest-bg-secondary));
      background-attachment: fixed;
    }

    .manifest-prose {
      @apply prose prose-zinc dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-p:leading-relaxed prose-a:no-underline hover:prose-a:underline;
      --tw-prose-body: var(--manifest-text-main);
      --tw-prose-headings: var(--manifest-text-main);
      --tw-prose-lead: var(--manifest-text-sub);
      --tw-prose-links: var(--manifest-accent);
      --tw-prose-bold: var(--manifest-text-main);
      --tw-prose-counters: var(--manifest-text-muted);
      --tw-prose-bullets: var(--manifest-text-muted);
      --tw-prose-hr: var(--manifest-border);
      --tw-prose-quotes: var(--manifest-text-main);
      --tw-prose-quote-borders: var(--manifest-accent);
      --tw-prose-captions: var(--manifest-text-muted);
      --tw-prose-code: var(--manifest-accent);
      --tw-prose-pre-code: var(--manifest-text-inverse);
      --tw-prose-pre-bg: #0f172a;
      --tw-prose-th-borders: var(--manifest-border);
      --tw-prose-td-borders: var(--manifest-border);
    }

    :focus-visible {
      @apply outline-none ring-2 ring-manifest-accent ring-offset-2 ring-offset-manifest-primary transition-all;
    }
  }
</style>
`;

export const INTERACTIVE_STYLES = `
<style type="text/tailwindcss">
  @layer components {
    .btn {
      @apply cursor-pointer transition-all duration-200 select-none font-semibold no-underline inline-flex items-center justify-center px-5 py-2.5 active:scale-[0.98];
      border-radius: var(--manifest-radius-md);
    }
    
    .btn-primary {
      @apply bg-manifest-accent text-manifest-inverse shadow-manifest-md hover:bg-manifest-accent-hover !no-underline;
    }

    .btn-secondary {
      @apply bg-manifest-bg-secondary text-manifest-main border border-manifest-border hover:bg-manifest-border !no-underline;
    }

    .card {
      @apply bg-manifest-card border border-manifest-border rounded-manifest-lg shadow-manifest-sm overflow-hidden transition-all hover:shadow-manifest-md;
    }
  }

  [data-animate="true"] {
    animation: manifest-fade-in 0.6s var(--manifest-ease) forwards;
  }

  @keyframes manifest-fade-in {
    from { opacity: 0; transform: translateY(12px); }
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
  (function() {
    function auditAccessibility() {
      const issues = [];
      
      // 1. Check Interactive Elements for Labels
      const actions = document.querySelectorAll('button, a, [role="button"]');
      actions.forEach((el, i) => {
        const text = el.innerText.trim();
        const ariaLabel = el.getAttribute('aria-label');
        const ariaLabelledBy = el.getAttribute('aria-labelledby');
        const hasAccessibleName = text || ariaLabel || ariaLabelledBy;
        
        if (!hasAccessibleName) {
          issues.push({
            id: 'missing-label-' + i,
            type: 'critical',
            element: el.tagName.toLowerCase(),
            message: 'Interactive element has no accessible name.',
            suggestion: 'Add an aria-label attribute or inner text that describes the action.',
            selector: el.id ? '#' + el.id : el.tagName.toLowerCase() + ':nth-child(' + (i+1) + ')'
          });
        }
      });

      // 2. Check Images for Alt Text
      const images = document.querySelectorAll('img');
      images.forEach((img, i) => {
        if (!img.hasAttribute('alt')) {
          issues.push({
            id: 'missing-alt-' + i,
            type: 'critical',
            element: 'img',
            message: 'Image is missing an alt attribute.',
            suggestion: 'Add an alt="" attribute for decorative images, or a descriptive alternative text for informative images.',
            selector: img.id ? '#' + img.id : 'img:nth-child(' + (i+1) + ')'
          });
        }
      });

      // 3. Check for Semantic Landmarks
      const landmarks = ['main', 'nav', 'header', 'footer'];
      landmarks.forEach(tag => {
        if (!document.querySelector(tag)) {
          issues.push({
            id: 'missing-landmark-' + tag,
            type: 'warning',
            element: 'document',
            message: 'Missing <' + tag + '> semantic landmark.',
            suggestion: 'Wrap your content in appropriate semantic tags like <' + tag + '> to help screen reader navigation.',
            selector: 'body'
          });
        }
      });

      // 4. Check Form Inputs for Labels
      const inputs = document.querySelectorAll('input, select, textarea');
      inputs.forEach((input, i) => {
        const id = input.id;
        const hasLabel = id && document.querySelector('label[for="' + id + '"]');
        const hasAriaLabel = input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby');
        
        if (!hasLabel && !hasAriaLabel) {
          issues.push({
            id: 'missing-input-label-' + i,
            type: 'critical',
            element: 'input',
            message: 'Form input has no associated label.',
            suggestion: 'Use a <label for="' + (id || 'id') + '"> element or add an aria-label to identify the field.',
            selector: id ? '#' + id : 'input:nth-child(' + (i+1) + ')'
          });
        }
      });

      window.parent.postMessage({ type: 'accessibility-audit', issues }, '*');
    }

    window.addEventListener('load', auditAccessibility);
    const observer = new MutationObserver(() => auditAccessibility());
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
  })();
</script>
`;
