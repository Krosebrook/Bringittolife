
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { THEME_VARIABLES } from './injection';
import { ThemeState } from '../types';

/**
 * PRODUCTION-GRADE HTML TO REACT ARCHITECT v3.1
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
};

function toPascalCase(str: string) {
  return str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
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
    
    if (state && (name === 'value' || name === 'checked')) continue;

    if (name === 'style') {
      attributes.push(`${name}={${parseStyle(attr.value)}}`);
    } else if (name === 'className') {
      attributes.push(`${name}="${attr.value}"`);
    } else if (name === 'onClick') {
      // If it's a button and we want to show it's interactive, we could add a log
      attributes.push(`${name}={() => console.log("${tagName} clicked")}`);
    } else if (name.startsWith('on')) {
      attributes.push(`${name}={(e) => console.log("${name} event", e)}`);
    } else {
      if (['disabled', 'checked', 'required', 'readOnly', 'hidden'].includes(name) && (attr.value === '' || attr.value === 'true')) {
        attributes.push(`${name}={true}`);
      } else {
        attributes.push(`${name}="${attr.value.replace(/"/g, '&quot;')}"`);
      }
    }
  }

  if (state) {
    if (state.type === 'boolean') {
      attributes.push(`checked={formData.${state.name}}`);
      attributes.push(`onChange={(e) => handleInputChange('${state.name}', e.target.checked)}`);
    } else {
      attributes.push(`value={formData.${state.name}}`);
      attributes.push(`onChange={(e) => handleInputChange('${state.name}', e.target.value)}`);
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
export function convertToReactComponent(html: string, originalName: string = 'ManifestedApp', customCss: string = '', theme?: ThemeState): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const safeName = toPascalCase(originalName) || 'ManifestedApp';
  
  const styles = (customCss || Array.from(doc.querySelectorAll('style'))
    .map(s => s.textContent)
    .join('\n')).trim();

  const scripts = Array.from(doc.querySelectorAll('script'))
    .map(s => s.textContent)
    .join('\n');

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

  const subComponents: { name: string, jsx: string }[] = [];
  const rootElements = Array.from(body.children).filter(el => el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE');
  
  rootElements.forEach((el, index) => {
    const htmlEl = el as HTMLElement;
    const tagName = htmlEl.tagName.toLowerCase();
    let componentName = toPascalCase(htmlEl.id || htmlEl.getAttribute('aria-label') || `${tagName}_${index + 1}`);
    
    if (subComponents.find(c => c.name === componentName)) {
        componentName += `_${index}`;
    }

    const jsx = elementToJSX(htmlEl, stateMap);
    subComponents.push({ name: componentName, jsx });
  });

  const initialFormData = globalStates.map(s => `    ${s.name}: ${s.initialValue},`).join('\n');

  const subComponentCode = subComponents.map(comp => `
/**
 * ${comp.name} Component
 */
const ${comp.name} = ({ formData, handleInputChange }: { formData: any, handleInputChange: (name: string, value: any) => void }) => {
  return (
    ${comp.jsx}
  );
};
`).join('\n');

  return `
import React, { useEffect, useState, useCallback } from 'react';

/**
 * ${safeName} Component
 * ---------------------------------------------------------
 * Transmuted by Manifest Engine v3.1 (Production)
 * Advanced HTML-to-React conversion with consolidated state 
 * management and semantic component decomposition.
 */

const GLOBAL_STYLES = \`
${themedVariables}
${styles}
\`;

${subComponentCode}

export default function ${safeName}() {
  const [isMounted, setIsMounted] = useState(false);
  
  /* Consolidated Form State */
  const [formData, setFormData] = useState({
${initialFormData}
  });

  const handleInputChange = useCallback((name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  useEffect(() => {
    setIsMounted(true);
    
    /* Injected Legacy Logic */
    try {
      ${scripts ? scripts.split('\n').map(line => '      ' + line).join('\n') : '// No legacy logic segments detected.'}
    } catch (error) {
      console.error("[${safeName}] Initialization Fault:", error);
    }
  }, []);

  return (
    <div className="manifest-app-root min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />
      
      <main className="manifest-viewport manifest-prose antialiased text-manifest-main bg-manifest-primary">
        ${subComponents.map(c => `<${c.name} formData={formData} handleInputChange={handleInputChange} />`).join('\n        ')}
      </main>

      {!isMounted && (
        <div className="fixed inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-[3px] border-manifest-accent border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 animate-pulse">Initializing Surface</span>
          </div>
        </div>
      )}
    </div>
  );
}
`.trim();
}
