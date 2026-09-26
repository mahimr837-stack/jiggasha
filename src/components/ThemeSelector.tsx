import React from 'react';
import { ColorMode } from '../types';

interface ThemeSelectorProps {
  currentMode: ColorMode;
  onSelectMode: (mode: ColorMode) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentMode,
  onSelectMode,
  className = '',
  size = 'md',
}) => {
  const modes: { id: ColorMode; bgClass: string; borderClass: string; title: string }[] = [
    {
      id: 'white',
      bgClass: 'bg-white',
      borderClass: 'border-neutral-300',
      title: 'White mode',
    },
    {
      id: 'terracotta',
      bgClass: 'bg-[#C85A32]',
      borderClass: 'border-[#A84520]',
      title: 'Terracotta mode',
    },
    {
      id: 'dark',
      bgClass: 'bg-neutral-900',
      borderClass: 'border-neutral-700',
      title: 'Dark mode',
    },
  ];

  const circleSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className={`flex items-center gap-2 ${className}`} role="radiogroup" aria-label="Theme mode selection">
      {modes.map((m) => {
        const isActive = currentMode === m.id;
        return (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            title={m.title}
            aria-label={m.title}
            onClick={() => onSelectMode(m.id)}
            className={`relative ${circleSize} rounded-full border ${m.borderClass} ${m.bgClass} cursor-pointer transition-all duration-150 p-0 flex items-center justify-center outline-none ${
              isActive
                ? 'ring-2 ring-offset-2 ring-[var(--theme-primary-green)] ring-offset-[var(--theme-bg-app)] scale-105'
                : 'opacity-80 hover:opacity-100 hover:scale-110'
            }`}
          />
        );
      })}
    </div>
  );
};
