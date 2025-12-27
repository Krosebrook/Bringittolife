
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { CodeBracketIcon, SwatchIcon, PhotoIcon, ChatBubbleLeftRightIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { Creation, DeviceMode } from '../types';
import { WindowControls } from './live/toolbar/WindowControls';
import { ViewportControls } from './live/toolbar/ViewportControls';
import { DeviceControls } from './live/toolbar/DeviceControls';
import { ActionControls } from './live/toolbar/ActionControls';
import { Tooltip } from './ui/Tooltip';
import { SidePanelType } from './LivePreview';

interface PreviewToolbarProps {
    creation: Creation | null;
    isLoading: boolean;
    scale: number;
    isPanMode: boolean;
    deviceMode: DeviceMode;
    isLandscape: boolean;
    isDragMode: boolean;
    showSplitView: boolean;
    activeSidePanel?: SidePanelType;
    isCopied: boolean;
    onReset: () => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onResetView: () => void;
    onTogglePanMode: () => void;
    onChangeDeviceMode: (mode: DeviceMode) => void;
    onToggleOrientation: () => void;
    onToggleSplitView: () => void;
    onToggleSidePanel?: (type: SidePanelType) => void;
    onToggleDragMode: () => void;
    onExportPdf: () => void;
    onExportJson: () => void;
    onExportReact: () => void;
    onExportHtml: () => void;
    onCopyCode: () => void;
}

export const PreviewToolbar: React.FC<PreviewToolbarProps> = ({
    creation,
    isLoading,
    scale,
    isPanMode,
    deviceMode,
    isLandscape,
    isDragMode,
    showSplitView,
    activeSidePanel,
    isCopied,
    onReset,
    onZoomIn,
    onZoomOut,
    onResetView,
    onTogglePanMode,
    onChangeDeviceMode,
    onToggleOrientation,
    onToggleSidePanel,
    onToggleDragMode,
    onExportPdf,
    onExportReact,
    onExportHtml,
    onCopyCode
}) => {
    return (
        <nav 
          aria-label="Editor navigation"
          className="bg-[#121214] px-4 py-3 flex items-center justify-between border-b border-zinc-800 shrink-0 z-50 relative h-16 shadow-lg"
        >
            <WindowControls onClose={onReset} projectName={creation?.name} />
            
            <div className="hidden lg:flex items-center space-x-2 bg-zinc-950/40 px-3 py-1.5 rounded-full border border-zinc-900/50">
                <div className="w-2 h-2 rounded-full bg-green-500/50 animate-pulse" />
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                    {isLoading ? 'Processing...' : 'Live Manifestation'}
                </span>
            </div>

            <div className="flex items-center space-x-2">
                {!isLoading && creation && (
                    <>
                        <div className="flex items-center bg-zinc-900/50 rounded-lg p-0.5 border border-zinc-800/50" role="group" aria-label="Editor panels">
                            <Tooltip content="Refinement Lab (AI Chat)" side="bottom">
                                <button 
                                    onClick={() => onToggleSidePanel?.('chat')}
                                    aria-label="Toggle Chat Panel"
                                    aria-pressed={showSplitView && activeSidePanel === 'chat'}
                                    className={`p-2 rounded-md transition-all ${showSplitView && activeSidePanel === 'chat' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
                                >
                                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                </button>
                            </Tooltip>
                            {creation.originalImage && (
                                <Tooltip content="Reference Blueprint" side="bottom">
                                    <button 
                                        onClick={() => onToggleSidePanel?.('reference')}
                                        aria-label="Toggle Reference View"
                                        aria-pressed={showSplitView && activeSidePanel === 'reference'}
                                        className={`p-2 rounded-md transition-all ${showSplitView && activeSidePanel === 'reference' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
                                    >
                                        <PhotoIcon className="w-4 h-4" />
                                    </button>
                                </Tooltip>
                            )}
                            <Tooltip content="Style Lab (CSS)" side="bottom">
                                <button 
                                    onClick={() => onToggleSidePanel?.('css')}
                                    aria-label="Toggle CSS Editor"
                                    aria-pressed={showSplitView && activeSidePanel === 'css'}
                                    className={`p-2 rounded-md transition-all ${showSplitView && activeSidePanel === 'css' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
                                >
                                    <SwatchIcon className="w-4 h-4" />
                                </button>
                            </Tooltip>
                        </div>

                        <div className="w-px h-4 bg-zinc-800 mx-1" />

                        <ViewportControls 
                            scale={scale}
                            isPanMode={isPanMode}
                            isDragMode={isDragMode}
                            onZoomIn={onZoomIn}
                            onZoomOut={onZoomOut}
                            onResetView={onResetView}
                            onTogglePanMode={onTogglePanMode}
                            onToggleDragMode={onToggleDragMode}
                        />

                        <DeviceControls 
                            deviceMode={deviceMode}
                            isLandscape={isLandscape}
                            onChangeDeviceMode={onChangeDeviceMode}
                            onToggleOrientation={onToggleOrientation}
                        />

                        <ActionControls 
                            isCopied={isCopied}
                            onExportReact={onExportReact}
                            onExportHtml={onExportHtml}
                            onExportPdf={onExportPdf}
                            onCopyCode={onCopyCode}
                            onNewManifestation={onReset}
                        />
                    </>
                )}
            </div>
        </nav>
    );
};
