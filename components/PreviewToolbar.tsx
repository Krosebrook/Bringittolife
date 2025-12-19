/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { 
    ArrowDownTrayIcon, 
    PlusIcon, 
    ViewColumnsIcon, 
    CodeBracketIcon, 
    XMarkIcon, 
    ClipboardDocumentIcon, 
    CheckIcon, 
    HandRaisedIcon, 
    PrinterIcon,
    ComputerDesktopIcon,
    DeviceTabletIcon,
    DevicePhoneMobileIcon,
    MagnifyingGlassMinusIcon,
    MagnifyingGlassPlusIcon,
    ArrowsPointingOutIcon,
    CommandLineIcon,
    ArrowPathIcon,
    ArrowDownOnSquareIcon
} from '@heroicons/react/24/outline';
import { Tooltip } from './ui/Tooltip';
import { Creation } from '../types';

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

interface PreviewToolbarProps {
    creation: Creation | null;
    isLoading: boolean;
    scale: number;
    isPanMode: boolean;
    deviceMode: DeviceMode;
    isLandscape: boolean;
    isDragMode: boolean;
    showSplitView: boolean;
    isCopied: boolean;
    onReset: () => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onResetView: () => void;
    onTogglePanMode: () => void;
    onChangeDeviceMode: (mode: DeviceMode) => void;
    onToggleOrientation: () => void;
    onToggleSplitView: () => void;
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
    isCopied,
    onReset,
    onZoomIn,
    onZoomOut,
    onResetView,
    onTogglePanMode,
    onChangeDeviceMode,
    onToggleOrientation,
    onToggleSplitView,
    onToggleDragMode,
    onExportPdf,
    onExportJson,
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
            {/* Left: Controls */}
            <div className="flex items-center space-x-3 w-32">
                <div className="flex space-x-2 group/controls">
                    <Tooltip content="Close Preview" side="bottom">
                        <button 
                            onClick={onReset}
                            aria-label="Close preview and return to home"
                            className="w-3 h-3 rounded-full bg-zinc-700 group-hover/controls:bg-red-500 hover:!bg-red-600 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#121214]"
                        >
                            <XMarkIcon className="w-2 h-2 text-black opacity-0 group-hover/controls:opacity-100" aria-hidden="true" />
                        </button>
                    </Tooltip>
                    <div className="w-3 h-3 rounded-full bg-zinc-700 group-hover/controls:bg-yellow-500 transition-colors" aria-hidden="true"></div>
                    <div className="w-3 h-3 rounded-full bg-zinc-700 group-hover/controls:bg-green-500 transition-colors" aria-hidden="true"></div>
                </div>
            </div>
            
