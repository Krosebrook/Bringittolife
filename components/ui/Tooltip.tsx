/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  className?: string;
  side?: 'top' | 'bottom';
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  className = "", 
  side = 'top' 
}) => {
  return (
    <div className={`group/tooltip relative flex items-center justify-center ${className}`}>
      {children}
      <div 
        className={`
          absolute left-1/2 -translate-x-1/2 px-2.5 py-1.5 
          bg-zinc-900 text-zinc-300 text-[10px] font-medium 
          rounded-md border border-zinc-800 shadow-xl 
          opacity-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-50
          ${side === 'top' 
            ? 'bottom-full mb-2.5 translate-y-1 group-hover/tooltip:translate-y-0' 
            : 'top-full mt-2.5 -translate-y-1 group-hover/tooltip:translate-y-0'
          }
          group-hover/tooltip:opacity-100
        `}
      >
        {content}
        <div 
          className={`
            absolute left-1/2 -translate-x-1/2 w-2 h-2 
            bg-zinc-900 border-zinc-800 rotate-45
            ${side === 'top' 
              ? '-bottom-1 border-b border-r' 
              : '-top-1 border-t border-l'
            }
          `}
        ></div>
      </div>
    </div>
  );
};
