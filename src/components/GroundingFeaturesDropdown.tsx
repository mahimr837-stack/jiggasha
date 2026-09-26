import React, { useState } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { GroundingFeatureInfo } from '../types';

interface GroundingFeaturesDropdownProps {
  groundingInfo?: GroundingFeatureInfo;
}

export const GroundingFeaturesDropdown: React.FC<GroundingFeaturesDropdownProps> = ({ groundingInfo }) => {
  const [isOpen, setIsOpen] = useState(false);

  const searchUsed = groundingInfo?.googleSearchUsed ?? true;
  const mapsUsed = groundingInfo?.googleMapsUsed ?? false;
  const sources = groundingInfo?.sources || [];

  const usedItems: string[] = [];
  if (searchUsed) usedItems.push('Google Search data');
  if (mapsUsed) usedItems.push('Google Maps data');

  return (
    <div className="pt-2 border-t border-[var(--theme-border)] text-xs">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors cursor-pointer py-1 text-xs font-mono"
      >
        <span>Features used ({usedItems.length})</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="mt-2 pl-1 space-y-2 text-xs text-[var(--theme-text-secondary)] font-mono animate-in fade-in duration-100">
          <ul className="space-y-1 list-disc list-inside">
            {usedItems.map((item, idx) => (
              <li key={idx} className="text-[var(--theme-text-primary)]">
                {item}
              </li>
            ))}
          </ul>

          {sources.length > 0 && (
            <div className="pt-1.5 space-y-1">
              <div className="text-[11px] text-[var(--theme-text-secondary)]">Sources:</div>
              <div className="space-y-1 pl-1">
                {sources.map((s, idx) => (
                  <a
                    key={idx}
                    href={s.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary-green)] truncate transition-colors max-w-md"
                  >
                    <span className="truncate">{s.title}</span>
                    {s.url && <ExternalLink className="w-3 h-3 flex-shrink-0" />}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
