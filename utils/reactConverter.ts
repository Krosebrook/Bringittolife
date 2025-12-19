
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * World-class HTML to React Component Transformer.
 * Uses the browser's DOMParser to intelligently decompose flat HTML 
 * into a modular, reusable React architecture.
 */

interface ComponentModule {
  name: string;
  jsx: string;
}

const ATTRIBUTE_MAP: Record<string, string> = {
  'class': 'className',
  'for': 'htmlFor',
  'tabindex': 'tabIndex',
  'autoplay': 'autoPlay',
  'onclick': 'onClick',
  'onchange': 'onChange',
  'onsubmit': 'onSubmit',
  'autocomplete': 'autoComplete',
  'autofocus': 'autoFocus',
  'readonly': 'readOnly',
  'maxlength': 'maxLength',
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'fill-rule': 'fillRule',
  'clip-rule': 'clipRule',
  'viewbox': 'viewBox',
};

function toCamelCase(str: string) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

function parseStyle(style: CSSStyleDeclaration): string {
  if (!style || style.length === 0) return '';
  const obj: Record<string, string> = {};
  for (let i = 0; i < style.length; i++) {
    const prop = style[i];
    obj[toCamelCase(prop)] = style.getPropertyValue(prop);
  }
  return JSON.stringify(obj);
}

function elementToJSX(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || '';
  }
  if (node.nodeType === Node.COMMENT_NODE) {
    return `{/* ${node.textContent} */}`;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const el = node as HTMLElement;
  const tagName = el.tagName.toLowerCase();
  
  // Skip script and style tags as they are handled separately
  if (tagName === 'script' || tagName === 'style') return '';

  const attributes: string[] = [];
  
  for (let i = 0; i < el.attributes.length; i++) {
    const attr = el.attributes[i];
    const name = ATTRIBUTE_MAP[attr.name.toLowerCase()] || attr.name;
    
    if (name === 'style') {
      attributes.push(`${name}={${parseStyle(el.style)}}`);
    } else if (name.startsWith('on')) {
      // Event handlers are tricky to convert from string to React without state mapping.
      // We keep them as data attributes for transparency or as a starting point.
      attributes.push(`data-${name}="${attr.value}"`);
    } else {
      attributes.push(`${name}="${attr.value.replace(/"/g, '&quot;')}"`);
    }
  }

  const children = Array.from(el.childNodes)
    .map(child => elementToJSX(child))
    .join('');

  const selfClosing = ['img', 'input', 'br', 'hr', 'meta', 'link'].includes(tagName);
  
  if (selfClosing) {
    return `<${tagName} ${attributes.join(' ')} />`;
  }
  
  return `<${tagName} ${attributes.join(' ')}>${children}</${tagName}>`;
}

export function convertToReactComponent(html: string, originalName: string = 'ManifestedApp'): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const safeName = originalName.replace(/[^a-zA-Z0-9]/g, '') || 'ManifestedApp';
  
  // 1. Extract Styles
  const styles = Array.from(doc.querySelectorAll('style'))
    .map(s => s.textContent)
    .join('\n');

  // 2. Extract Scripts
  const scripts = Array.from(doc.querySelectorAll('script'))
    .map(s => s.textContent)
    .join('\n');

  // 3. Decompose Body into Modular Sections
  const body = doc.body;
  const subComponents: ComponentModule[] = [];
  
  // Find major semantic containers to convert into sub-components
  const containers = body.querySelectorAll('header, main, footer, section, nav, aside');
  
  // If we have semantic containers, use them. Otherwise, take top-level children.
  const targets = containers.length > 0 
    ? Array.from(containers).filter(c => c.parentElement === body)
    : Array.from(body.children);

  const mainJSXParts: string[] = [];

  targets.forEach((el, index) => {
    const tagName = el.tagName.toLowerCase();
    const componentName = `${tagName.charAt(0).toUpperCase() + tagName.slice(1)}${index + 1}`;
    const jsx = elementToJSX(el);
    
    subComponents.push({ name: componentName, jsx });
    mainJSXParts.push(`<${componentName} />`);
  });

  // Handle any orphan text nodes or elements not caught in targets
  if (mainJSXParts.length === 0) {
      mainJSXParts.push(elementToJSX(body));
  }

  // 4. Construct the Final File Content
  const subComponentCode = subComponents.map(comp => `
/**
 * Sub-component: ${comp.name}
 */
const ${comp.name} = () => (
  ${comp.jsx}
);
`).join('\n');

  return `
import React, { useEffect, useState } from 'react';

/**
 * ${safeName} Component
 * 
 * This component was Manifested by AI.
 * It has been refactored into a modular React structure with semantic sub-components.
 */

${subComponentCode}

export default function ${safeName}() {
  // Local state management for interactive elements (Draft)
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Original script logic integration
    try {
      ${scripts}
      setIsInitialized(true);
    } catch (error) {
      console.error("[${safeName}] Initialization fault:", error);
    }
  }, []);

  return (
    <div className="${safeName.toLowerCase()}-manifestation bg-white min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: \`${styles.replace(/`/g, '\\`')}\` }} />
      
      {/* Root Layout Composition */}
      <div className="layout-root">
        ${mainJSXParts.join('\n        ')}
      </div>

      {!isInitialized && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="animate-pulse text-zinc-400 font-mono text-xs uppercase tracking-widest">
            Syncing State...
          </div>
        </div>
      )}
    </div>
  );
}
`.trim();
}
