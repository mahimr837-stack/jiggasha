import React, { useState, useRef, useEffect } from 'react';
import { WorkspaceSession, UserAccount, ColorMode } from '../types';
import { Plus, X, Trash2, Search, Pencil, Check } from 'lucide-react';
import { QuestionUsageTracker } from './QuestionUsageTracker';

interface SidebarProps {
  sessions: WorkspaceSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onRenameSession?: (id: string, newTitle: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  currentUser?: UserAccount | null;
  colorMode?: ColorMode;
  onSelectMode?: (mode: ColorMode) => void;
  questionsUsedToday?: number;
  onOpenProfile?: () => void;
  onNavigateToQuestion?: (questionNumber: number, dateStr?: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  isMobileOpen,
  onCloseMobile,
  currentUser,
  questionsUsedToday = 0,
  onOpenProfile,
  onNavigateToQuestion,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingSessionId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingSessionId]);

  const handleStartRename = (session: WorkspaceSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  };

  const handleSaveRename = (sessionId: string, e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const trimmed = editingTitle.trim();
    if (trimmed && onRenameSession) {
      onRenameSession(sessionId, trimmed);
    }
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const handleCancelRename = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingSessionId(null);
    setEditingTitle('');
  };

  // Filter sessions based on search query (matching title or user queries in turns)
  const filteredSessions = sessions.filter((session) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    const matchesTitle = session.title.toLowerCase().includes(query);
    const matchesSubject = session.subject?.toLowerCase().includes(query);
    const matchesTurns = session.turns.some((t) =>
      t.userQuery.toLowerCase().includes(query)
    );
    return matchesTitle || matchesSubject || matchesTurns;
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-neutral-900/20 z-40 md:hidden"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-60 bg-[var(--theme-bg-app)] border-r border-[var(--theme-border)] flex flex-col justify-between transition-colors duration-200 md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Controls: New conversation & Search */}
        <div className="p-3 border-b border-[var(--theme-border)] space-y-2">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                onNewSession();
                onCloseMobile();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 h-8 bg-[var(--theme-primary-green)] hover:bg-[var(--theme-primary-green-hover)] text-white rounded-[10px] text-xs font-medium transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Session</span>
            </button>

            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close sidebar"
              className="md:hidden p-1 text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Search Bar */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-2.5 text-[var(--theme-text-secondary)] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sessions..."
              className="w-full h-7 pl-7 pr-7 text-xs bg-[var(--theme-bg-surface)] border border-[var(--theme-border)] rounded-[8px] text-[var(--theme-text-primary)] placeholder:text-[var(--theme-text-secondary)]/60 focus:outline-none focus:border-[var(--theme-primary-green)] focus:ring-1 focus:ring-[var(--theme-primary-green)] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2 text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          <div className="flex items-center justify-between px-2 pb-1.5 text-[10px] uppercase font-mono tracking-wider text-[var(--theme-text-secondary)] select-none">
            <span>History</span>
            {searchQuery && (
              <span className="text-[9px] lowercase font-sans text-[var(--theme-primary-green)]">
                {filteredSessions.length} found
              </span>
            )}
          </div>

          {filteredSessions.length === 0 ? (
            <div className="px-2 py-4 text-xs text-[var(--theme-text-secondary)] italic text-center">
              {searchQuery ? `No sessions matching "${searchQuery}"` : 'No previous sessions'}
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const isEditing = editingSessionId === session.id;

              if (isEditing) {
                return (
                  <form
                    key={session.id}
                    onSubmit={(e) => handleSaveRename(session.id, e)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 px-1.5 py-1 bg-[var(--theme-bg-surface)] border border-[var(--theme-primary-green)] rounded-[8px] shadow-xs"
                  >
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          handleCancelRename();
                        }
                      }}
                      className="flex-1 min-w-0 bg-transparent text-xs text-[var(--theme-text-primary)] focus:outline-none px-1"
                    />
                    <button
                      type="submit"
                      aria-label="Save title"
                      className="p-1 text-[var(--theme-primary-green)] hover:bg-[var(--theme-green-tint)] rounded cursor-pointer transition-colors"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelRename}
                      aria-label="Cancel rename"
                      className="p-1 text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-bg-subtle)] rounded cursor-pointer transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </form>
                );
              }

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    onCloseMobile();
                  }}
                  onDoubleClick={(e) => handleStartRename(session, e)}
                  title="Click to open, double-click to rename"
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-[8px] cursor-pointer text-xs transition-colors select-none ${
                    isActive
                      ? 'bg-[var(--theme-green-tint)] text-[var(--theme-primary-green)] font-semibold border border-[var(--theme-green-tint-border)]'
                      : 'text-[var(--theme-text-primary)] hover:bg-[var(--theme-bg-hover)] hover:text-[var(--theme-primary-green)]'
                  }`}
                >
                  <span className="truncate pr-1 flex-1">{session.title}</span>

                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onRenameSession && (
                      <button
                        type="button"
                        onClick={(e) => handleStartRename(session, e)}
                        title="Rename title"
                        aria-label={`Rename session ${session.title}`}
                        className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary-green)] p-1 rounded hover:bg-[var(--theme-bg-surface)] transition-colors cursor-pointer"
                      >
                        <Pencil className="w-2.8 h-2.8" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => onDeleteSession(session.id, e)}
                      title="Delete session"
                      aria-label={`Delete session ${session.title}`}
                      className="text-[var(--theme-text-secondary)] hover:text-rose-500 p-1 rounded hover:bg-[var(--theme-bg-surface)] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-2.8 h-2.8" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Left Corner: Profile / Account Section */}
        <div className="border-t border-[var(--theme-border)] p-3 space-y-2.5 select-none">
          {/* Usage 50-box grid */}
          <QuestionUsageTracker
            questionsUsedToday={questionsUsedToday}
            maxQuestions={50}
            variant="full"
            hideHeader={true}
            hideFooter={true}
            onSelectQuestionBox={(qNum, dateStr) => {
              if (onNavigateToQuestion) {
                onNavigateToQuestion(qNum, dateStr);
                onCloseMobile();
              }
            }}
          />

          <button
            type="button"
            onClick={() => {
              if (onOpenProfile) {
                onOpenProfile();
                onCloseMobile();
              }
            }}
            title="Open Profile Settings"
            className="w-full flex items-center gap-2.5 pt-0.5 p-1.5 -mx-1.5 rounded-lg hover:bg-[var(--theme-bg-subtle)] text-left transition-colors cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden bg-[var(--theme-green-tint)] border border-[var(--theme-green-tint-border)] flex items-center justify-center text-xs font-semibold text-[var(--theme-primary-green)] uppercase flex-shrink-0">
              {currentUser?.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.name || 'User'} className="w-full h-full object-cover" />
              ) : currentUser?.name ? (
                currentUser.name.charAt(0)
              ) : (
                'U'
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-[var(--theme-text-primary)] group-hover:text-[var(--theme-primary-green)] truncate leading-tight transition-colors">
                {currentUser?.name || 'User'}
              </div>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};
