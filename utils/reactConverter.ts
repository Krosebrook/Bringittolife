
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { THEME_VARIABLES } from './injection';

/**
 * PRODUCTION-GRADE HTML TO REACT ARCHITECT
 * ---------------------------------------------------------
 * Performs deep semantic analysis of flat artifact HTML and transfigures it 
 * into a modular, state-aware React application.
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

/**
 * Normalizes CSS property keys to camelCase for React's style object.
 */
function toCamelCase(str: string) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

/**
 * Transmutes a standard CSS style string into a JSON object literal.
 */
function parseStyle(styleString: string): string {
  if (!styleString) return '{}';
  const styleObj: Record<string, string> = {};
  styleString.split(';').forEach(pair => {
    const parts = pair.split(':');
    if (parts.length < 2) return;
    const key = parts[0].trim();
    const value = parts.slice(1).join(':').trim();
    if (key && value) {
      styleObj[toCamelCase(key)] = value;
    }
  });
  return JSON.stringify(styleObj);
}

/**
 * INFERRED STATE MODEL
 */
interface StateInfo {
  name: string;
  initialValue: string;
  type: 'string' | 'boolean';
}

/**
 * Discovers interactive elements and creates logical state bindings.
 */
function extractStateFromNode(el: HTMLElement): StateInfo[] {
  const states: StateInfo[] = [];
  const id = el.id || (el as any).name || `el_${Math.random().toString(36).substring(2, 7)}`;
  const camelId = toCamelCase(id);

  if (el.tagName === 'INPUT') {
    const input = el as HTMLInputElement;
    if (input.type === 'checkbox' || input.type === 'radio') {
      states.push({ name: camelId, initialValue: 'false', type: 'boolean' });
    } else {
      states.push({ name: camelId, initialValue: `"${input.value || ''}"`, type: 'string' });
    }
  } else if (el.tagName === 'TEXTAREA') {
    states.push({ name: camelId, initialValue: `"${el.textContent?.trim() || ''}"`, type: 'string' });
  } else if (el.tagName === 'SELECT') {
    states.push({ name: camelId, initialValue: '"' + (el as HTMLSelectElement).value + '"', type: 'string' });
  }
  return states;
}

/**
 * Recursively converts a DOM node into a JSX string.
 */
function elementToJSX(node: Node, stateMap: Map<HTMLElement, StateInfo>, depth: number = 0): string {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim();
    if (!text) return '';
    return text.replace(/{/g, '{"{"}').replace(/}/g, '{"}"}');
  }
  if (node.nodeType === Node.COMMENT_NODE) {
    return `{/* ${node.textContent} */}`;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const el = node as HTMLElement;
  const tagName = el.tagName.toLowerCase();
  if (tagName === 'script' || tagName === 'style') return '';

  const attributes: string[] = [];
  const state = stateMap.get(el);

  for (let i = 0; i < el.attributes.length; i++) {
    const attr = el.attributes[i];
    const name = ATTRIBUTE_MAP[attr.name.toLowerCase()] || attr.name;
    
    if (name === 'style') {
      attributes.push(`${name}={${parseStyle(attr.value)}}`);
    } else if (name === 'className') {
      attributes.push(`${name}="${attr.value}"`);
    } else if (name.startsWith('on')) {
      attributes.push(`${name}={() => console.log("${name} fired")}`);
    } else {
      if (['disabled', 'checked', 'required', 'readOnly', 'hidden'].includes(name) && (attr.value === '' || attr.value === 'true')) {
        attributes.push(`${name}={true}`);
      } else {
        attributes.push(`${name}="${attr.value.replace(/"/g, '&quot;')}"`);
      }
    }
  }

  // Inject dynamic state binding
  if (state) {
    if (state.type === 'boolean') {
      attributes.push(`checked={${state.name}}`);
      attributes.push(`onChange={(e) => set${state.name.charAt(0).toUpperCase() + state.name.slice(1)}(e.target.checked)}`);
    } else {
      attributes.push(`value={${state.name}}`);
      attributes.push(`onChange={(e) => set${state.name.charAt(0).toUpperCase() + state.name.slice(1)}(e.target.value)}`);
    }
  }

  const children = Array.from(el.childNodes)
    .map(child => elementToJSX(child, stateMap, depth + 1))
    .join('');

  const selfClosing = ['img', 'input', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr'].includes(tagName);
  
  if (selfClosing) return `<${tagName} ${attributes.join(' ')} />`;
  return `<${tagName} ${attributes.join(' ')}>${children}</${tagName}>`;
}

/**
 * The primary entry point for HTML-to-React transmutation.
 */
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
  const stateMap = new Map<HTMLElement, StateInfo>();
  const globalStates: StateInfo[] = [];

  // Deep traversal for state discovery
  const allInteractive = body.querySelectorAll('input, textarea, select');
  allInteractive.forEach(el => {
    const s = extractStateFromNode(el as HTMLElement);
    if (s.length > 0) {
      stateMap.set(el as HTMLElement, s[0]);
      globalStates.push(s[0]);
    }
  });

  const subComponents: { name: string, jsx: string, stateful: boolean }[] = [];
  const rootElements = Array.from(body.children).filter(el => el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE');
  const mainJSXParts: string[] = [];

  rootElements.forEach((el, index) => {
    const htmlEl = el as HTMLElement;
    const baseName = htmlEl.tagName.toLowerCase();
    const id = htmlEl.id || `Block${index + 1}`;
    const componentName = `${baseName.charAt(0).toUpperCase() + baseName.slice(1)}${toCamelCase(id).charAt(0).toUpperCase() + toCamelCase(id).slice(1)}`;
    
    const hasInteractive = htmlEl.querySelectorAll('button, input, select, textarea').length > 0;
    const jsx = elementToJSX(htmlEl, stateMap);
    
    subComponents.push({ name: componentName, jsx, stateful: hasInteractive });
    mainJSXParts.push(`<${componentName} />`);
  });

  if (mainJSXParts.length === 0 && body.innerHTML.trim() !== '') {
    mainJSXParts.push(elementToJSX(body, stateMap));
  }

  const stateHooks = globalStates.map(s => 
    `  const [${s.name}, set${s.name.charAt(0).toUpperCase() + s.name.slice(1)}] = useState(${s.initialValue});`
  ).join('\n');

  const subComponentCode = subComponents.map(comp => `
/**
 * ${comp.name} Component
 * Structural fragment inferred from artifact hierarchy.
 */
const ${comp.name} = () => {
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
 * Transmuted by Manifest Engine v2.5
 * Refined HTML-to-React conversion with automated state induction,
 * lifecycle preservation, and Tailwind CSS compatibility.
 */

const GLOBAL_STYLES = \`
${THEME_VARIABLES}
${styles}
\`;

${subComponentCode}

export default function ${safeName}() {
  const [isMounted, setIsMounted] = useState(false);
  
  /* Induced State Management */
${stateHooks}

  useEffect(() => {
    setIsMounted(true);
    
    /* Extracted Legacy Logic */
    try {
      ${scripts ? scripts.split('\n').map(line => '      ' + line).join('\n') : '// No legacy script logic detected.'}
    } catch (error) {
      console.error("[${safeName}] Lifecycle Fault:", error);
    }
  }, []);

  return (
    <div className="manifest-app-wrapper min-h-screen bg-zinc-50">
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />
      
      <main className="manifest-viewport antialiased text-manifest-main bg-manifest-primary">
        ${mainJSXParts.join('\n        ')}
      </main>

      {!isMounted && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="w-12 h-12 border-4 border-manifest-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
`.trim();
}
