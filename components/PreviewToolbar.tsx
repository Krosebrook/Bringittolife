
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { CodeBracketIcon, SwatchIcon, PhotoIcon } from '@heroicons/react/24/outline';
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
        <header 
            className="bg-[#121214] px-4 py-3 flex items-center justify-between border-b border-zinc-800 shrink-0 z-50 relative"
            role="toolbar"
            aria-label="Preview tools"
        >
            <WindowControls onClose={onReset} />
            
            <div className="flex items-center space-x-2 text-zinc-500 max-w-[30%] overflow-hidden">
                <CodeBracketIcon className="w-3 h-3 shrink-0" aria-hidden="true" />
                <span className="text-[11px] font-mono uppercase tracking-wider truncate">
                    {isLoading ? 'System Processing...' : creation ? creation.name : 'Preview Mode'}
                </span>
            </div>

            <div className="flex items-center space-x-1">
                {!isLoading && creation && (
                    <>
                        <div className="flex items-center bg-zinc-900/50 rounded-md p-0.5 mr-2 border border-zinc-800/50">
                            {creation.originalImage && (
                                <Tooltip content="Reference View" side="bottom">
                                    <button 
                                        onClick={() => onToggleSidePanel?.('reference')}
                                        className={`p-1.5 rounded transition-all ${showSplitView && activeSidePanel === 'reference' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >
                                        <PhotoIcon className="w-4 h-4" />
                                    </button>
                                </Tooltip>
                            )}
                            <Tooltip content="CSS Morphing" side="bottom">
                                <button 
                                    onClick={() => onToggleSidePanel?.('css')}
                                    className={`p-1.5 rounded transition-all ${showSplitView && activeSidePanel === 'css' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    <SwatchIcon className="w-4 h-4" />
                                </button>
                            </Tooltip>
                        </div>

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

                        <div className="h-4 w-px bg-zinc-800 mx-2" aria-hidden="true"></div>

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
        </header>
    );
};
