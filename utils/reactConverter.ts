/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

function toCamelCase(str: string) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

function parseStyleString(styleString: string) {
  if (!styleString) return {};
  return styleString.split(';').reduce((acc: any, rule) => {
    const [key, value] = rule.split(':');
    if (key && value) {
      // React style properties are camelCase (e.g., backgroundColor)
      acc[toCamelCase(key.trim())] = value.trim();
    }
    return acc;
  }, {});
}

export function convertToReactComponent(html: string, name: string = 'GeneratedComponent'): string {
  // 1. Extract CSS
  const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  let css = styleMatch ? styleMatch[1] : '';
  
  // Escape backticks in CSS to prevent template literal breakage
  css = css.replace(/`/g, '\\`');

  // 2. Extract JS
  const scriptMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  let js = scriptMatch ? scriptMatch[1] : '';
  
  // 3. Extract Body Content
  let bodyContent = html;
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    bodyContent = bodyMatch[1];
  } else {
      // Fallback: strip head/style/script tags to get body content
      bodyContent = bodyContent.replace(/<head[^>]*>[\s\S]*?<\/head>/i, '');
      bodyContent = bodyContent.replace(/<style[^>]*>[\s\S]*?<\/style>/i, '');
      bodyContent = bodyContent.replace(/<script[^>]*>[\s\S]*?<\/script>/i, '');
  }

  // 4. Transform HTML to JSX
  let jsx = bodyContent;

  // React Attribute Mapping
  const attributeMap: {[key: string]: string} = {
    'class': 'className',
    'for': 'htmlFor',
    'tabindex': 'tabIndex',
    'autoplay': 'autoPlay',
    'allowfullscreen': 'allowFullScreen',
    'autocomplete': 'autoComplete',
    'autofocus': 'autoFocus',
    'readonly': 'readOnly',
    'maxlength': 'maxLength',
    'cellspacing': 'cellSpacing',
    'cellpadding': 'cellPadding',
    'rowspan': 'rowSpan',
    'colspan': 'colSpan',
    'usemap': 'useMap',
    'enctype': 'encType',
    'frameborder': 'frameBorder',
    'crossorigin': 'crossOrigin',
    // SVG attributes
    'stroke-width': 'strokeWidth',
    'stroke-linecap': 'strokeLinecap',
    'stroke-linejoin': 'strokeLinejoin',
    'fill-rule': 'fillRule',
    'clip-rule': 'clipRule',
    'clip-path': 'clipPath',
    'text-anchor': 'textAnchor',
    'dominant-baseline': 'dominantBaseline'
  };

  // Replace attributes with regex to ensure we catch ' attribute="' patterns
  Object.keys(attributeMap).forEach(key => {
    // Look for space + key + ="
    const regex = new RegExp(`\\s${key}="`, 'g');
    jsx = jsx.replace(regex, ` ${attributeMap[key]}="`);
  });

  // Comments
  jsx = jsx.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}');

  // Self-closing tags
  const voidTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
  voidTags.forEach(tag => {
      // Regex to find <tag ... > (not ending in />) and replace with <tag ... />
      // We use a replacer function to check if it's already self-closing.
      const regex = new RegExp(`<(${tag})\\b([^>]*)>`, 'gi');
      jsx = jsx.replace(regex, (match, tagName, attrs) => {
          if (attrs.trim().endsWith('/')) return match; // Already self-closing
          return `<${tagName}${attrs} />`;
      });
  });

  // Inline styles: style="..." -> style={{...}}
  jsx = jsx.replace(/style="([^"]*)"/g, (match, styleStr) => {
    try {
        const styleObj = parseStyleString(styleStr);
        return `style={${JSON.stringify(styleObj)}}`;
    } catch (e) {
        return match; 
    }
  });

  // Handle Input Interactivity: Change value to defaultValue for inputs to allow editing
  // (Since we don't have controlled state logic in the export)
  jsx = jsx.replace(/\svalue="/g, ' defaultValue="');
  jsx = jsx.replace(/\schecked="/g, ' defaultChecked="');
  jsx = jsx.replace(/\schecked(?=\s|>)/g, ' defaultChecked');
  jsx = jsx.replace(/\sselected="/g, ' defaultSelected="');
  jsx = jsx.replace(/\sselected(?=\s|>)/g, ' defaultSelected');

  // Handle common event handlers
  // We rename them to data attributes so they don't break React compile, 
  // BUT we keep the logic in useEffect so if the original script used addEventListener it still works.
  jsx = jsx.replace(/\son([a-z]+)="([^"]*)"/g, ' data-on-$1="$2"');

  // Clean name
  const safeName = name.replace(/[^a-zA-Z0-9]/g, '');

  // 5. Construct Component
  return `import React, { useEffect } from 'react';

/**
 * ${safeName} Component
 * Generated from HTML artifact.
 */
export default function ${safeName}() {
  useEffect(() => {
    // Execute original script logic
    try {
      ${js}
    } catch (e) {
      console.warn("Error running component script:", e);
    }
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: \`${css}\` }} />
      <div className="generated-component">
        ${jsx}
      </div>
    </>
  );
}
`;
}
