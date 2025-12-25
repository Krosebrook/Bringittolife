
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { THEME_VARIABLES } from './injection';

/**
 * World-class HTML to React Component Transformer.
 * Intelligently decomposes flat HTML into a modular, state-aware React architecture.
 */

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
  'viewbox': 'viewBox',
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'fill-rule': 'fillRule',
  'clip-rule': 'clipRule',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
  'font-family': 'fontFamily',
  'font-size': 'fontSize',
  'text-anchor': 'textAnchor',
  'gradientunits': 'gradientUnits',
  'preserveaspectratio': 'preserveAspectRatio',
};

function toCamelCase(str: string) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

function parseStyle(styleString: string): string {
  if (!styleString) return '{}';
  const styleObj: Record<string, string> = {};
  styleString.split(';').forEach(pair => {
    const [key, value] = pair.split(':').map(s => s.trim());
    if (key && value) {
      styleObj[toCamelCase(key)] = value;
    }
  });
  return JSON.stringify(styleObj);
}

/**
 * Heuristically determines if an element might be a stateful component.
 */
function isPotentialSubComponent(el: HTMLElement): boolean {
  const tagName = el.tagName.toLowerCase();
  const classes = el.className.toLowerCase();
  const id = el.id.toLowerCase();
  
  // Semantic containers are always components
  if (['nav', 'header', 'footer', 'main', 'section', 'aside'].includes(tagName)) return true;
  
  // UI Patterns
  if (classes.includes('card') || classes.includes('modal') || classes.includes('item')) return true;
  
  // ID-based logic
  if (id.includes('container') || id.includes('wrapper') || id.includes('root')) return true;
  
  return false;
}

function elementToJSX(node: Node, depth: number = 0): string {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim();
    if (!text) return '';
    return text.replace(/{/g, '{"{"}').replace(/}/g, '{"}"}');
  }
  if (node.nodeType === Node.COMMENT_NODE) {
    return `{/* ${node.textContent} */}`;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const el = node as HTMLElement;
  const tagName = el.tagName.toLowerCase();
  
  if (tagName === 'script' || tagName === 'style') return '';

  const attributes: string[] = [];
  
  for (let i = 0; i < el.attributes.length; i++) {
    const attr = el.attributes[i];
    const name = ATTRIBUTE_MAP[attr.name.toLowerCase()] || attr.name;
    
    if (name === 'style') {
      attributes.push(`${name}={${parseStyle(attr.value)}}`);
    } else if (name.startsWith('on')) {
      // Convert raw JS handlers to a generic call pattern
      attributes.push(`${name}={() => console.log("${name} triggered")}`);
    } else {
      if (['disabled', 'checked', 'required', 'readOnly', 'hidden'].includes(name) && (attr.value === '' || attr.value === 'true')) {
        attributes.push(`${name}={true}`);
      } else {
        attributes.push(`${name}="${attr.value.replace(/"/g, '&quot;')}"`);
      }
    }
  }

  const children = Array.from(el.childNodes)
    .map(child => elementToJSX(child, depth + 1))
    .join('');

  const selfClosing = ['img', 'input', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr'].includes(tagName);
  
  if (selfClosing) {
    return `<${tagName} ${attributes.join(' ')} />`;
  }
  
  return `<${tagName} ${attributes.join(' ')}>${children}</${tagName}>`;
}

export function convertToReactComponent(html: string, originalName: string = 'ManifestedApp', customCss: string = ''): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const safeName = originalName.replace(/[^a-zA-Z0-9]/g, '') || 'ManifestedApp';
  
  const styles = (customCss || Array.from(doc.querySelectorAll('style'))
    .map(s => s.textContent)
    .join('\n')).trim();

  const scripts = Array.from(doc.querySelectorAll('script'))
    .map(s => s.textContent)
    .join('\n');

  const body = doc.body;
  const subComponents: { name: string, jsx: string, stateful: boolean }[] = [];
  
  // High-fidelity pattern detection for component decomposition
  const rootElements = Array.from(body.children).filter(el => el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE');
  
  const mainJSXParts: string[] = [];

  rootElements.forEach((el, index) => {
    const htmlEl = el as HTMLElement;
    const baseName = htmlEl.tagName.toLowerCase();
    const id = htmlEl.id || `Block${index + 1}`;
    const componentName = `${baseName.charAt(0).toUpperCase() + baseName.slice(1)}${toCamelCase(id).charAt(0).toUpperCase() + toCamelCase(id).slice(1)}`;
    
    const isStateful = htmlEl.querySelectorAll('button, input, select, textarea').length > 0;
    const jsx = elementToJSX(htmlEl);
    
    subComponents.push({ name: componentName, jsx, stateful: isStateful });
    mainJSXParts.push(`<${componentName} />`);
  });

  if (mainJSXParts.length === 0 && body.innerHTML.trim() !== '') {
      mainJSXParts.push(elementToJSX(body));
  }

  const subComponentCode = subComponents.map(comp => `
/**
 * ${comp.name} Sub-component
 * ${comp.stateful ? 'Detected interactive elements - state management recommended.' : 'Static content block.'}
 */
const ${comp.name} = () => {
  ${comp.stateful ? '// Example State Hooks\n  // const [isActive, setIsActive] = useState(false);' : ''}
  
  return (
    ${comp.jsx}
  );
};
`).join('\n');

  return `
import React, { useEffect, useState } from 'react';

/**
 * ${safeName} Component
 * ---------------------------------------------------------
 * Generated by Manifest Engine v2.1
 * Includes automatic component structural inference and 
 * interactive element state scaffolding.
 */

/* Core Design System Tokens & Custom Styles */
const GLOBAL_STYLES = \`
${THEME_VARIABLES}

/* Artifact-specific Styles */
${styles}
\`;

${subComponentCode}

export default function ${safeName}() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    /* 
     * Transmuted Logic Engine
     * The following block contains logic extracted from the original artifact.
     * Consider refactoring these into React-native useEffects or event handlers.
     */
    try {
      ${scripts ? scripts.split('\n').map(line => '      ' + line).join('\n') : '// No complex logic detected in artifact source.'}
    } catch (error) {
      console.error("[${safeName}] Lifecycle Logic Error:", error);
    }
  }, []);

  return (
    <div className="manifest-root min-h-screen bg-white">
      {/* Dynamic Style Injection */}
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />
      
      {/* Transmuted UI Architecture */}
      <div className="manifest-content antialiased text-manifest-main bg-manifest-primary">
        ${mainJSXParts.join('\n        ')}
      </div>

      {/* Mounting Overlay */}
      {!isMounted && (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-[9999]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-manifest-accent"></div>
        </div>
      )}
    </div>
  );
}
`.trim();
}
