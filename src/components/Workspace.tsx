import React, { useState, useRef, useEffect } from 'react';
import { WorkspaceTurn, SourceItem, UserAccount, SavedQuestion } from '../types';
import { Copy, Check, RefreshCw, CornerDownLeft, ArrowRight, Flag, X, Bookmark, Plus, Image as ImageIcon, FileText } from 'lucide-react';
import { QuestionUsageTracker } from './QuestionUsageTracker';
import { GroundingFeaturesDropdown } from './GroundingFeaturesDropdown';

const REPORT_REASONS = [
  'Wrong answer',
  'Poor quality explanation',
  "Doesn't match the textbook/reference page",
  'Formula or equation error',
  'Irrelevant to my question',
  'Incomplete answer',
  'Confusing or hard to understand',
  'Factually incorrect',
  'Other',
];

interface WorkspaceProps {
  turns: WorkspaceTurn[];
  onSubmitQuestion: (question: string) => void;
  onRegenerateTurn: (turnId: string) => void;
  isLoading: boolean;
  onSelectSample: (sampleText: string) => void;
  questionsUsedToday?: number;
  currentUser?: UserAccount | null;
  targetTurnId?: string | null;
  onNavigateToQuestion?: (questionNumber: number, dateStr?: string) => void;
  savedQuestions?: SavedQuestion[];
  onToggleSaveQuestion?: (turn: WorkspaceTurn) => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  turns,
  onSubmitQuestion,
  onRegenerateTurn,
  isLoading,
  onSelectSample,
  questionsUsedToday = 0,
  currentUser,
  targetTurnId,
  onNavigateToQuestion,
  savedQuestions = [],
  onToggleSaveQuestion,
}) => {
  const [initialInput, setInitialInput] = useState('');
  const [followUpInput, setFollowUpInput] = useState('');
  const [copiedTurnId, setCopiedTurnId] = useState<string | null>(null);
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);

  // File upload state & pop-up state
  const [isAttachOpenInitial, setIsAttachOpenInitial] = useState(false);
  const [isAttachOpenFollowUp, setIsAttachOpenFollowUp] = useState(false);
  const [attachedFilesInitial, setAttachedFilesInitial] = useState<
    { id: string; name: string; type: 'image' | 'file'; previewUrl?: string }[]
  >([]);
  const [attachedFilesFollowUp, setAttachedFilesFollowUp] = useState<
    { id: string; name: string; type: 'image' | 'file'; previewUrl?: string }[]
  >([]);

  const initialImageInputRef = useRef<HTMLInputElement>(null);
  const initialFileInputRef = useRef<HTMLInputElement>(null);
  const followUpImageInputRef = useRef<HTMLInputElement>(null);
  const followUpFileInputRef = useRef<HTMLInputElement>(null);

  // Reporting state
  const [reportingTurnId, setReportingTurnId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<string>(REPORT_REASONS[0]);
  const [reportDetails, setReportDetails] = useState('');
  const [justReportedTurnId, setJustReportedTurnId] = useState<string | null>(null);
  const [reportedTurnIds, setReportedTurnIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('study_workspace_reports');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return new Set(parsed.map((r: { turnId: string }) => r.turnId));
        }
      }
    } catch {
      // ignore
    }
    return new Set<string>();
  });

  const endRef = useRef<HTMLDivElement>(null);
  const initialTextareaRef = useRef<HTMLTextAreaElement>(null);
  const followUpTextareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'image' | 'file',
    isInitial: boolean
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments = Array.from(files).map((file) => {
      let previewUrl: string | undefined;
      if (file.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(file);
      }
      return {
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        type,
        previewUrl,
      };
    });

    if (isInitial) {
      setAttachedFilesInitial((prev) => [...prev, ...newAttachments]);
    } else {
      setAttachedFilesFollowUp((prev) => [...prev, ...newAttachments]);
    }

    e.target.value = '';
  };

  // Scroll to target turn if navigated directly from usage tracking
  useEffect(() => {
    if (targetTurnId) {
      setActiveHighlightId(targetTurnId);
      const timer = setTimeout(() => {
        const el = document.getElementById(`turn-element-${targetTurnId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 120);

      const clearTimer = setTimeout(() => {
        setActiveHighlightId(null);
      }, 3500);

      return () => {
        clearTimeout(timer);
        clearTimeout(clearTimer);
      };
    } else if (turns.length > 0) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [targetTurnId, turns.length, isLoading]);

  const handleInitialSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let query = initialInput.trim();
    if (attachedFilesInitial.length > 0) {
      const fileNames = attachedFilesInitial.map((f) => f.name).join(', ');
      query = query ? `${query} [Attached: ${fileNames}]` : `[Attached: ${fileNames}]`;
    }
    if (!query || isLoading) return;
    onSubmitQuestion(query);
    setInitialInput('');
    setAttachedFilesInitial([]);
    setIsAttachOpenInitial(false);
  };

  const handleFollowUpSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let query = followUpInput.trim();
    if (attachedFilesFollowUp.length > 0) {
      const fileNames = attachedFilesFollowUp.map((f) => f.name).join(', ');
      query = query ? `${query} [Attached: ${fileNames}]` : `[Attached: ${fileNames}]`;
    }
    if (!query || isLoading) return;
    onSubmitQuestion(query);
    setFollowUpInput('');
    setAttachedFilesFollowUp([]);
    setIsAttachOpenFollowUp(false);
  };

  const handleKeyDownInitial = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleInitialSubmit();
    }
  };

  const handleKeyDownFollowUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFollowUpSubmit();
    }
  };

  const handleCopy = async (turn: WorkspaceTurn) => {
    if (!turn.response) return;
    const textToCopy = `QUESTION:\n${turn.response.questionRestatement}\n\nSOLUTION:\n${turn.response.solution}\n\nEXPLANATION:\n${turn.response.explanation}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedTurnId(turn.id);
      setTimeout(() => setCopiedTurnId(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleSubmitReport = (turn: WorkspaceTurn) => {
    const reportData = {
      id: `report-${Date.now()}`,
      turnId: turn.id,
      question: turn.userQuery,
      answer: turn.response?.solution || turn.response?.explanation || '',
      reason: reportReason,
      details: reportReason === 'Other' ? reportDetails.trim() : undefined,
      timestamp: Date.now(),
      userEmail: currentUser?.email || 'mahimr837@gmail.com',
    };

    try {
      const existing = localStorage.getItem('study_workspace_reports');
      const parsed = existing ? JSON.parse(existing) : [];
      const updated = Array.isArray(parsed) ? [...parsed, reportData] : [reportData];
      localStorage.setItem('study_workspace_reports', JSON.stringify(updated));
    } catch {
      // ignore
    }

    setReportedTurnIds((prev) => new Set([...prev, turn.id]));
    setJustReportedTurnId(turn.id);
    setReportingTurnId(null);
    setReportReason(REPORT_REASONS[0]);
    setReportDetails('');

    setTimeout(() => {
      setJustReportedTurnId(null);
    }, 3000);
  };

  const samples = [
    {
      title: 'Concept Explanation',
      prompt: 'Explain quantum computing in simple terms for a general audience.',
    },
    {
      title: 'Performance & Optimization',
      prompt: 'What are key strategies for optimizing web application performance?',
    },
    {
      title: 'Creative Analysis',
      prompt: 'Write a concise analysis comparing renewable and non-renewable energy.',
    },
    {
      title: 'Logic & Code',
      prompt: 'How do I implement a binary search algorithm with step-by-step explanation?',
    },
  ];

  const renderExplanationContent = (text: string) => {
    return (
      <div className="space-y-3">
        <div className="text-[var(--theme-text-primary)] text-sm leading-relaxed whitespace-pre-line font-sans">
          {text.trim()}
        </div>
      </div>
    );
  };

  return (
    <main className="flex-1 flex flex-col h-full overflow-y-auto bg-[var(--theme-bg-app)] text-[var(--theme-text-primary)] transition-colors duration-200">
      <div className="max-w-3xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-10 flex-1 flex flex-col">
        {/* If no questions yet: Clean, spacious initial workspace */}
        {turns.length === 0 ? (
          <div className="my-auto py-6">
            {/* Primary Question Area */}
            <div className="workspace-input-box border border-[var(--theme-border)] rounded-xl p-4 sm:p-5 bg-[var(--theme-bg-surface)] focus-within:border-[var(--theme-primary-green)] focus-within:ring-1 focus-within:ring-[var(--theme-primary-green)] transition-all shadow-xs">
              {/* Hidden File Inputs */}
              <input
                type="file"
                ref={initialImageInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, 'image', true)}
              />
              <input
                type="file"
                ref={initialFileInputRef}
                accept=".pdf,.doc,.docx,.txt,.csv,.json"
                className="hidden"
                onChange={(e) => handleFileChange(e, 'file', true)}
              />

              <textarea
                id="main-question-input"
                ref={initialTextareaRef}
                value={initialInput}
                onChange={(e) => setInitialInput(e.target.value)}
                onKeyDown={handleKeyDownInitial}
                placeholder=""
                rows={5}
                aria-label="Message prompt"
                className="workspace-input-field w-full bg-transparent resize-none focus:outline-none text-[var(--theme-text-primary)] text-sm leading-relaxed"
              />

              {/* Attachment Previews */}
              {attachedFilesInitial.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {attachedFilesInitial.map((att) => (
                    <div
                      key={att.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-bg-subtle)] text-xs text-[var(--theme-text-primary)] shadow-2xs"
                    >
                      {att.type === 'image' ? (
                        att.previewUrl ? (
                          <img src={att.previewUrl} alt="" className="w-4 h-4 rounded object-cover" />
                        ) : (
                          <ImageIcon className="w-3.5 h-3.5 text-[var(--theme-primary-green)]" />
                        )
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-[var(--theme-primary-green)]" />
                      )}
                      <span className="max-w-[140px] truncate font-mono text-[11px]">{att.name}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setAttachedFilesInitial((prev) => prev.filter((item) => item.id !== att.id))
                        }
                        className="p-0.5 rounded hover:bg-[var(--theme-border)] text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors cursor-pointer"
                        aria-label="Remove attachment"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-[var(--theme-border)] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Plus Upload Button & Pop-up Symbols */}
                  <div className="relative flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsAttachOpenInitial((prev) => !prev)}
                      title={isAttachOpenInitial ? 'Close' : 'Upload File or Image'}
                      aria-label="Upload file or image"
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer border ${
                        isAttachOpenInitial
                          ? 'bg-[var(--theme-primary-green)] text-white border-[var(--theme-primary-green)] shadow-xs rotate-45'
                          : 'text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-bg-subtle)] border-[var(--theme-border)]'
                      }`}
                    >
                      <Plus className="w-4 h-4 transition-transform duration-200" />
                    </button>

                    {/* Pop up two small square symbol buttons */}
                    {isAttachOpenInitial && (
                      <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-150">
                        {/* 1. Image Square Symbol Button */}
                        <button
                          type="button"
                          onClick={() => {
                            initialImageInputRef.current?.click();
                            setIsAttachOpenInitial(false);
                          }}
                          title="Image"
                          aria-label="Upload Image"
                          className="w-8 h-8 rounded-lg flex items-center justify-center border border-[var(--theme-border)] bg-[var(--theme-bg-subtle)] hover:bg-[var(--theme-bg-surface)] hover:border-[var(--theme-primary-green)] text-[var(--theme-text-primary)] shadow-xs transition-all cursor-pointer group"
                        >
                          <ImageIcon className="w-4 h-4 text-[var(--theme-text-secondary)] group-hover:text-[var(--theme-primary-green)] transition-colors" />
                        </button>

                        {/* 2. File Square Symbol Button */}
                        <button
                          type="button"
                          onClick={() => {
                            initialFileInputRef.current?.click();
                            setIsAttachOpenInitial(false);
                          }}
                          title="File"
                          aria-label="Upload File"
                          className="w-8 h-8 rounded-lg flex items-center justify-center border border-[var(--theme-border)] bg-[var(--theme-bg-subtle)] hover:bg-[var(--theme-bg-surface)] hover:border-[var(--theme-primary-green)] text-[var(--theme-text-primary)] shadow-xs transition-all cursor-pointer group"
                        >
                          <FileText className="w-4 h-4 text-[var(--theme-text-secondary)] group-hover:text-[var(--theme-primary-green)] transition-colors" />
                        </button>
                      </div>
                    )}
                  </div>

                  <QuestionUsageTracker
                    questionsUsedToday={questionsUsedToday}
                    maxQuestions={50}
                    variant="compact"
                    onSelectQuestionBox={onNavigateToQuestion}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleInitialSubmit()}
                  disabled={(!initialInput.trim() && attachedFilesInitial.length === 0) || isLoading || questionsUsedToday >= 50}
                  className="h-9 px-4 bg-[var(--theme-primary-green)] hover:bg-[var(--theme-primary-green-hover)] disabled:bg-[var(--theme-border)] disabled:text-[var(--theme-text-secondary)] text-white rounded-[10px] text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:cursor-not-allowed"
                >
                  <span>Send</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Suggested Prompts */}
            <div className="mt-8">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--theme-text-secondary)] mb-3 select-none">
                Suggested Prompts
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {samples.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInitialInput(sample.prompt);
                      initialTextareaRef.current?.focus();
                    }}
                    className="text-left p-3 border border-[var(--theme-border)] hover:border-[var(--theme-primary-green)]/50 rounded-[10px] text-xs transition-colors bg-[var(--theme-bg-surface)] group cursor-pointer shadow-xs"
                  >
                    <div className="font-mono text-[10px] text-[var(--theme-text-secondary)] mb-1 group-hover:text-[var(--theme-primary-green)] transition-colors">
                      {sample.title}
                    </div>
                    <div className="text-[var(--theme-text-primary)] line-clamp-2 leading-relaxed">
                      {sample.prompt}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Active Investigation Workspace with Turns */
          <div className="space-y-10 pb-6">
            {turns.map((turn, turnIdx) => {
              const isTurnHighlighted = activeHighlightId === turn.id;
              return (
                <div
                  key={turn.id}
                  id={`turn-element-${turn.id}`}
                  className={`space-y-6 rounded-2xl transition-all duration-300 ${
                    isTurnHighlighted
                      ? 'ring-2 ring-[var(--theme-primary-green)] ring-offset-4 ring-offset-[var(--theme-bg-app)] shadow-md p-2 -m-2 bg-[var(--theme-green-tint)]/10 animate-fade-in'
                      : ''
                  }`}
                >
                  {/* User Original Inquiry */}
                  <div className="border-l-2 border-[var(--theme-primary-green)] pl-3.5 py-0.5">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--theme-text-secondary)]">
                        Prompt #{turnIdx + 1}
                      </span>
                      {isTurnHighlighted && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-[var(--theme-primary-green)] bg-[var(--theme-green-tint)] px-2 py-0.5 rounded-full">
                          Target Query ✓
                        </span>
                      )}
                    </div>
                    <div className="text-[var(--theme-text-primary)] text-sm font-medium leading-relaxed">
                      {turn.userQuery}
                    </div>
                  </div>

                  {/* Structured Output Card */}
                  {turn.response ? (
                    <div className="workspace-output-box border border-[var(--theme-border)] rounded-xl p-5 sm:p-6 bg-[var(--theme-bg-surface)] space-y-6 shadow-xs">
                    {/* SECTION 1: QUERY */}
                    <section className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h2 className="text-[11px] font-mono uppercase tracking-widest font-semibold text-[var(--theme-text-secondary)]">
                          QUERY
                        </h2>
                      </div>
                      <div className="text-[var(--theme-text-primary)] text-sm leading-relaxed whitespace-pre-line font-sans">
                        {turn.response.questionRestatement}
                      </div>
                    </section>

                    <hr className="border-[var(--theme-border)]" />

                    {/* SECTION 2: RESPONSE */}
                    <section className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h2 className="text-[11px] font-mono uppercase tracking-widest font-semibold text-[var(--theme-text-primary)]">
                          RESPONSE
                        </h2>
                      </div>
                      <div className="text-[var(--theme-text-primary)] text-sm leading-relaxed whitespace-pre-line font-sans">
                        {turn.response.solution}
                      </div>
                    </section>

                    {turn.response.explanation && (
                      <>
                        <hr className="border-[var(--theme-border)]" />

                        {/* SECTION 3: DETAILS */}
                        <section className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h2 className="text-[11px] font-mono uppercase tracking-widest font-semibold text-[var(--theme-text-secondary)]">
                              DETAILS
                            </h2>
                          </div>
                          {renderExplanationContent(turn.response.explanation)}
                        </section>
                      </>
                    )}

                    {/* Features & Grounding Used Dropdown */}
                    <GroundingFeaturesDropdown groundingInfo={turn.response.groundingInfo} />

                    {/* Subtle Action Row - Icon Only Aesthetic Controls */}
                    <div className="pt-3 border-t border-[var(--theme-border)] text-xs select-none">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5">
                          {/* 1. Copy Action */}
                          <button
                            type="button"
                            onClick={() => handleCopy(turn)}
                            title={copiedTurnId === turn.id ? 'Copied' : 'Copy Answer'}
                            className="p-2 rounded-lg text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-bg-subtle)] border border-transparent hover:border-[var(--theme-border)] transition-all cursor-pointer"
                            aria-label="Copy Answer"
                          >
                            {copiedTurnId === turn.id ? (
                              <Check className="w-4 h-4 text-[var(--theme-primary-green)]" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          {/* 2. Regenerate Action */}
                          <button
                            type="button"
                            onClick={() => onRegenerateTurn(turn.id)}
                            disabled={isLoading}
                            title="Regenerate Answer"
                            className="p-2 rounded-lg text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-bg-subtle)] border border-transparent hover:border-[var(--theme-border)] transition-all disabled:opacity-50 cursor-pointer"
                            aria-label="Regenerate Answer"
                          >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                          </button>

                          {/* 3. Save Action */}
                          {(() => {
                            const isSaved = savedQuestions.some(
                              (sq) =>
                                sq.turnId === turn.id ||
                                (turn.response &&
                                  sq.question === (turn.response.questionRestatement || turn.userQuery))
                            );
                            return (
                              <button
                                type="button"
                                onClick={() => onToggleSaveQuestion && onToggleSaveQuestion(turn)}
                                title={isSaved ? 'Saved (Click to remove)' : 'Save Question'}
                                className={`p-2 rounded-lg border transition-all cursor-pointer ${
                                  isSaved
                                    ? 'text-[var(--theme-primary-green)] bg-[var(--theme-green-tint)]/40 border-[var(--theme-primary-green)]/30'
                                    : 'text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-bg-subtle)] border-transparent hover:border-[var(--theme-border)]'
                                }`}
                                aria-label="Save Question"
                              >
                                <Bookmark
                                  className={`w-4 h-4 ${isSaved ? 'fill-[var(--theme-primary-green)]' : ''}`}
                                />
                              </button>
                            );
                          })()}

                          {/* 4. Report Action */}
                          {reportedTurnIds.has(turn.id) ? (
                            <span
                              className="p-2 rounded-lg text-[var(--theme-terracotta)] bg-[var(--theme-terracotta-tint)] border border-[var(--theme-terracotta)]/30 inline-flex items-center justify-center select-none"
                              title="Report submitted"
                            >
                              <Flag className="w-4 h-4 fill-[var(--theme-terracotta)]" />
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setReportingTurnId(reportingTurnId === turn.id ? null : turn.id);
                                setReportReason(REPORT_REASONS[0]);
                                setReportDetails('');
                              }}
                              title="Report Issue"
                              className="p-2 rounded-lg text-[var(--theme-text-secondary)] hover:text-[var(--theme-terracotta)] hover:bg-[var(--theme-bg-subtle)] border border-transparent hover:border-[var(--theme-border)] transition-all cursor-pointer"
                              aria-label="Report Issue"
                            >
                              <Flag className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {justReportedTurnId === turn.id && (
                          <span className="text-[11px] font-mono text-[var(--theme-primary-green)] bg-[var(--theme-green-tint)] px-2.5 py-1 rounded-md animate-in fade-in duration-200">
                            Thanks, we'll look into it.
                          </span>
                        )}
                      </div>

                      {/* Inline Dropdown/Card for Reporting */}
                      {reportingTurnId === turn.id && (
                        <div className="mt-3 p-4 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg-surface)] shadow-md space-y-3 animate-in fade-in duration-150">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--theme-text-primary)]">
                              <Flag className="w-3.5 h-3.5 text-[var(--theme-terracotta)]" />
                              <span>Report issue with this answer</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setReportingTurnId(null);
                                setReportReason(REPORT_REASONS[0]);
                                setReportDetails('');
                              }}
                              className="p-1 text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] rounded cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--theme-text-secondary)]">
                              Reason
                            </label>
                            <select
                              value={reportReason}
                              onChange={(e) => setReportReason(e.target.value)}
                              className="w-full h-8 px-2.5 bg-[var(--theme-bg-input)] border border-[var(--theme-border)] focus:border-[var(--theme-primary-green)] rounded-lg text-xs text-[var(--theme-text-primary)] focus:outline-none transition-colors cursor-pointer"
                            >
                              {REPORT_REASONS.map((reason) => (
                                <option key={reason} value={reason}>
                                  {reason}
                                </option>
                              ))}
                            </select>
                          </div>

                          {reportReason === 'Other' && (
                            <div className="space-y-1">
                              <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--theme-text-secondary)]">
                                Details
                              </label>
                              <textarea
                                value={reportDetails}
                                onChange={(e) => setReportDetails(e.target.value)}
                                placeholder="Describe the issue..."
                                rows={3}
                                className="w-full p-2.5 bg-[var(--theme-bg-input)] border border-[var(--theme-border)] focus:border-[var(--theme-primary-green)] rounded-lg text-xs text-[var(--theme-text-primary)] focus:outline-none transition-colors resize-none"
                              />
                            </div>
                          )}

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setReportingTurnId(null);
                                setReportReason(REPORT_REASONS[0]);
                                setReportDetails('');
                              }}
                              className="h-7 px-3 rounded-lg border border-[var(--theme-border)] text-xs text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-bg-subtle)] transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSubmitReport(turn)}
                              className="h-7 px-3.5 bg-[var(--theme-primary-green)] hover:bg-[var(--theme-primary-green-hover)] text-white rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                            >
                              <span>Submit Report</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : turn.status === 'generating' || turn.status === 'retrieving' ? (
                  <div
                    className="py-1 px-0.5 text-xs font-mono text-[var(--theme-text-secondary)] select-none"
                    role="status"
                    aria-live="polite"
                  >
                    <span
                      key={turn.processingStage || 'searching'}
                      className="processing-status-text inline-block"
                    >
                      {turn.processingStage === 'thinking'
                        ? 'Thinking…'
                        : turn.processingStage === 'preparing'
                        ? 'Preparing answer…'
                        : 'Searching sources…'}
                    </span>
                  </div>
                ) : turn.status === 'error' ? (
                  <div className="border border-rose-200 rounded-xl p-4 text-xs text-rose-700 bg-rose-50 font-mono">
                    Failed to process this turn. Please verify your connection or retry.
                  </div>
                ) : null}
              </div>
            );
          })}

            {/* Follow-up Question Box at the bottom of the workspace */}
            <div className="mt-8 pt-4 border-t border-[var(--theme-border)]">
              <div className="workspace-input-box border border-[var(--theme-border)] rounded-xl p-3.5 bg-[var(--theme-bg-surface)] focus-within:border-[var(--theme-primary-green)] focus-within:ring-1 focus-within:ring-[var(--theme-primary-green)] transition-all shadow-xs">
                {/* Hidden File Inputs for Follow-up */}
                <input
                  type="file"
                  ref={followUpImageInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'image', false)}
                />
                <input
                  type="file"
                  ref={followUpFileInputRef}
                  accept=".pdf,.doc,.docx,.txt,.csv,.json"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'file', false)}
                />

                <textarea
                  id="followup-question-input"
                  ref={followUpTextareaRef}
                  value={followUpInput}
                  onChange={(e) => setFollowUpInput(e.target.value)}
                  onKeyDown={handleKeyDownFollowUp}
                  placeholder=""
                  rows={2}
                  aria-label="Follow-up prompt"
                  className="workspace-input-field w-full bg-transparent resize-none focus:outline-none text-[var(--theme-text-primary)] text-xs sm:text-sm leading-relaxed"
                />

                {/* Attachment Previews */}
                {attachedFilesFollowUp.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {attachedFilesFollowUp.map((att) => (
                      <div
                        key={att.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-bg-subtle)] text-xs text-[var(--theme-text-primary)] shadow-2xs"
                      >
                        {att.type === 'image' ? (
                          att.previewUrl ? (
                            <img src={att.previewUrl} alt="" className="w-4 h-4 rounded object-cover" />
                          ) : (
                            <ImageIcon className="w-3.5 h-3.5 text-[var(--theme-primary-green)]" />
                          )
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-[var(--theme-primary-green)]" />
                        )}
                        <span className="max-w-[140px] truncate font-mono text-[11px]">{att.name}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setAttachedFilesFollowUp((prev) => prev.filter((item) => item.id !== att.id))
                          }
                          className="p-0.5 rounded hover:bg-[var(--theme-border)] text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors cursor-pointer"
                          aria-label="Remove attachment"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-2 pt-2 border-t border-[var(--theme-border)] flex items-center justify-between gap-3">
                  {/* Plus Upload Button & Pop-up Symbols at Bottom Left */}
                  <div className="relative flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsAttachOpenFollowUp((prev) => !prev)}
                      title={isAttachOpenFollowUp ? 'Close' : 'Upload File or Image'}
                      aria-label="Upload file or image"
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer border ${
                        isAttachOpenFollowUp
                          ? 'bg-[var(--theme-primary-green)] text-white border-[var(--theme-primary-green)] shadow-xs rotate-45'
                          : 'text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-bg-subtle)] border-[var(--theme-border)]'
                      }`}
                    >
                      <Plus className="w-4 h-4 transition-transform duration-200" />
                    </button>

                    {/* Pop up two small square symbol buttons */}
                    {isAttachOpenFollowUp && (
                      <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-150">
                        {/* 1. Image Square Symbol Button */}
                        <button
                          type="button"
                          onClick={() => {
                            followUpImageInputRef.current?.click();
                            setIsAttachOpenFollowUp(false);
                          }}
                          title="Image"
                          aria-label="Upload Image"
                          className="w-8 h-8 rounded-lg flex items-center justify-center border border-[var(--theme-border)] bg-[var(--theme-bg-subtle)] hover:bg-[var(--theme-bg-surface)] hover:border-[var(--theme-primary-green)] text-[var(--theme-text-primary)] shadow-xs transition-all cursor-pointer group"
                        >
                          <ImageIcon className="w-4 h-4 text-[var(--theme-text-secondary)] group-hover:text-[var(--theme-primary-green)] transition-colors" />
                        </button>

                        {/* 2. File Square Symbol Button */}
                        <button
                          type="button"
                          onClick={() => {
                            followUpFileInputRef.current?.click();
                            setIsAttachOpenFollowUp(false);
                          }}
                          title="File"
                          aria-label="Upload File"
                          className="w-8 h-8 rounded-lg flex items-center justify-center border border-[var(--theme-border)] bg-[var(--theme-bg-subtle)] hover:bg-[var(--theme-bg-surface)] hover:border-[var(--theme-primary-green)] text-[var(--theme-text-primary)] shadow-xs transition-all cursor-pointer group"
                        >
                          <FileText className="w-4 h-4 text-[var(--theme-text-secondary)] group-hover:text-[var(--theme-primary-green)] transition-colors" />
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleFollowUpSubmit()}
                    disabled={(!followUpInput.trim() && attachedFilesFollowUp.length === 0) || isLoading || questionsUsedToday >= 50}
                    className="h-8 px-3.5 bg-[var(--theme-primary-green)] hover:bg-[var(--theme-primary-green-hover)] disabled:bg-[var(--theme-border)] disabled:text-[var(--theme-text-secondary)] text-white rounded-[10px] text-xs font-medium flex items-center gap-1 transition-colors shadow-xs cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span>Follow-up</span>
                    <CornerDownLeft className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            <div ref={endRef} />
          </div>
        )}
      </div>
    </main>
  );
};
