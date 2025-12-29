
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { THEME_VARIABLES } from './injection';
import { ThemeState } from '../types';

/**
 * PRODUCTION-GRADE HTML TO REACT ARCHITECT v4.0
 * ---------------------------------------------------------
 * Performs deep semantic analysis and structural inference to transfigure 
 * flat artifact HTML into a modular, production-ready React application.
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
  'stroke-opacity': 'strokeOpacity',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'fill-rule': 'fillRule',
  'fill-opacity': 'fillOpacity',
  'clip-rule': 'clipRule',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
  'font-family': 'fontFamily',
  'font-size': 'fontSize',
  'text-anchor': 'textAnchor',
  'gradientunits': 'gradientUnits',
  'preserveaspectratio': 'preserveAspectRatio',
  'xlink:href': 'xlinkHref',
  'aria-label': 'aria-label', // React supports aria-* as is
};

function toPascalCase(str: string) {
  if (!str) return 'Component';
  return str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

function toCamelCase(str: string) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

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

interface StateInfo {
  id: string;
  name: string;
  initialValue: string;
  type: 'string' | 'boolean' | 'number';
}

/**
 * Recursively converts a DOM node into a JSX string.
 */
function elementToJSX(node: Node, stateMap: Map<HTMLElement, StateInfo>, depth: number = 0): string {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim();
    if (!text) return '';
    // Escape curly braces for JSX
    return text.replace(/{/g, '{"{"}').replace(/}/g, '{"}"}');
  }
  
  if (node.nodeType === Node.COMMENT_NODE) {
    return `{/* ${node.textContent} */}`;
  }
  
  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const el = node as HTMLElement;
  const tagName = el.tagName.toLowerCase();
  
  // Skip technical tags already handled by the root wrapper
  if (['script', 'style', 'title', 'meta', 'link'].includes(tagName)) return '';

  const attributes: string[] = [];
  const state = stateMap.get(el);

  for (let i = 0; i < el.attributes.length; i++) {
    const attr = el.attributes[i];
    const originalName = attr.name.toLowerCase();
    const name = ATTRIBUTE_MAP[originalName] || originalName;
    
    // Controlled components: value and checked are handled via state mapping
    if (state && (name === 'value' || name === 'checked')) continue;

    if (name === 'style') {
      attributes.push(`${name}={${parseStyle(attr.value)}}`);
    } else if (name === 'className') {
      attributes.push(`${name}="${attr.value}"`);
    } else if (name.startsWith('on')) {
      // Invert local handlers to React event placeholders
      const handlerName = name.charAt(0).toUpperCase() + name.slice(1);
      attributes.push(`${handlerName}={() => console.log("${tagName} ${name} triggered")}`);
    } else if (['disabled', 'checked', 'required', 'readOnly', 'hidden', 'autoFocus'].includes(name)) {
      if (attr.value === '' || attr.value === 'true' || attr.value === name) {
        attributes.push(`${name}={true}`);
      }
    } else {
      // General attribute escaping
      attributes.push(`${name}="${attr.value.replace(/"/g, '&quot;')}"`);
    }
  }

  // Inject state management logic for interactive elements
  if (state) {
    if (state.type === 'boolean') {
      attributes.push(`checked={uiState.${state.name}}`);
      attributes.push(`onChange={(e) => updateState('${state.name}', e.target.checked)}`);
    } else {
      attributes.push(`value={uiState.${state.name}}`);
      attributes.push(`onChange={(e) => updateState('${state.name}', e.target.value)}`);
    }
  }

  const children = Array.from(el.childNodes)
    .map(child => elementToJSX(child, stateMap, depth + 1))
    .join('');

  const selfClosing = ['img', 'input', 'br', 'hr', 'source', 'track', 'wbr', 'area', 'base', 'col', 'embed', 'param'].includes(tagName);
  
  if (selfClosing) return `<${tagName} ${attributes.join(' ')} />`;
  return `<${tagName} ${attributes.join(' ')}>${children}</${tagName}>`;
}

/**
 * The primary entry point for HTML-to-React transmutation.
 */
