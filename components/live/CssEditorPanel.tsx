
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  AdjustmentsHorizontalIcon, 
  CodeBracketIcon, 
  ExclamationTriangleIcon, 
  ExclamationCircleIcon, 
  CheckCircleIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import { ThemeState } from '../../types';

interface CssIssue {
  line: number;
  message: string;
  type: 'error' | 'warning';
  code?: string;
}

interface CssEditorPanelProps {
  css: string;
  theme?: ThemeState;
  onChange: (newCss: string) => void;
  onThemeChange: (theme: ThemeState) => void;
}

/**
 * PRODUCTION-GRADE CSS SYNTAX HIGHLIGHTER
 */
const highlightCSS = (code: string) => {
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-zinc-500 italic">$1</span>') // Comments
    .replace(/([^{]+)\s*(?={)/g, '<span class="text-blue-400 font-bold">$1</span>') // Selectors
    .replace(/([a-zA-Z\-]+)\s*:/g, '<span class="text-purple-400">$1</span>:') // Properties
    .replace(/:\s*([^;\}]+)/g, ': <span class="text-amber-200">$1</span>') // Values
    .replace(/[{}]/g, '<span class="text-zinc-500 font-bold">$0</span>'); // Braces
};

/**
 * MANIFEST CSS LINTER ENGINE
 * Static analysis engine providing real-time feedback on best practices.
 */
const performCssAudit = (css: string): CssIssue[] => {
  const issues: CssIssue[] = [];
  const lines = css.split('\n');

  // Track state for multi-line block analysis
  let inBlock = false;
  let currentBlockProperties = new Set<string>();
  let currentSelector = "";

  // 1. Global Braces Balance (Integrity Check)
  const openBraces = (css.match(/{/g) || []).length;
  const closeBraces = (css.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    issues.push({ 
      line: lines.length, 
      message: `Syntax Error: Mismatched braces (${openBraces} open / ${closeBraces} closed).`, 
      type: 'error',
      code: 'braces-balance'
    });
  }

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    const lineNum = index + 1;

    // Detect block boundaries
    if (trimmedLine.includes('{')) {
      inBlock = true;
      currentBlockProperties.clear();
      currentSelector = trimmedLine.split('{')[0].trim();
    }
    
    // Check for duplicate properties in the same block
    if (inBlock && trimmedLine.includes(':')) {
      const prop = trimmedLine.split(':')[0].trim();
      if (currentBlockProperties.has(prop)) {
        issues.push({ 
          line: lineNum, 
          message: `Duplicate property "${prop}" in selector "${currentSelector}".`, 
          type: 'warning',
          code: 'no-duplicate-properties'
        });
      }
      currentBlockProperties.add(prop);
    }

    if (trimmedLine.includes('}')) {
      inBlock = false;
    }

    // Best Practice: Empty Rules
    if (trimmedLine.includes('{}') || (trimmedLine.endsWith('{') && lines[index+1]?.trim() === '}')) {
      issues.push({ line: lineNum, message: "Empty rule block should be removed.", type: 'warning', code: 'block-no-empty' });
    }

    // Best Practice: Redundant Units
    if (/\b0(px|rem|em|vh|vw|%)\b/.test(trimmedLine)) {
      issues.push({ line: lineNum, message: "Redundant units on zero values. Use 0 instead.", type: 'warning', code: 'length-zero-no-unit' });
    }

    // Error: Invalid unit suffix
    const invalidUnit = trimmedLine.match(/(\d+)(pxx|remm|emm|vhh|vww|%%)\b/);
    if (invalidUnit) {
      issues.push({ line: lineNum, message: `Invalid unit suffix: "${invalidUnit[2]}".`, type: 'error', code: 'unit-no-unknown' });
    }

    // Error: Invalid hex colors
    const hexMatch = trimmedLine.match(/#([a-fA-F0-9]+)\b/);
    if (hexMatch) {
      const hex = hexMatch[1];
      if (![3, 4, 6, 8].includes(hex.length)) {
        issues.push({ line: lineNum, message: `Invalid hex color length: #${hex}`, type: 'error', code: 'color-no-invalid-hex' });
      }
    }

    // Style: !important usage
    if (trimmedLine.includes('!important')) {
      issues.push({ 
        line: lineNum, 
        message: "Avoid using !important. It breaks the cascade and makes maintenance difficult.", 
        type: 'warning',
        code: 'declaration-no-important'
      });
    }

    // Best Practice: Redundant Shorthand
    const redundantShorthand = trimmedLine.match(/:\s*([^;]+)\s+\1\s+\1\s+\1;/);
    if (redundantShorthand) {
      issues.push({ 
        line: lineNum, 
        message: "Redundant shorthand. Use a single value instead of four identical ones.", 
        type: 'warning',
        code: 'shorthand-property-no-redundant-values'
      });
    }

    // Best Practice: ID Selectors
    if (trimmedLine.startsWith('#') && trimmedLine.includes('{')) {
      issues.push({ 
        line: lineNum, 
        message: "Prefer classes over ID selectors to maintain low specificity.", 
        type: 'warning',
        code: 'selector-max-id'
      });
    }
  });

  return issues;
};

export const CssEditorPanel: React.FC<CssEditorPanelProps> = ({ css, theme: propTheme, onChange, onThemeChange }) => {
  const [mode, setMode] = useState<'code' | 'visual'>('code');
  const [showIssues, setShowIssues] = useState(false);
  const [issues, setIssues] = useState<CssIssue[]>([]);
  
  const localTheme = propTheme || { h: 217, s: 91, l: 60 };
  
  const preRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Real-time linting with debounced analysis
  useEffect(() => {
    const timer = setTimeout(() => {
      setIssues(performCssAudit(css));
    }, 400);
    return () => clearTimeout(timer);
  }, [css]);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollLeft } = e.currentTarget;
    if (preRef.current) {
      preRef.current.scrollTop = scrollTop;
      preRef.current.scrollLeft = scrollLeft;
    }
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = scrollTop;
    }
  };

  const lineNumbers = useMemo(() => {
    const count = css.split('\n').length;
    return Array.from({ length: Math.max(count, 1) }, (_, i) => i + 1).join('\n');
  }, [css]);

  const highlightedHtml = useMemo(() => highlightCSS(css), [css]);

  const errorCount = issues.filter(i => i.type === 'error').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;

  return (
    <div className="w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-zinc-800 bg-[#0c0c0e] flex flex-col shrink-0 animate-in slide-in-from-left duration-500">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-[#121214]">
        <div className="flex items-center space-x-1 p-1 bg-zinc-950/50 rounded-lg border border-zinc-800">
          <button 
            onClick={() => setMode('code')}
            className={`flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-md transition-all ${mode === 'code' ? 'text-white bg-zinc-800 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <CodeBracketIcon className="w-3.5 h-3.5" />
            <span>Style Lab</span>
          </button>
          <button 
            onClick={() => setMode('visual')}
            className={`flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-md transition-all ${mode === 'visual' ? 'text-white bg-zinc-800 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <AdjustmentsHorizontalIcon className="w-3.5 h-3.5" />
            <span>Theme Lab</span>
          </button>
        </div>
        
        {mode === 'code' && (
          <button 
            onClick={() => setShowIssues(!showIssues)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
              errorCount > 0 ? 'bg-red-500/10 border-red-500/50 text-red-400' : 
              warningCount > 0 ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' : 
              'bg-green-500/10 border-green-500/50 text-green-400'
            }`}
          >
            {errorCount > 0 ? <ExclamationCircleIcon className="w-3.5 h-3.5" /> : 
             warningCount > 0 ? <ExclamationTriangleIcon className="w-3.5 h-3.5" /> : 
             <CheckCircleIcon className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{errorCount + warningCount} Design Issues</span>
            <span className="sm:hidden">{errorCount + warningCount}</span>
          </button>
        )}
      </div>

      <div className="flex-1 relative overflow-hidden bg-[#0c0c0e] font-mono text-sm">
        {mode === 'code' ? (
          <div className="flex flex-col h-full">
            <div className="flex flex-1 overflow-hidden relative">
              <div 
                ref={lineNumbersRef}
                className="w-12 bg-[#0c0c0e] text-zinc-800 text-right pr-3 py-6 select-none border-r border-zinc-900/50 overflow-hidden leading-6"
                aria-hidden="true"
              >
                <pre className="m-0 font-mono">{lineNumbers}</pre>
              </div>

              <div className="flex-1 relative overflow-hidden">
                <pre
                  ref={preRef}
                  className="absolute inset-0 m-0 p-6 pointer-events-none whitespace-pre overflow-hidden leading-6 text-zinc-300 z-0 font-mono"
                  dangerouslySetInnerHTML={{ __html: highlightedHtml + '\n' }}
                />
                <textarea
                  value={css}
                  onChange={(e) => onChange(e.target.value)}
                  onScroll={handleScroll}
                  className="absolute inset-0 w-full h-full p-6 bg-transparent text-transparent caret-blue-500 resize-none focus:outline-none z-10 whitespace-pre overflow-auto leading-6 font-mono"
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                />
              </div>
            </div>

            {/* INTEGRATED LINTER DRAWER */}
            {showIssues && (
              <div className="h-48 border-t border-zinc-800 bg-[#09090b] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 shadow-2xl">
                <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/50 border-b border-zinc-800/80">
                  <div className="flex items-center space-x-2">
                    <WrenchScrewdriverIcon className="w-3 h-3 text-zinc-500" />
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Manifest Design Analysis</span>
                  </div>
                  <button onClick={() => setShowIssues(false)} className="text-zinc-500 hover:text-white transition-colors p-1">
                    <span className="sr-only">Close analysis</span>
                    &times;
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-[#0c0c0e]">
                  {issues.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-700">
                      <CheckCircleIcon className="w-10 h-10 mb-2 opacity-10" />
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em]">Perfect Design Synthesis</p>
                    </div>
                  ) : (
                    issues.map((issue, idx) => (
                      <div key={idx} className={`flex items-start gap-4 p-3 rounded-xl transition-all border ${
                        issue.type === 'error' ? 'bg-red-500/5 border-red-500/20' : 'bg-amber-500/5 border-amber-500/20'
                      }`}>
                        <div className="mt-0.5">
                          {issue.type === 'error' ? 
                            <ExclamationCircleIcon className="w-4 h-4 text-red-500" /> : 
                            <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-zinc-200 text-xs leading-relaxed">{issue.message}</p>
                          <div className="flex items-center space-x-3 mt-1.5">
                             <span className="text-[9px] font-bold font-mono text-zinc-600 uppercase">Line {issue.line}</span>
                             {issue.code && <span className="text-[9px] font-mono px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-500">{issue.code}</span>}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-2 overflow-y-auto h-full custom-scrollbar">
            <div className="space-y-8">
              <div className="space-y-2">
                <h4 className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Brand DNA Control</h4>
                <p className="text-zinc-600 text-[11px] leading-relaxed">Adjust the core brand hue to automatically update the manifest design tokens.</p>
              </div>

              <div className="space-y-8">
                {[
                  { label: 'Primary Hue', key: 'h', max: 360, color: 'accent-blue-500', unit: '°' },
                  { label: 'Saturation', key: 's', max: 100, color: 'accent-blue-500', unit: '%' },
                  { label: 'Luminosity', key: 'l', max: 100, color: 'accent-blue-500', unit: '%' },
                ].map((slider) => (
                  <div key={slider.key} className="space-y-4">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                      <span>{slider.label}</span>
                      <span className="text-blue-500">{(localTheme as any)[slider.key]}{slider.unit}</span>
                    </div>
                    <div className="relative group flex items-center">
                       <input 
                        type="range" min="0" max={slider.max} value={(localTheme as any)[slider.key]} 
                        onChange={(e) => onThemeChange({...localTheme, [slider.key]: parseInt(e.target.value)})}
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        aria-label={slider.label}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <div 
                className="w-full h-40 rounded-[2.5rem] shadow-2xl border border-white/5 flex flex-col items-center justify-center text-white space-y-2 transition-all duration-700"
                style={{ backgroundColor: `hsl(${localTheme.h}, ${localTheme.s}%, ${localTheme.l}%)` }}
              >
                <div className="text-[10px] font-mono opacity-40 uppercase tracking-[0.3em] font-black">Design Swatch</div>
                <div className="text-xl font-bold font-mono tracking-tighter">
                  HSL({localTheme.h}, {localTheme.s}, {localTheme.l})
                </div>
                <div className="w-12 h-0.5 bg-white/20 rounded-full"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
