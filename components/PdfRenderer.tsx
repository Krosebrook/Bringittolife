/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useRef, useState } from 'react';
import { DocumentIcon } from '@heroicons/react/24/outline';

declare global {
  interface Window { pdfjsLib: any; }
}

interface PdfRendererProps {
  dataUrl: string;
}

export const PdfRenderer: React.FC<PdfRendererProps> = ({ dataUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const renderTaskRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    const renderPdf = async () => {
      if (!window.pdfjsLib) {
        if (isMounted) { setError("PDF Engine Offline"); setLoading(false); }
        return;
      }

      try {
        if (isMounted) setLoading(true);
        const loadingTask = window.pdfjsLib.getDocument(dataUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        
        if (!isMounted) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) throw new Error("Canvas context fault");
        
        const viewport = page.getViewport({ scale: 2.0 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = { canvasContext: context, viewport: viewport };
        
        // Store task for cleanup
        renderTaskRef.current = page.render(renderContext);
        await renderTaskRef.current.promise;
        
        if (isMounted) setLoading(false);
      } catch (err) {
        if (isMounted) {
          setError("Preview rendering faulted.");
          setLoading(false);
        }
      }
    };

    renderPdf();

    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [dataUrl]);

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-zinc-500 p-6 text-center animate-in fade-in">
            <DocumentIcon className="w-12 h-12 mb-3 opacity-50 text-red-400" />
            <p className="text-sm text-red-400/80">{error}</p>
        </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
        {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        )}
        <canvas 
            ref={canvasRef} 
            className={`max-w-full max-h-full object-contain shadow-2xl border border-zinc-800/50 rounded transition-opacity duration-700 ${loading ? 'opacity-0' : 'opacity-100'}`}
        />
    </div>
  );
};
