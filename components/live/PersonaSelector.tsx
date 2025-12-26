
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { DesignPersona } from '../../types';
import { 
  CubeIcon, 
  PaintBrushIcon, 
  IdentificationIcon, 
  BeakerIcon,
  BriefcaseIcon 
} from '@heroicons/react/24/outline';
import { Tooltip } from '../ui/Tooltip';

interface PersonaSelectorProps {
  active: DesignPersona;
  onChange: (persona: DesignPersona) => void;
}

const PERSONAS: { id: DesignPersona, label: string, icon: any, color: string }[] = [
  { id: 'modernist', label: 'Modernist', icon: CubeIcon, color: 'text-blue-400' },
  { id: 'brutalist', label: 'Brutalist', icon: BeakerIcon, color: 'text-red-400' },
  { id: 'accessible', label: 'Accessible', icon: IdentificationIcon, color: 'text-green-400' },
  { id: 'playful', label: 'Playful', icon: PaintBrushIcon, color: 'text-amber-400' },
  { id: 'enterprise', label: 'Enterprise', icon: BriefcaseIcon, color: 'text-zinc-400' },
];

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({ active, onChange }) => {
  return (
    <div className="flex items-center space-x-1 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800">
      {PERSONAS.map((p) => (
        <Tooltip key={p.id} content={p.label} side="bottom">
          <button
            onClick={() => onChange(p.id)}
            className={`p-1.5 rounded-md transition-all ${active === p.id ? 'bg-zinc-800 shadow-sm ring-1 ring-zinc-700' : 'opacity-40 hover:opacity-100 hover:bg-zinc-800'}`}
          >
            <p.icon className={`w-3.5 h-3.5 ${active === p.id ? p.color : 'text-zinc-400'}`} />
          </button>
        </Tooltip>
      ))}
    </div>
  );
};
