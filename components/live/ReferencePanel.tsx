
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { PdfRenderer } from '../PdfRenderer';

export const ReferencePanel: React.FC<{ image: string }> = ({ image }) => (
  <div className="w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-zinc-800 bg-[#0c0c0e] relative flex flex-col shrink-0">
    <div className="w-full h-full p-6 flex items-center justify-center overflow-hidden">
      {image.startsWith('data:application/pdf') ? (
        <PdfRenderer dataUrl={image} />
      ) : (
        <img 
          src={image} 
          alt="Source Reference" 
          className="max-w-full max-h-full object-contain shadow-2xl rounded border border-zinc-800/50" 
        />
      )}
    </div>
  </div>
);
