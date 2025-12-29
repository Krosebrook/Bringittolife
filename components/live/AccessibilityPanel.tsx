
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon, 
  ExclamationCircleIcon,
  InformationCircleIcon,
  LightBulbIcon,
  SparklesIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import { AccessibilityIssue } from '../../types';

interface AccessibilityPanelProps {
  issues: AccessibilityIssue[];
  onSendMessage: (text: string) => void;
}

export const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({ issues, onSendMessage }) => {
  const criticalIssues = issues.filter(i => i.type === 'critical');
  const warningIssues = issues.filter(i => i.type === 'warning');

  const handleFixAll = () => {
    onSendMessage("Please fix the following accessibility issues: " + issues.map(i => i.message).join(", "));
  };

  const handleFixIssue = (issue: AccessibilityIssue) => {
    onSendMessage(`Fix this accessibility issue: ${issue.message}. Suggestion: ${issue.suggestion}`);
  };

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-left duration-500 overflow-hidden">
      <header className="px-5 py-4 border-b border-zinc-800 bg-[#121214] flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
             <ShieldCheckIcon className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Semantic Audit</span>
            <span className="text-xs font-bold text-white tracking-tight">WCAG Compliance Engine</span>
          </div>
        </div>
        {issues.length > 0 && (
          <button 
            onClick={handleFixAll}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black transition-all active:scale-95 shadow-lg"
          >
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>HEAL ALL</span>
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#0c0c0e]">
        {issues.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-40">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6 ring-1 ring-green-500/20">
               <ShieldCheckIcon className="w-10 h-10 text-green-500" />
            </div>
            <h4 className="text-white text-sm font-black uppercase tracking-widest mb-2">Zero Violations</h4>
            <p className="text-zinc-500 text-[10px] font-mono leading-relaxed uppercase tracking-tighter">
              Semantic structure satisfies high-fidelity accessibility standards.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-red-500/5 border border-red-500/10 p-3 rounded-2xl flex flex-col items-center justify-center">
                <span className="text-red-500 text-2xl font-black">{criticalIssues.length}</span>
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Critical</span>
              </div>
              <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-2xl flex flex-col items-center justify-center">
                <span className="text-amber-500 text-2xl font-black">{warningIssues.length}</span>
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Warnings</span>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] flex items-center gap-2">
                 <WrenchScrewdriverIcon className="w-3.5 h-3.5" />
                 Active Violations
              </h5>
              
              {issues.map((issue) => (
                <article 
                  key={issue.id} 
                  className={`group relative p-5 bg-[#09090b] border rounded-2xl transition-all hover:bg-zinc-900/30 ${
                    issue.type === 'critical' ? 'border-red-500/10 hover:border-red-500/30' : 'border-amber-500/10 hover:border-amber-500/30'
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="mt-1">
                      {issue.type === 'critical' ? 
                        <ExclamationCircleIcon className="w-5 h-5 text-red-500" /> : 
                        <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
                      }
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[9px] font-black uppercase tracking-widest ${
                          issue.type === 'critical' ? 'text-red-500' : 'text-amber-500'
                        }`}>
                          {issue.type === 'critical' ? 'Critical Failure' : 'Compliance Warning'}
                        </span>
                        <code className="text-[9px] bg-zinc-900 px-2 py-0.5 rounded text-zinc-500 border border-zinc-800">
                          {issue.element}
                        </code>
                      </div>
                      <p className="text-zinc-200 text-xs font-bold leading-relaxed">{issue.message}</p>
                    </div>
                  </div>

                  <div className="bg-zinc-950/80 rounded-xl p-4 border border-zinc-800/50 mb-4">
                    <div className="flex items-center gap-2 mb-2 text-zinc-400">
                      <LightBulbIcon className="w-3.5 h-3.5 text-amber-400/60" />
                      <span className="text-[10px] font-black uppercase tracking-wider">Remediation Suggestion</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 italic leading-relaxed pl-5 border-l border-zinc-800">
                      {issue.suggestion}
                    </p>
                  </div>

                  <button 
                    onClick={() => handleFixIssue(issue)}
                    className="w-full py-2.5 bg-zinc-900 hover:bg-blue-600 text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-zinc-800 hover:border-blue-500 shadow-sm active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <SparklesIcon className="w-3.5 h-3.5" />
                    Synthesize Correction
                  </button>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      <footer className="px-6 py-4 border-t border-zinc-800 bg-[#0c0c0e] flex items-center gap-3 shrink-0">
        <InformationCircleIcon className="w-4 h-4 text-zinc-600 shrink-0" />
        <p className="text-[9px] text-zinc-600 font-medium leading-tight">
          Manifest AI prioritizes semantic structure. Use the "HEAL" triggers to automatically inject correct ARIA attributes and labels.
        </p>
      </footer>
    </div>
  );
};
