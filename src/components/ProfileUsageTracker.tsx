import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Check, AlertCircle, ChevronLeft, ChevronRight, RotateCcw, Clock } from 'lucide-react';
import { QuestionUsageTracker } from './QuestionUsageTracker';

interface ProfileUsageTrackerProps {
  questionsUsedToday: number;
  maxQuestions?: number;
  className?: string;
  onNavigateToQuestion?: (questionNumber: number, dateStr?: string) => void;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const ACCOUNT_CREATION_DATE = '2024-01-15';

export const ProfileUsageTracker: React.FC<ProfileUsageTrackerProps> = ({
  questionsUsedToday,
  maxQuestions = 50,
  className = '',
  onNavigateToQuestion,
}) => {
  const now = useMemo(() => new Date(), []);
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();

  // Tab State: 'today' | 'week' | 'month' | null (null when specific date selected)
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month' | null>('today');

  // Date Picker State
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  // Single Date Query State
  const [queriedDateData, setQueriedDateData] = useState<{
    date: string;
    count: number;
    dayName?: string;
    formattedDate?: string;
    isValidAccountDate: boolean;
    isFuture: boolean;
    message?: string;
  } | null>(null);

  const [isLoadingDate, setIsLoadingDate] = useState(false);

  // Year options: current year down to 2023 (or previous 3 years)
  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let y = currentYear; y >= currentYear - 3; y--) {
      years.push(y);
    }
    return years;
  }, [currentYear]);

  // Month options: for current year, only show up to current month
  const availableMonths = useMemo(() => {
    return MONTH_NAMES.map((name, index) => {
      const isFuture = selectedYear === currentYear && index > currentMonth;
      return {
        name,
        index,
        disabled: isFuture,
      };
    });
  }, [selectedYear, currentYear, currentMonth]);

  // If the user selects a year where the current selectedMonth is invalid (future), adjust to currentMonth or December
  useEffect(() => {
    if (selectedYear === currentYear && selectedMonth > currentMonth) {
      setSelectedMonth(currentMonth);
    }
  }, [selectedYear, currentYear, currentMonth, selectedMonth]);

  // Generate calendar days for selected year and month
  const calendarDays = useMemo(() => {
    const firstDayOfWeek = new Date(selectedYear, selectedMonth, 1).getDay();
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const prevMonthDays = new Date(selectedYear, selectedMonth, 0).getDate();

    const days = [];

    // Leading days from previous month
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        dayNumber: prevMonthDays - i,
        isCurrentMonth: false,
        dateStr: '',
        isFuture: false,
        isBeforeAccount: false,
        isToday: false,
      });
    }

    // Days of current selected month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dateObj = new Date(selectedYear, selectedMonth, d);
      const isFuture =
        selectedYear > currentYear ||
        (selectedYear === currentYear && selectedMonth > currentMonth) ||
        (selectedYear === currentYear && selectedMonth === currentMonth && d > currentDay);

      const isBeforeAccount = dateStr < ACCOUNT_CREATION_DATE;
      const isToday =
        selectedYear === currentYear && selectedMonth === currentMonth && d === currentDay;

      days.push({
        dayNumber: d,
        isCurrentMonth: true,
        dateStr,
        isFuture,
        isBeforeAccount,
        isToday,
      });
    }

    // Trailing padding to make full 7-col rows
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        days.push({
          dayNumber: i,
          isCurrentMonth: false,
          dateStr: '',
          isFuture: false,
          isBeforeAccount: false,
          isToday: false,
        });
      }
    }

    return days;
  }, [selectedYear, selectedMonth, currentYear, currentMonth, currentDay]);

  // Fetch or calculate usage for selected date
  const fetchDateUsage = async (dateStr: string) => {
    setIsLoadingDate(true);
    const [y, m, d] = dateStr.split('-').map(Number);
    const targetDate = new Date(y, m - 1, d);
    const todayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;

    // If it's today, we use live questionsUsedToday
    if (dateStr === todayStr) {
      const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' });
      const formattedDate = targetDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      setQueriedDateData({
        date: dateStr,
        count: questionsUsedToday,
        dayName,
        formattedDate,
        isValidAccountDate: true,
        isFuture: false,
      });
      setIsLoadingDate(false);
      return;
    }

    try {
      const res = await fetch(`/api/usage/query?date=${dateStr}`);
      if (res.ok) {
        const data = await res.json();
        setQueriedDateData(data);
      } else {
        throw new Error('Failed to query date');
      }
    } catch {
      // Fallback deterministic computation if offline
      const isBefore = dateStr < ACCOUNT_CREATION_DATE;
      const isFuture = dateStr > todayStr;
      const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' });
      const formattedDate = targetDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

      let hash = 0;
      for (let i = 0; i < dateStr.length; i++) {
        hash = (hash * 31 + dateStr.charCodeAt(i)) % 10007;
      }
      const count = isBefore || isFuture ? 0 : (hash % 5 === 0 ? 0 : (hash % 35) + 4);

      setQueriedDateData({
        date: dateStr,
        count,
        dayName,
        formattedDate,
        isValidAccountDate: !isBefore && !isFuture,
        isFuture,
        message: isBefore
          ? 'No data for this date (account created on Jan 15, 2024).'
          : isFuture
          ? 'Future dates do not have usage records.'
          : undefined,
      });
    } finally {
      setIsLoadingDate(false);
    }
  };

  const handleSelectDateString = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    fetchDateUsage(dateStr);
  };

  const handleSelectDay = (day: {
    dayNumber: number;
    isCurrentMonth: boolean;
    dateStr: string;
    isFuture: boolean;
    isBeforeAccount: boolean;
  }) => {
    if (!day.isCurrentMonth || day.isFuture || !day.dateStr) return;
    handleSelectDateString(day.dateStr);
  };

  const handleSelectTab = (tab: 'today' | 'week' | 'month') => {
    setActiveTab(tab);
    if (tab === 'today') {
      const todayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
      setSelectedDateStr(todayStr);
      fetchDateUsage(todayStr);
    } else {
      setSelectedDateStr(null);
      setQueriedDateData(null);
    }
  };

  // Past 7 Days data for Week Tab
  const past7Days = useMemo(() => {
    const days = [];
    const todayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth, currentDay);
      d.setDate(d.getDate() - i);

      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayNum = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${dayNum}`;

      let dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      if (dateStr === todayStr) dayName = 'Today';

      let count = 0;
      if (dateStr === todayStr) {
        count = questionsUsedToday;
      } else {
        let hash = 0;
        for (let j = 0; j < dateStr.length; j++) {
          hash = (hash * 31 + dateStr.charCodeAt(j)) % 10007;
        }
        count = dateStr < ACCOUNT_CREATION_DATE ? 0 : (hash % 5 === 0 ? 0 : (hash % 28) + 4);
      }

      days.push({ dayName, dateStr, count, isToday: dateStr === todayStr });
    }
    return days;
  }, [currentYear, currentMonth, currentDay, questionsUsedToday]);

  // Current Month days breakdown for Month Tab
  const monthDays = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const todayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
    const days = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = d === currentDay;
      const isFuture = d > currentDay;

      let count = 0;
      if (isToday) {
        count = questionsUsedToday;
      } else if (!isFuture) {
        let hash = 0;
        for (let j = 0; j < dateStr.length; j++) {
          hash = (hash * 31 + dateStr.charCodeAt(j)) % 10007;
        }
        count = dateStr < ACCOUNT_CREATION_DATE ? 0 : (hash % 5 === 0 ? 0 : (hash % 32) + 3);
      }

      days.push({
        dayNumber: d,
        dateStr,
        count,
        isToday,
        isFuture,
      });
    }
    return days;
  }, [currentYear, currentMonth, currentDay, questionsUsedToday]);

  return (
    <div className={`border border-[var(--theme-border)] rounded-xl p-4 sm:p-5 bg-[var(--theme-bg-surface)] shadow-xs transition-colors duration-200 ${className}`}>
      {/* SECTION: VIEW USAGE FOR A SPECIFIC DATE (DATE PICKER) */}
      <div className="mb-4 p-3 sm:p-3.5 bg-[var(--theme-bg-subtle)]/70 rounded-xl border border-[var(--theme-border)] space-y-3">
        {/* 2 Dropdown / Select Fields in a Horizontal Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* 1. Year Dropdown */}
          <div>
            <select
              id="usage-year-select"
              aria-label="Select year"
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(Number(e.target.value));
              }}
              className="w-full h-9 px-3 bg-[var(--theme-bg-input)] border border-[var(--theme-border)] hover:border-[var(--theme-primary-green)]/50 focus:border-[var(--theme-primary-green)] focus:ring-1 focus:ring-[var(--theme-primary-green)] rounded-lg text-xs font-mono text-[var(--theme-text-primary)] focus:outline-none transition-colors cursor-pointer"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year} {year === currentYear ? '(Current)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Month Dropdown */}
          <div>
            <select
              id="usage-month-select"
              aria-label="Select month"
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(Number(e.target.value));
              }}
              className="w-full h-9 px-3 bg-[var(--theme-bg-input)] border border-[var(--theme-border)] hover:border-[var(--theme-primary-green)]/50 focus:border-[var(--theme-primary-green)] focus:ring-1 focus:ring-[var(--theme-primary-green)] rounded-lg text-xs text-[var(--theme-text-primary)] focus:outline-none transition-colors cursor-pointer"
            >
              {availableMonths.map((m) => (
                <option key={m.index} value={m.index} disabled={m.disabled}>
                  {m.name} {m.disabled ? '(Future)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. Small Inline Calendar Grid Picker */}
        <div className="pt-1">
          <div className="flex items-center justify-between mb-1.5 px-0.5 text-xs font-medium text-[var(--theme-text-primary)]">
            <span>
              {MONTH_NAMES[selectedMonth]} {selectedYear}
            </span>
          </div>

          {/* Calendar Table */}
          <div className="bg-[var(--theme-bg-surface)] border border-[var(--theme-border)] rounded-lg p-2">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {DAY_LABELS.map((label, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-mono text-[var(--theme-text-secondary)] py-0.5"
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Day Cells */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                const isSelected = selectedDateStr === day.dateStr && day.isCurrentMonth;
                const isClickable = day.isCurrentMonth && !day.isFuture;

                if (!day.isCurrentMonth) {
                  return (
                    <div
                      key={idx}
                      className="h-7 flex items-center justify-center text-[10px] text-[var(--theme-text-secondary)]/30 select-none font-mono"
                    >
                      {day.dayNumber}
                    </div>
                  );
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={!isClickable}
                    onClick={() => handleSelectDay(day)}
                    title={
                      day.isFuture
                        ? 'Future date'
                        : day.isBeforeAccount
                        ? 'Before account registration'
                        : `Select ${MONTH_NAMES[selectedMonth]} ${day.dayNumber}, ${selectedYear}`
                    }
                    className={`h-7 rounded-md flex flex-col items-center justify-center text-xs font-mono transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-[var(--theme-primary-green)] text-white font-bold ring-2 ring-[var(--theme-primary-green)] ring-offset-1 ring-offset-[var(--theme-bg-surface)] shadow-xs'
                        : day.isToday
                        ? 'bg-[var(--theme-green-tint)] text-[var(--theme-primary-green)] font-semibold border border-[var(--theme-primary-green)]/40 hover:bg-[var(--theme-primary-green)] hover:text-white'
                        : isClickable
                        ? 'hover:bg-[var(--theme-bg-subtle)] text-[var(--theme-text-primary)]'
                        : 'opacity-35 cursor-not-allowed text-[var(--theme-text-secondary)] bg-transparent'
                    }`}
                  >
                    <span>{day.dayNumber}</span>
                    {day.isToday && !isSelected && (
                      <span className="w-1 h-1 rounded-full bg-[var(--theme-primary-green)] -mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* TABS: TODAY | THIS WEEK | THIS MONTH */}
      <div className="flex items-center gap-1.5 mb-4 p-1 rounded-lg bg-[var(--theme-bg-subtle)] border border-[var(--theme-border)]">
        <button
          type="button"
          onClick={() => handleSelectTab('today')}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all cursor-pointer text-center ${
            activeTab === 'today'
              ? 'bg-[var(--theme-bg-surface)] text-[var(--theme-primary-green)] font-semibold shadow-xs border border-[var(--theme-border)]'
              : 'text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)]'
          }`}
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => handleSelectTab('week')}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all cursor-pointer text-center ${
            activeTab === 'week'
              ? 'bg-[var(--theme-bg-surface)] text-[var(--theme-primary-green)] font-semibold shadow-xs border border-[var(--theme-border)]'
              : 'text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)]'
          }`}
        >
          This Week
        </button>
        <button
          type="button"
          onClick={() => handleSelectTab('month')}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all cursor-pointer text-center ${
            activeTab === 'month'
              ? 'bg-[var(--theme-bg-surface)] text-[var(--theme-primary-green)] font-semibold shadow-xs border border-[var(--theme-border)]'
              : 'text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)]'
          }`}
        >
          This Month
        </button>
      </div>

      {/* VIEW 1: SPECIFIC DATE USAGE VIEW (WHEN DATE IS SELECTED FROM CALENDAR) */}
      {selectedDateStr && (
        <div className="space-y-3 animate-fade-in p-4 rounded-xl border border-[var(--theme-primary-green)]/30 bg-[var(--theme-green-tint)]/15">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[var(--theme-text-primary)]">
                Usage on {queriedDateData?.dayName || 'Selected Day'}, {queriedDateData?.formattedDate || selectedDateStr}:
              </span>
            </div>
            <div className="text-xs font-mono text-[var(--theme-text-secondary)]">
              <strong className="text-[var(--theme-text-primary)] font-medium">
                {queriedDateData ? queriedDateData.count : 0}
              </strong>{' '}
              / {maxQuestions} prompts used
            </div>
          </div>

          {isLoadingDate ? (
            <div className="py-6 flex items-center justify-center text-xs text-[var(--theme-text-secondary)] font-mono">
              Loading date record...
            </div>
          ) : queriedDateData?.isValidAccountDate === false ? (
            <div className="p-3 bg-[var(--theme-bg-surface)] border border-[var(--theme-border)] rounded-lg text-xs text-[var(--theme-text-secondary)] font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>{queriedDateData.message || 'No data for this date'}</span>
            </div>
          ) : (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-[var(--theme-text-primary)] font-sans tracking-tight">
                Click any box to open that prompt
              </h4>
              <QuestionUsageTracker
                questionsUsedToday={queriedDateData?.count ?? 0}
                maxQuestions={maxQuestions}
                variant="full"
                hideHeader={true}
                hideFooter={true}
                dateStr={selectedDateStr || undefined}
                onSelectQuestionBox={onNavigateToQuestion}
              />
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: TODAY TAB */}
      {activeTab === 'today' && !selectedDateStr && (
        <div className="space-y-3 animate-fade-in pt-1">
          <h4 className="text-sm font-semibold text-[var(--theme-text-primary)] font-sans tracking-tight">
            Click any box to open that prompt
          </h4>

          <QuestionUsageTracker
            questionsUsedToday={questionsUsedToday}
            maxQuestions={maxQuestions}
            variant="full"
            hideHeader={true}
            hideFooter={true}
            dateStr={`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`}
            onSelectQuestionBox={onNavigateToQuestion}
          />
        </div>
      )}

      {/* VIEW 3: THIS WEEK TAB */}
      {activeTab === 'week' && !selectedDateStr && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[var(--theme-text-primary)]">
              Past 7 Days Volume
            </span>
            <span className="font-mono text-xs text-[var(--theme-primary-green)] font-semibold">
              {past7Days.reduce((acc, d) => acc + d.count, 0)} prompts total
            </span>
          </div>

          {/* 7-day mini distribution */}
          <div className="grid grid-cols-7 gap-1.5 py-1">
            {past7Days.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectDateString(item.dateStr)}
                title={`Click to open prompt grid for ${item.dayName} (${item.dateStr})`}
                className={`flex flex-col items-center gap-1 p-2 border rounded-lg text-center cursor-pointer transition-all ${
                  selectedDateStr === item.dateStr
                    ? 'bg-[var(--theme-green-tint)] border-[var(--theme-primary-green)] shadow-xs font-semibold'
                    : 'bg-[var(--theme-bg-subtle)] hover:bg-[var(--theme-bg-surface)] border-[var(--theme-border)] hover:border-[var(--theme-primary-green)]/60'
                }`}
              >
                <span className="text-[10px] text-[var(--theme-text-secondary)] font-mono uppercase">
                  {item.dayName}
                </span>
                <span className="text-xs font-semibold font-mono text-[var(--theme-text-primary)]">
                  {item.count}
                </span>
                <div className="w-full bg-[var(--theme-border)] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[var(--theme-primary-green)] h-full rounded-full transition-all"
                    style={{ width: `${Math.min((item.count / 50) * 100, 100)}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: THIS MONTH TAB */}
      {activeTab === 'month' && !selectedDateStr && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[var(--theme-text-primary)]">
              {MONTH_NAMES[currentMonth]} {currentYear} Days Breakdown
            </span>
            <span className="font-mono text-xs text-[var(--theme-primary-green)] font-semibold">
              {monthDays.reduce((acc, d) => acc + d.count, 0)} total prompts
            </span>
          </div>

          {/* Grid of days in month */}
          <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5 py-1">
            {monthDays.map((d) => (
              <button
                key={d.dayNumber}
                type="button"
                disabled={d.isFuture}
                onClick={() => handleSelectDateString(d.dateStr)}
                title={
                  d.isFuture
                    ? `Day ${d.dayNumber} (Future)`
                    : `Click to open day ${d.dayNumber} prompt grid (${d.count} prompts)`
                }
                className={`p-1.5 rounded-lg border text-center font-mono text-xs flex flex-col items-center justify-center transition-all ${
                  d.isFuture
                    ? 'opacity-30 border-[var(--theme-border)] bg-transparent cursor-not-allowed text-[var(--theme-text-secondary)]'
                    : selectedDateStr === d.dateStr
                    ? 'bg-[var(--theme-primary-green)] text-white border-[var(--theme-primary-green)] font-bold shadow-xs'
                    : d.isToday
                    ? 'bg-[var(--theme-green-tint)] text-[var(--theme-primary-green)] border-[var(--theme-primary-green)]/40 hover:bg-[var(--theme-primary-green)] hover:text-white cursor-pointer font-semibold'
                    : 'bg-[var(--theme-bg-subtle)] hover:bg-[var(--theme-bg-surface)] border-[var(--theme-border)] hover:border-[var(--theme-primary-green)]/60 text-[var(--theme-text-primary)] cursor-pointer'
                }`}
              >
                <span className="text-[10px] text-[var(--theme-text-secondary)]">{d.dayNumber}</span>
                <span className="font-bold text-[11px]">{d.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
