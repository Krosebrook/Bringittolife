
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * World-class HTML to React Component Transformer.
 * Intelligently decomposes flat HTML into a modular React architecture.
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

function elementToJSX(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ? node.textContent.replace(/{/g, '{"{"}').replace(/}/g, '{"}"}') : '';
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
      // Preserve event handlers as data attributes for visibility, 
      // though functional mapping requires manual wiring.
      attributes.push(`data-${name}="${attr.value.replace(/"/g, '&quot;')}"`);
    } else {
      if (['disabled', 'checked', 'required', 'readOnly', 'hidden'].includes(name) && (attr.value === '' || attr.value === 'true')) {
        attributes.push(`${name}={true}`);
      } else {
        attributes.push(`${name}="${attr.value.replace(/"/g, '&quot;')}"`);
      }
    }
  }

  const children = Array.from(el.childNodes)
    .map(child => elementToJSX(child))
    .join('');

  const selfClosing = ['img', 'input', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr'].includes(tagName);
  
  if (selfClosing) {
    return `<${tagName} ${attributes.join(' ')} />`;
  }
  
  return `<${tagName} ${attributes.join(' ')}>${children}</${tagName}>`;
}

export function convertToReactComponent(html: string, originalName: string = 'ManifestedApp'): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const safeName = originalName.replace(/[^a-zA-Z0-9]/g, '') || 'ManifestedApp';
  
  const styles = Array.from(doc.querySelectorAll('style'))
    .map(s => s.textContent)
    .join('\n');

  const scripts = Array.from(doc.querySelectorAll('script'))
    .map(s => s.textContent)
    .join('\n');

  const body = doc.body;
  const subComponents: { name: string, jsx: string }[] = [];
  
  // Strategy: Identify top-level semantic sections
  const containers = body.querySelectorAll('header, main, footer, section, nav, aside');
  const targets = containers.length > 0 
    ? Array.from(containers).filter(c => c.parentElement === body)
    : Array.from(body.children);

  const mainJSXParts: string[] = [];

  targets.forEach((el, index) => {
    const baseName = el.tagName.toLowerCase();
    const componentName = `${baseName.charAt(0).toUpperCase() + baseName.slice(1)}Section${index + 1}`;
    const jsx = elementToJSX(el);
    
    subComponents.push({ name: componentName, jsx });
    mainJSXParts.push(`<${componentName} />`);
  });

  if (mainJSXParts.length === 0 && body.innerHTML.trim() !== '') {
      mainJSXParts.push(elementToJSX(body));
  }

  const subComponentCode = subComponents.map(comp => `
const ${comp.name} = () => (
  ${comp.jsx}
);
`).join('\n');

  return `
import React, { useEffect, useState } from 'react';

/**
 * ${safeName} Component
 * Automated React transmutation of manifested AI artifact.
 */

${subComponentCode}

export default function ${safeName}() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      // Injected Logic Engine
      ${scripts ? scripts : '// No internal scripts detected'}
    } catch (error) {
      console.warn("[${safeName}] Initialization warning:", error);
    }
  }, []);

  return (
    <div className="manifest-root min-h-screen bg-white">
      <style dangerouslySetInnerHTML={{ __html: \`${styles.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\` }} />
      
      <div className="manifest-content">
        ${mainJSXParts.join('\n        ')}
      </div>

      {!isMounted && (
        <div className="fixed inset-0 bg-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}
`.trim();
}
