import React from 'react';
import { UserAccount, ColorMode } from '../types';
import { LogOut } from 'lucide-react';
import { ThemeSelector } from './ThemeSelector';

interface TopConfigBarProps {
  isMobileSidebarOpen: boolean;
  onToggleMobileSidebar: () => void;
  currentUser?: UserAccount | null;
  colorMode?: ColorMode;
  onSelectMode?: (mode: ColorMode) => void;
  onOpenProfile?: () => void;
  onSignOut?: () => void;
}

export const TopConfigBar: React.FC<TopConfigBarProps> = ({
  isMobileSidebarOpen,
  onToggleMobileSidebar,
  currentUser,
  colorMode,
  onSelectMode,
  onOpenProfile,
  onSignOut,
}) => {
  return (
    <header className="h-11 border-b border-[var(--theme-border)] bg-[var(--theme-bg-surface)] px-3 sm:px-5 flex items-center justify-between text-xs select-none transition-colors duration-200">
      {/* Left: Mobile controls & Workspace Brand */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          aria-label={isMobileSidebarOpen ? "Close history sidebar" : "Open history sidebar"}
          className="md:hidden px-2.5 py-1 text-[var(--theme-text-primary)] hover:border-[var(--theme-primary-green)] border border-[var(--theme-border)] bg-[var(--theme-bg-subtle)] rounded text-xs transition-colors cursor-pointer"
        >
          History
        </button>
      </div>

      {/* Right: User status & Theme selector */}
      <div className="flex items-center gap-2">
        {currentUser && (
          <div className="flex items-center gap-1.5 pr-1 border-r border-[var(--theme-border)] text-[var(--theme-text-secondary)] text-[11px]">
            {onOpenProfile ? (
              <button
                type="button"
                onClick={onOpenProfile}
                title="View Profile Settings"
                className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-[var(--theme-bg-subtle)] text-[var(--theme-text-primary)] hover:text-[var(--theme-primary-green)] transition-colors cursor-pointer"
              >
                <div className="w-4 h-4 rounded-full overflow-hidden bg-[var(--theme-green-tint)] border border-[var(--theme-green-tint-border)] flex items-center justify-center text-[9px] font-semibold text-[var(--theme-primary-green)] uppercase flex-shrink-0">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (currentUser.name || currentUser.email || 'S').charAt(0)
                  )}
                </div>
                <span className="hidden sm:inline truncate max-w-[120px] font-mono">
                  {currentUser.name || currentUser.email}
                </span>
              </button>
            ) : (
              <span className="hidden sm:inline truncate max-w-[120px] font-mono text-[var(--theme-text-primary)]" title={currentUser.email}>
                {currentUser.email}
              </span>
            )}
            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                title="Sign out"
                className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] p-1 rounded hover:bg-[var(--theme-bg-subtle)] cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {colorMode && onSelectMode && (
          <ThemeSelector currentMode={colorMode} onSelectMode={onSelectMode} size="sm" />
        )}
      </div>
    </header>
  );
};

