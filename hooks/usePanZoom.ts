/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useRef, MouseEvent } from 'react';

interface Position {
  x: number;
  y: number;
}

export const usePanZoom = (initialScale = 1) => {
  const [scale, setScale] = useState(initialScale);
  const [pan, setPan] = useState<Position>({ x: 0, y: 0 });
  const [isPanMode, setIsPanMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const panStartRef = useRef<Position>({ x: 0, y: 0 });
  const dragStartRef = useRef<Position>({ x: 0, y: 0 });

  const zoomIn = () => setScale(s => Math.min(s + 0.25, 4));
  const zoomOut = () => setScale(s => Math.max(s - 0.25, 0.25));
  
  const resetView = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (isPanMode || e.button === 1) { // Left click in Pan Mode OR Middle click
      e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      panStartRef.current = { ...pan };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPan({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  return {
    scale,
    pan,
    isPanMode,
    isDragging,
    setIsPanMode,
    zoomIn,
    zoomOut,
    resetView,
    panHandlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave
    }
  };
};
