
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const SUBTLE_BACKGROUND_STYLE = `
<style>
  /* Injected background for better aesthetics - using :where(body) to keep specificity low */
  :where(body) {
    background: linear-gradient(300deg, #f8fafc, #eff6ff, #f0fdf4);
    background-size: 200% 200%;
    animation: gradient-animation 15s ease infinite;
    min-height: 100vh;
    margin: 0;
    scroll-behavior: smooth;
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
  /* -------------------------------------------------- */
  /* ENHANCED INTERACTIVE SYSTEM                        */
  /* -------------------------------------------------- */
  
  /* Smooth transitions for all potentially interactive elements */
  button, 
  a, 
  input, 
  select, 
  textarea,
  [role="button"],
  .card,
  section > div {
    transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1) !important;
  }

  /* Magnetic & Lift Effect for Buttons */
  button, 
  .btn, 
  .button,
  [role="button"],
  input[type="submit"] {
    position: relative;
    overflow: hidden;
    cursor: pointer;
  }

  button:hover, 
  .btn:hover, 
  .button:hover,
  [role="button"]:hover {
    transform: translateY(-3px) scale(1.01);
    box-shadow: 0 12px 20px -8px rgba(0, 0, 0, 0.15);
    filter: brightness(1.05);
  }

  button:active, 
  .btn:active, 
  .button:active {
    transform: translateY(1px) scale(0.98);
    transition-duration: 0.1s !important;
  }

  /* Subtle Pulse for Icons inside buttons */
  button svg, 
  .btn svg,
  a svg {
    transition: transform 0.3s ease;
  }

  button:hover svg, 
  .btn:hover svg,
  a:hover svg {
    animation: subtle-pulse 2s infinite ease-in-out;
  }

  @keyframes subtle-pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.15); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
  }

  /* Reveal Animations for Sections */
  main, section, article {
    animation: reveal-up 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
    opacity: 0;
  }

  section:nth-child(1) { animation-delay: 0.1s; }
  section:nth-child(2) { animation-delay: 0.2s; }
  section:nth-child(3) { animation-delay: 0.3s; }
  section:nth-child(4) { animation-delay: 0.4s; }

  @keyframes reveal-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Soft Glow for primary-looking elements */
  .bg-blue-500:hover, 
  .bg-indigo-600:hover,
  button[class*="bg-"]:hover {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
  }

  /* Interactive Links */
  a {
    position: relative;
    text-decoration: none;
  }
  
  a:not([class*="bg-"]):after {
    content: '';
    position: absolute;
    width: 0;
    height: 1px;
    bottom: -2px;
    left: 0;
    background-color: currentColor;
    transition: width 0.3s ease;
    opacity: 0.7;
  }

  a:not([class*="bg-"]):hover:after {
    width: 100%;
  }

  /* Skeleton loading state shimmer for anything with .loading class */
  .loading {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
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
