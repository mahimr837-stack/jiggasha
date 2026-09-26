import React from 'react';
import { AlertCircle } from 'lucide-react';

interface QuestionUsageTrackerProps {
  questionsUsedToday: number;
  maxQuestions?: number;
  variant?: 'compact' | 'full';
  showTitleCard?: boolean;
  hideHeader?: boolean;
  hideFooter?: boolean;
  className?: string;
  dateStr?: string;
  onSelectQuestionBox?: (questionNumber: number, dateStr?: string) => void;
}

const getTodayDateString = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const QuestionUsageTracker: React.FC<QuestionUsageTrackerProps> = ({
  questionsUsedToday,
  maxQuestions = 50,
  variant = 'full',
  showTitleCard = false,
  hideHeader = false,
  hideFooter = false,
  className = '',
  dateStr,
  onSelectQuestionBox,
}) => {
  const clampedCount = Math.min(Math.max(questionsUsedToday, 0), maxQuestions);
  const remaining = Math.max(0, maxQuestions - clampedCount);
  const isLimitReached = clampedCount >= maxQuestions;
  const effectiveDateStr = dateStr || getTodayDateString();

  // 50 boxes (10 columns x 5 rows)
  const boxes = Array.from({ length: maxQuestions }, (_, i) => i);

  const isCompact = variant === 'compact';

  return (
    <div className={`select-none ${className}`}>
      {/* Header: Title or Compact Label */}
      {!hideHeader && (
        showTitleCard ? (
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[var(--theme-text-primary)]">
                Today's Usage
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--theme-bg-subtle)] text-[var(--theme-text-secondary)] font-mono">
                Daily Limit: {maxQuestions}
              </span>
            </div>
            <span className="text-[11px] font-mono text-[var(--theme-text-secondary)]">
              <strong className="text-[var(--theme-text-primary)] font-medium">{clampedCount}</strong> / {maxQuestions}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 mb-1.5 text-[11px] text-[var(--theme-text-secondary)]">
            <span className="font-mono">
              <span className="font-medium text-[var(--theme-text-primary)]">{clampedCount}</span> / {maxQuestions} prompts used {dateStr ? 'on this date' : 'today'}
            </span>
            {isCompact && (
              <span className="text-[10px] text-[var(--theme-text-secondary)] font-mono">
                ({remaining} left)
              </span>
            )}
          </div>
        )
      )}

      {/* GitHub-style 10x5 Contribution Grid */}
      <div
        className="grid grid-cols-10 gap-[2.5px] sm:gap-[3px] p-0.5"
        role="group"
        aria-label={`Prompt usage: ${clampedCount} of ${maxQuestions} prompts used`}
      >
        {boxes.map((index) => {
          const questionNumber = index + 1;
          const isFilled = index < clampedCount;
          const isNext = index === clampedCount && !isLimitReached;

          let titleText = `Prompt ${questionNumber} of ${maxQuestions}`;
          if (isFilled) {
            titleText = onSelectQuestionBox
              ? `Prompt ${questionNumber} (Click to open prompt in workspace)`
              : `Prompt ${questionNumber} of ${maxQuestions} (Used)`;
          } else if (isNext) {
            titleText += ' (Next available)';
          } else {
            titleText += ' (Available)';
          }

          const boxSizeClass = isCompact
            ? 'w-[9px] h-[9px] sm:w-[10px] sm:h-[10px] rounded-[2px]'
            : 'w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[2.5px]';

          const isClickable = isFilled && !!onSelectQuestionBox;

          return (
            <button
              key={index}
              type="button"
              disabled={!isClickable}
              onClick={() => {
                if (isClickable) {
                  onSelectQuestionBox(questionNumber, effectiveDateStr);
                }
              }}
              title={titleText}
              aria-label={titleText}
              className={`${boxSizeClass} transition-all duration-150 relative ${
                isFilled
                  ? `bg-[var(--theme-primary-green)] border border-[var(--theme-primary-green)] shadow-2xs ${
                      isClickable
                        ? 'cursor-pointer hover:scale-130 hover:ring-2 hover:ring-[var(--theme-primary-green)] hover:ring-offset-1 hover:ring-offset-[var(--theme-bg-surface)] hover:z-10 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-green)]'
                        : ''
                    }`
                  : isNext
                  ? 'border-2 border-[var(--theme-primary-green)] bg-transparent ring-1 ring-[var(--theme-primary-green)]/35 animate-pulse cursor-default'
                  : 'bg-[var(--theme-bg-subtle)] border border-[var(--theme-border)] cursor-default'
              }`}
            />
          );
        })}
      </div>

      {/* Subtitle / Remaining count in full view */}
      {!hideFooter && showTitleCard && !isLimitReached && (
        <div className="mt-2 text-[10px] text-[var(--theme-text-secondary)] flex items-center justify-between font-mono">
          <span>{remaining} remaining today</span>
          <span className="text-[9px] text-[var(--theme-text-muted)]">Resets at midnight</span>
        </div>
      )}

      {/* Limit Reached Terracotta Banner */}
      {isLimitReached && (
        <div className="mt-2.5 p-2 rounded-[8px] bg-[var(--theme-terracotta-tint)] border border-[var(--theme-terracotta)]/40 text-[var(--theme-terracotta)] text-[11px] font-medium leading-tight flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Daily limit reached — resets at midnight</span>
        </div>
      )}
    </div>
  );
};