export function convertToReactComponent(html: string, originalName: string = 'ManifestedApp', customCss: string = '', theme?: ThemeState): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const safeName = toPascalCase(originalName) || 'ManifestedApp';
  
  const styles = (customCss || Array.from(doc.querySelectorAll('style'))
    .map(s => s.textContent)
    .join('\n')).trim();

  // Inject current theme HSL values into THEME_VARIABLES string
  let themedVariables = THEME_VARIABLES;
  if (theme) {
    themedVariables = themedVariables
      .replace(/--m-accent-h:\s*\d+;/, `--m-accent-h: ${theme.h};`)
      .replace(/--m-accent-s:\s*\d+%;/, `--m-accent-s: ${theme.s}%;`)
      .replace(/--m-accent-l:\s*\d+%;/, `--m-accent-l: ${theme.l}%;`);
  }

  const body = doc.body;
  const stateMap = new Map<HTMLElement, StateInfo>();
  const globalStates: StateInfo[] = [];

  // INFERENCE ENGINE: Identify interactive state patterns
  const allInputs = body.querySelectorAll('input, textarea, select');
  allInputs.forEach((el, idx) => {
    const input = el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const nameAttr = input.getAttribute('name') || input.id || `field_${idx}`;
    const stateName = toCamelCase(nameAttr);
    
    let type: 'string' | 'boolean' | 'number' = 'string';
    let initialValue = `"${input.value || ''}"`;

    if (input instanceof HTMLInputElement) {
      if (input.type === 'checkbox' || input.type === 'radio') {
        type = 'boolean';
        initialValue = input.checked ? 'true' : 'false';
      } else if (input.type === 'number' || input.type === 'range') {
        type = 'number';
        initialValue = input.value || '0';
      }
    }

    const s: StateInfo = { id: input.id, name: stateName, initialValue, type };
    stateMap.set(el as HTMLElement, s);
    globalStates.push(s);
  });

  // STRUCTURAL INFERENCE: Decompose into semantic sub-components
  const subComponents: { name: string, jsx: string }[] = [];
  
  // We look for significant landmarks or high-level containers
  const semanticContainers = body.querySelectorAll('header, footer, main, nav, section, article, aside');
  const processedElements = new Set<Node>();

  const extractComponent = (el: HTMLElement, index: number) => {
    if (processedElements.has(el)) return;
    
    const tagName = el.tagName.toLowerCase();
    const identifier = el.id || el.getAttribute('aria-label') || el.getAttribute('role') || tagName;
    let componentName = toPascalCase(`${identifier}_${index + 1}`);
    
    // Ensure uniqueness
    let counter = 1;
    while (subComponents.find(c => c.name === componentName)) {
      componentName = toPascalCase(`${identifier}_${index + 1}_${counter++}`);
    }

    const jsx = elementToJSX(el, stateMap);
    subComponents.push({ name: componentName, jsx });
    processedElements.add(el);
  };

  // 1. First pass: Explicit semantic tags
  Array.from(semanticContainers).forEach((el, i) => extractComponent(el as HTMLElement, i));

  // 2. Second pass: Top-level orphaned elements
  Array.from(body.children).forEach((el, i) => {
    if (el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE' && !processedElements.has(el)) {
      extractComponent(el as HTMLElement, i + 100);
    }
  });

  const initialState = globalStates.map(s => `    ${s.name}: ${s.initialValue},`).join('\n');

  const subComponentCode = subComponents.map(comp => `
/**
 * @component ${comp.name}
 * Semantic sub-structure inferred from artifact source.
 */
const ${comp.name} = ({ uiState, updateState }: { uiState: any, updateState: (name: string, value: any) => void }) => {
  return (
    ${comp.jsx}
  );
};
`).join('\n');

  return `
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useState, useCallback } from 'react';

/**
 * ${safeName} Component
 * ---------------------------------------------------------
 * Transmuted by Manifest Engine v4.0 (Production-Grade)
 * Performs semantic decomposition and centralized state inference.
 * 
 * Instructions:
 * 1. Ensure Tailwind CSS is installed in your project.
 * 2. This file contains both component logic and encapsulated styles.
 * 3. Reactive state is automatically mapped to discovered form elements.
 */

const STYLES = \`
${themedVariables}
${styles}
\`;

${subComponentCode}

export default function ${safeName}() {
  const [isMounted, setIsMounted] = useState(false);
  
  /* DISCOVERED UI STATE */
  const [uiState, setUiState] = useState({
${initialState}
  });

  /**
   * Updates centralized UI state with specific value transmutations.
   */
  const updateState = useCallback((name: string, value: any) => {
    setUiState(prev => ({ ...prev, [name]: value }));
    console.debug(\`[${safeName}] State Mutation: \${name} ->\`, value);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    console.log("[${safeName}] Manifest Surface Initialized");
  }, []);

  return (
    <div className="${safeName.toLowerCase()}-root min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      
      <main className="manifest-prose antialiased text-manifest-main bg-manifest-primary">
        ${subComponents.map(c => `<${c.name} uiState={uiState} updateState={updateState} />`).join('\n        ')}
      </main>

      {/* Mounting Overlay */}
      {!isMounted && (
        <div className="fixed inset-0 bg-[#09090b] flex items-center justify-center z-[9999]">
          <div className="flex flex-col items-center gap-6">
            <div className="w-12 h-12 border-t-2 border-manifest-accent rounded-full animate-spin"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 animate-pulse">
              Manifesting React Surface
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
`.trim();
}
