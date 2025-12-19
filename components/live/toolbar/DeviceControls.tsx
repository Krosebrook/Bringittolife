
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { 
  ComputerDesktopIcon, 
  DeviceTabletIcon, 
  DevicePhoneMobileIcon, 
  ArrowPathIcon 
} from '@heroicons/react/24/outline';
import { Tooltip } from '../../ui/Tooltip';
import { DeviceMode } from '../../../types';

interface DeviceControlsProps {
  deviceMode: DeviceMode;
  isLandscape: boolean;
  onChangeDeviceMode: (mode: DeviceMode) => void;
  onToggleOrientation: () => void;
}

export const DeviceControls: React.FC<DeviceControlsProps> = ({
  deviceMode,
  isLandscape,
  onChangeDeviceMode,
  onToggleOrientation
}) => (
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
);