            {/* Center: Title */}
            <div className="flex items-center space-x-2 text-zinc-500 max-w-[30%] overflow-hidden">
                <CodeBracketIcon className="w-3 h-3 shrink-0" aria-hidden="true" />
                <span className="text-[11px] font-mono uppercase tracking-wider truncate">
                    {isLoading ? 'System Processing...' : creation ? creation.name : 'Preview Mode'}
                </span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center justify-end space-x-1 w-auto min-w-[8rem]">
                {!isLoading && creation && (
                    <>
                        {/* Viewport Controls */}
                        <nav className="flex items-center bg-zinc-900/50 rounded-md p-0.5 mr-2 border border-zinc-800/50" aria-label="Zoom and pan">
                            <Tooltip content="Zoom Out" side="bottom">
                                <button onClick={onZoomOut} aria-label="Zoom out" className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded transition-all">
                                    <MagnifyingGlassMinusIcon className="w-4 h-4" />
                                </button>
                            </Tooltip>
                            
                            <Tooltip content="Reset View" side="bottom">
                                <button onClick={onResetView} aria-label="Reset zoom to 100%" className="px-2 py-1 min-w-[3rem] text-[10px] font-mono text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-all">
                                    {Math.round(scale * 100)}%
                                </button>
                            </Tooltip>

                            <Tooltip content="Zoom In" side="bottom">
                                <button onClick={onZoomIn} aria-label="Zoom in" className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded transition-all">
                                    <MagnifyingGlassPlusIcon className="w-4 h-4" />
                                </button>
                            </Tooltip>

                            <div className="w-px h-3 bg-zinc-800 mx-1" aria-hidden="true"></div>

                            <Tooltip content={isPanMode ? "Exit Pan Mode" : "Pan Tool (Hold Space)"} side="bottom">
                                <button 
                                    onClick={onTogglePanMode}
                                    aria-pressed={isPanMode}
                                    className={`p-1.5 rounded transition-all ${isPanMode ? 'bg-blue-900/30 text-blue-400 ring-1 ring-blue-500/50' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
                                >
                                    <ArrowsPointingOutIcon className="w-4 h-4" />
                                </button>
                            </Tooltip>
                        </nav>

                        {/* Device Simulation */}
                        <div className="hidden lg:flex items-center bg-zinc-900/50 rounded-md p-0.5 mr-3 border border-zinc-800/50" aria-label="Device simulation">
                            <Tooltip content="Desktop View" side="bottom">
                                <button
                                    onClick={() => onChangeDeviceMode('desktop')}
                                    aria-pressed={deviceMode === 'desktop'}
                                    className={`p-1.5 rounded transition-all ${deviceMode === 'desktop' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    <ComputerDesktopIcon className="w-4 h-4" />
                                </button>
                            </Tooltip>
                            <Tooltip content="Tablet View" side="bottom">
                                <button
                                    onClick={() => onChangeDeviceMode('tablet')}
                                    aria-pressed={deviceMode === 'tablet'}
                                    className={`p-1.5 rounded transition-all ${deviceMode === 'tablet' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    <DeviceTabletIcon className="w-4 h-4" />
                                </button>
                            </Tooltip>
                            <Tooltip content="Mobile View" side="bottom">
                                <button
                                    onClick={() => onChangeDeviceMode('mobile')}
                                    aria-pressed={deviceMode === 'mobile'}
                                    className={`p-1.5 rounded transition-all ${deviceMode === 'mobile' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    <DevicePhoneMobileIcon className="w-4 h-4" />
                                </button>
                            </Tooltip>

                            {deviceMode !== 'desktop' && (
                                <>
                                    <div className="w-px h-3 bg-zinc-700 mx-1" aria-hidden="true"></div>
                                    <Tooltip content="Rotate Device" side="bottom">
                                        <button
                                            onClick={onToggleOrientation}
                                            aria-label="Toggle device orientation"
                                            className={`p-1.5 rounded transition-all ${isLandscape ? 'bg-blue-900/30 text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                                        >
                                            <ArrowPathIcon className={`w-4 h-4 transition-transform ${isLandscape ? 'rotate-90' : ''}`} />
                                        </button>
                                    </Tooltip>
                                </>
                            )}
                        </div>

                        <div className="h-4 w-px bg-zinc-800 mx-2" aria-hidden="true"></div>

                        {/* Export Actions */}
                        <div className="flex items-center space-x-1" aria-label="Export options">
                            <Tooltip content="Export React Component" side="bottom">
                                <button onClick={onExportReact} aria-label="Export as React" className="text-zinc-500 hover:text-blue-400 transition-colors p-1.5 rounded-md hover:bg-zinc-800">
                                    <CommandLineIcon className="w-4 h-4" />
                                </button>
                            </Tooltip>

                            <Tooltip content="Export HTML File" side="bottom">
                                <button onClick={onExportHtml} aria-label="Download HTML" className="text-zinc-500 hover:text-blue-400 transition-colors p-1.5 rounded-md hover:bg-zinc-800">
                                    <ArrowDownOnSquareIcon className="w-4 h-4" />
                                </button>
                            </Tooltip>

                            <Tooltip content="Save as PDF" side="bottom">
                                <button onClick={onExportPdf} aria-label="Print to PDF" className="text-zinc-500 hover:text-zinc-300 transition-colors p-1.5 rounded-md hover:bg-zinc-800">
                                    <PrinterIcon className="w-4 h-4" />
                                </button>
                            </Tooltip>

                            <Tooltip content="Copy Code" side="bottom">
                                <button onClick={onCopyCode} aria-label="Copy code to clipboard" className="text-zinc-500 hover:text-zinc-300 transition-colors p-1.5 rounded-md hover:bg-zinc-800">
                                    {isCopied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
                                </button>
                            </Tooltip>
                        </div>

                        <Tooltip content="New Manifestation" side="bottom">
                            <button 
                                onClick={onReset}
                                className="ml-2 flex items-center space-x-1 text-xs font-bold bg-white text-black hover:bg-zinc-200 px-3 py-1.5 rounded-md transition-all active:scale-95"
                            >
                                <PlusIcon className="w-3 h-3" />
                                <span className="hidden sm:inline">New</span>
                            </button>
                        </Tooltip>
                    </>
                )}
            </div>
        </header>
    );
};
