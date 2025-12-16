/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const SUBTLE_BACKGROUND_STYLE = `
<style>
  /* Injected background for better aesthetics - using :where(body) to keep specificity low (0) so user styles can override */
  :where(body) {
    background: linear-gradient(300deg, #f8fafc, #eff6ff, #f0fdf4);
    background-size: 200% 200%;
    animation: gradient-animation 15s ease infinite;
    min-height: 100vh;
    margin: 0;
  }

  @keyframes gradient-animation {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
</style>
`;

export const INTERACTIVE_STYLES = `
<style>
  /* Injected by LivePreview to enhance interactivity */
  
  /* Base interactive element styles */
  button, 
  a, 
  input[type="submit"], 
  input[type="button"], 
  input[type="reset"],
  [role="button"], 
  .btn, 
  .button {
    transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important; /* Material Standard Curve */
    position: relative !important;
    cursor: pointer !important;
    will-change: transform, box-shadow, filter !important;
    -webkit-tap-highlight-color: transparent !important;
  }

  /* Hover state: Lift, scale, and brighten with a springy feel */
  button:hover, 
  a:hover, 
  input[type="submit"]:hover, 
  input[type="button"]:hover, 
  input[type="reset"]:hover,
  [role="button"]:hover, 
  .btn:hover, 
  .button:hover {
    transform: translateY(-2px) scale(1.02) !important;
    filter: brightness(1.1) saturate(1.1) !important;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
    z-index: 10 !important;
  }

  /* Active state: distinct press down effect */
  button:active, 
  a:active, 
  input[type="submit"]:active, 
  input[type="button"]:active, 
  input[type="reset"]:active,
  [role="button"]:active, 
  .btn:active, 
  .button:active {
    transform: translateY(1px) scale(0.98) !important;
    filter: brightness(0.9) !important;
    box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06) !important;
    transition-duration: 0.05s !important;
  }

  /* Focus visible: Clear accessibility ring */
  button:focus-visible,
  a:focus-visible,
  input:focus-visible,
  [role="button"]:focus-visible,
  .btn:focus-visible,
  .button:focus-visible {
    outline: 2px solid #3b82f6 !important;
    outline-offset: 2px !important;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3) !important;
    z-index: 20 !important;
  }

  /* Input focus states - Enhanced with lift */
  input:not([type="button"]):not([type="submit"]):not([type="reset"]):focus, 
  textarea:focus, 
  select:focus {
    border-color: #3b82f6 !important;
    outline: none !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
    transform: translateY(-1px) !important;
    transition: all 0.2s ease !important;
    background-color: #ffffff !important;
  }
</style>
`;

export const DRAG_SCRIPT = `
<script>
  (function() {
    let enabled = false;
    let activeItem = null;
    let initialX = 0;
    let initialY = 0;
    let xOffset = 0;
    let yOffset = 0;

    window.addEventListener('message', (event) => {
      if (event.data === 'enable-drag') {
        enabled = true;
        const style = document.createElement('style');
        style.id = 'drag-mode-style';
        style.innerHTML = '* { cursor: grab !important; user-select: none !important; } .dragging { cursor: grabbing !important; opacity: 0.9 !important; z-index: 99999 !important; transform: scale(1.02) !important; outline: 4px dashed #3b82f6 !important; outline-offset: 4px !important; box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.5), 0 0 0 6px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.6) !important; transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1) !important; }';
        document.head.appendChild(style);
      } else if (event.data === 'disable-drag') {
        enabled = false;
        const style = document.getElementById('drag-mode-style');
        if (style) style.remove();
        document.body.style.cursor = '';
      }
    });

    document.addEventListener('mousedown', dragStart);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('mousemove', drag);

    function dragStart(e) {
      if (!enabled) return;
      if (e.target === document.body || e.target === document.documentElement) return;
      
      activeItem = e.target;
      
      const style = window.getComputedStyle(activeItem);
      const matrix = new (window.DOMMatrix || window.WebKitCSSMatrix)(style.transform);
      xOffset = matrix.m41;
      yOffset = matrix.m42;
      
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;

      if (activeItem) {
        activeItem.classList.add('dragging');
      }
    }

    function dragEnd(e) {
      if (!activeItem) return;
      activeItem.classList.remove('dragging');
      activeItem = null;
    }

    function drag(e) {
      if (activeItem && enabled) {
        e.preventDefault();
        
        const currentX = e.clientX - initialX;
        const currentY = e.clientY - initialY;

        activeItem.style.transform = "translate3d(" + currentX + "px, " + currentY + "px, 0)";
      }
    }
  })();
</script>
`;