/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WorkspaceSession, WorkspaceTurn, AppConfig, UserAccount, AppView, ColorMode, SavedQuestion } from './types';
import { TopConfigBar } from './components/TopConfigBar';
import { Sidebar } from './components/Sidebar';
import { Workspace } from './components/Workspace';
import { ProviderSetupPage } from './components/ProviderSetupPage';
import { AuthPage } from './components/AuthPage';
import { ProfilePage } from './components/ProfilePage';
import { getRandomAvatar } from './data/avatars';
import { TEXTBOOK_CORPUS } from './data/textbookCorpus';

const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DEFAULT_SESSION: WorkspaceSession = {
  id: 'session-kinematics-1',
  title: 'Kinematics & Projectile Range',
  subject: 'Physics 1st Paper',
  createdAt: Date.now() - 1000 * 60 * 30,
  updatedAt: Date.now() - 1000 * 60 * 30,
  turns: [
    {
      id: 'turn-init-1',
      userQuery: 'A stone is projected at an angle of 30° with an initial velocity of 40 m/s from a cliff of height 20 m. Calculate the time of flight and horizontal range.',
      timestamp: Date.now() - 1000 * 60 * 30,
      status: 'complete',
      response: {
        questionRestatement: 'Projected stone launched from cliff top:\n• Initial velocity: u = 40 m/s\n• Projection angle: θ = 30° above horizontal\n• Launch height: h₀ = 20 m\n• Target unknowns: Time of flight (T) until ground impact, and total horizontal range (X). Take g = 9.8 m/s².',
        solution: '1. Resolve velocity components at origin (cliff edge):\n   u_x = u cos 30° = 40 × (√3 / 2) ≈ 34.64 m/s\n   u_y = u sin 30° = 40 × 0.50 = 20.00 m/s\n\n2. Vertical displacement to ground (y = -20 m):\n   y = u_y · t - ½ g t²\n   -20 = 20 t - 4.9 t²\n   4.9 t² - 20 t - 20 = 0\n\n   Using quadratic formula:\n   t = [20 ± √(20² - 4(4.9)(-20))] / [2 × 4.9]\n   t = [20 ± √(400 + 392)] / 9.8\n   t = [20 + 28.14] / 9.8 ≈ 4.91 s (rejecting negative root)\n\n3. Total horizontal distance from cliff base:\n   X = u_x · t = 34.64 m/s × 4.91 s ≈ 170.08 m.',
        explanation: 'According to Galileo\'s principle of independent orthogonal motions, the horizontal component of velocity remains constant because no horizontal force acts on the stone (ignoring air resistance).\n\nThe vertical motion is governed strictly by uniform gravitational acceleration. The boundary condition y = -20 m dictates the landing moment, wholly independent of the stone\'s horizontal velocity.\n\nAuthoritative Grounding Note: As established in standard textbook mechanics (Galileo\'s Principle of Invariance), calculations must treat the decoupled orthogonal coordinate equations as primary ground truth.',
        sources: [],
      },
      sources: [],
    },
  ],
};

const SECONDARY_SESSION: WorkspaceSession = {
  id: 'session-carnot-2',
  title: 'Carnot Engine Efficiency',
  subject: 'Physics 2nd Paper',
  createdAt: Date.now() - 1000 * 60 * 120,
  updatedAt: Date.now() - 1000 * 60 * 120,
  turns: [
    {
      id: 'turn-carnot-1',
      userQuery: 'A Carnot engine operates between heat reservoirs at 500 K and 300 K. It absorbs 1200 J of heat per cycle. Calculate its efficiency and work done per cycle.',
      timestamp: Date.now() - 1000 * 60 * 120,
      status: 'complete',
      response: {
        questionRestatement: 'Reversible Carnot heat engine operating between two thermal reservoirs:\n• Hot reservoir temperature: T_H = 500 K\n• Cold reservoir temperature: T_C = 300 K\n• Heat absorbed per cycle: Q_H = 1200 J\n• Target unknowns: Thermal efficiency (η) and net work output per cycle (W_net).',
        solution: '1. Theoretical Carnot efficiency:\n   η = 1 - (T_C / T_H)\n   η = 1 - (300 / 500) = 1 - 0.60 = 0.40 (or 40%)\n\n2. Net work performed per cycle:\n   W_net = η · Q_H = 0.40 × 1200 J = 480 J\n\n3. Energy conservation check (Heat rejected to sink):\n   Q_C = Q_H - W_net = 1200 - 480 = 720 J.',
        explanation: 'The Carnot cycle defines the upper thermodynamic limit for any heat engine operating between two given temperatures. By the Second Law of Thermodynamics and Clausius theorem, no engine can be more efficient than a reversible Carnot engine without producing a net decrease in entropy.\n\nAuthoritative Grounding Note: Clausius theorem and the Second Law of Thermodynamics establish this limit strictly for all reversible Carnot cycles.',
        sources: [],
      },
      sources: [],
    },
  ],
};

const getTodayDateKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getInitialDailyUsage = (): number => {
  try {
    const raw = localStorage.getItem('study_workspace_daily_usage');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.date === getTodayDateKey() && typeof parsed.count === 'number') {
        return Math.min(Math.max(parsed.count, 0), 50);
      }
    }
  } catch {
    // ignore
  }
  return 8; // Default initial demo question usage count
};

export default function App() {
  // Navigation Flow: 'provider-setup' -> 'auth' -> 'workspace'
  const [currentView, setCurrentView] = useState<AppView>('provider-setup');

  const [colorMode, setColorMode] = useState<ColorMode>(() => {
    try {
      const saved = localStorage.getItem('study_workspace_color_mode');
      if (saved === 'white' || saved === 'terracotta' || saved === 'dark') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'white';
  });

  useEffect(() => {
    try {
      localStorage.setItem('study_workspace_color_mode', colorMode);
      document.documentElement.setAttribute('data-theme', colorMode);
      document.body.setAttribute('data-theme', colorMode);
      if (colorMode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // ignore
    }
  }, [colorMode]);

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const savedUser = localStorage.getItem('study_workspace_user');
      if (savedUser) return JSON.parse(savedUser);
    } catch {
      // ignore
    }
    return null;
  });

  const [config, setConfig] = useState<AppConfig>(() => {
    try {
      const savedConfig = localStorage.getItem('study_workspace_config');
      if (savedConfig) return JSON.parse(savedConfig);
    } catch {
      // ignore
    }
    return {
      provider: 'Gemini',
      model: 'gemini-3.8-flash',
      customApiKey: '',
      hasServerKey: true,
    };
  });

  const [sessions, setSessions] = useState<WorkspaceSession[]>(() => {
    try {
      const saved = localStorage.getItem('study_workspace_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [DEFAULT_SESSION, SECONDARY_SESSION];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessions[0]?.id || DEFAULT_SESSION.id;
  });

  const [availableModels] = useState([
    { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash' },
    { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite' },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [targetTurnId, setTargetTurnId] = useState<string | null>(null);

  // Daily Question Limit & Usage Tracker (0 - 50 questions per day)
  const [questionsUsedToday, setQuestionsUsedToday] = useState<number>(getInitialDailyUsage);

  // Saved Questions State
  const [savedQuestions, setSavedQuestions] = useState<SavedQuestion[]>(() => {
    try {
      const raw = localStorage.getItem('study_workspace_saved_questions');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Save saved questions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('study_workspace_saved_questions', JSON.stringify(savedQuestions));
    } catch {
      // ignore
    }
  }, [savedQuestions]);

  const handleToggleSaveQuestion = (turn: WorkspaceTurn) => {
    const isAlreadySaved = savedQuestions.some(
      (sq) =>
        sq.turnId === turn.id ||
        (turn.response && sq.question === (turn.response.questionRestatement || turn.userQuery))
    );

    if (isAlreadySaved) {
      setSavedQuestions((prev) =>
        prev.filter(
          (sq) =>
            sq.turnId !== turn.id &&
            (turn.response ? sq.question !== (turn.response.questionRestatement || turn.userQuery) : true)
        )
      );
    } else {
      const newSaved: SavedQuestion = {
        id: `saved-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        turnId: turn.id,
        question: turn.response?.questionRestatement || turn.userQuery,
        solution: turn.response?.solution || '',
        explanation: turn.response?.explanation || '',
        savedAt: Date.now(),
      };
      setSavedQuestions((prev) => [newSaved, ...prev]);
    }
  };

  const handleRemoveSavedQuestion = (id: string) => {
    setSavedQuestions((prev) => prev.filter((sq) => sq.id !== id));
  };

  // Save daily usage to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        'study_workspace_daily_usage',
        JSON.stringify({
          date: getTodayDateKey(),
          count: questionsUsedToday,
        })
      );
    } catch {
      // ignore
    }
  }, [questionsUsedToday]);

  // Responsive mobile drawer states
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Save sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('study_workspace_sessions', JSON.stringify(sessions));
    } catch {
      // ignore
    }
  }, [sessions]);

  // Save config to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('study_workspace_config', JSON.stringify(config));
    } catch {
      // ignore
    }
  }, [config]);

  // Save user to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('study_workspace_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('study_workspace_user');
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  // Check server configuration
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setConfig((prev) => ({
            ...prev,
            hasServerKey: !!data.hasServerKey,
            model: prev.model || data.model || 'gemini-3.8-flash',
          }));
        }
      })
      .catch(() => {
        // server-side default intact
      });
  }, []);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setIsMobileSidebarOpen(false);
  };

  const handleNewSession = () => {
    const newSession: WorkspaceSession = {
      id: `session-${Date.now()}`,
      title: 'New Study Investigation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      turns: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = sessions.filter((s) => s.id !== id);
    if (remaining.length === 0) {
      const fresh: WorkspaceSession = {
        id: `session-${Date.now()}`,
        title: 'New Study Investigation',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        turns: [],
      };
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
    } else {
      setSessions(remaining);
      if (activeSessionId === id) {
        setActiveSessionId(remaining[0].id);
      }
    }
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: trimmed, updatedAt: Date.now() } : s))
    );
  };

  const handleSolveQuestion = async (queryText: string) => {
    if (!activeSession) return;

    // Check daily limit (50 questions per day max)
    if (questionsUsedToday >= 50) {
      return;
    }

    // Increment question count for every question / follow-up submitted
    setQuestionsUsedToday((prev) => Math.min(prev + 1, 50));

    const newTurnId = `turn-${Date.now()}`;
    const newTurn: WorkspaceTurn = {
      id: newTurnId,
      userQuery: queryText,
      timestamp: Date.now(),
      status: 'generating',
      sources: [],
    };

    // Update session title if this is the first turn
    const isFirstTurn = activeSession.turns.length === 0;
    const computedTitle = isFirstTurn
      ? queryText.slice(0, 32).trim() + (queryText.length > 32 ? '...' : '')
      : activeSession.title;

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSession.id) {
          return {
            ...s,
            title: computedTitle,
            updatedAt: Date.now(),
            turns: [...s.turns, newTurn],
          };
        }
        return s;
      })
    );

    setIsLoading(true);

    try {
      const historyPayload = activeSession.turns
        .filter((t) => t.response)
        .map((t) => ({
          question: t.userQuery,
          answer: t.response?.solution || '',
        }));

      const res = await fetch('/api/study/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: queryText,
          model: config.model,
          customApiKey: config.customApiKey || undefined,
          history: historyPayload,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSession.id) {
            const updatedTurns = s.turns.map((t) => {
              if (t.id === newTurnId) {
                return {
                  ...t,
                  status: 'complete' as const,
                  response: {
                    questionRestatement: data.questionRestatement,
                    solution: data.solution,
                    explanation: data.explanation,
                    sources: data.sources || t.sources,
                  },
                  sources: data.sources || t.sources,
                };
              }
              return t;
            });
            return {
              ...s,
              updatedAt: Date.now(),
              turns: updatedTurns,
            };
          }
          return s;
        })
      );
    } catch (err: unknown) {
      console.error('Error solving question:', err);
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSession.id) {
            const updatedTurns = s.turns.map((t) => {
              if (t.id === newTurnId) {
                return {
                  ...t,
                  status: 'error' as const,
                  error: 'Investigation could not be completed.',
                };
              }
              return t;
            });
            return { ...s, turns: updatedTurns };
          }
          return s;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateTurn = async (turnId: string) => {
    if (!activeSession) return;
    const targetTurn = activeSession.turns.find((t) => t.id === turnId);
    if (!targetTurn) return;

    setIsLoading(true);

    try {
      const res = await fetch('/api/study/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: targetTurn.userQuery,
          model: config.model,
          customApiKey: config.customApiKey || undefined,
        }),
      });

      if (!res.ok) throw new Error('Regeneration request failed');
      const data = await res.json();

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSession.id) {
            const updatedTurns = s.turns.map((t) => {
              if (t.id === turnId) {
                return {
                  ...t,
                  status: 'complete' as const,
                  response: {
                    questionRestatement: data.questionRestatement,
                    solution: data.solution,
                    explanation: data.explanation,
                    sources: data.sources || t.sources,
                  },
                  sources: data.sources || t.sources,
                };
              }
              return t;
            });
            return { ...s, turns: updatedTurns };
          }
          return s;
        })
      );
    } catch (err) {
      console.error('Error during regeneration:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthenticate = (user: UserAccount) => {
    const userWithAvatar: UserAccount = {
      ...user,
      avatarUrl: user.avatarUrl || getRandomAvatar(),
    };
    setCurrentUser(userWithAvatar);
    try {
      localStorage.setItem('study_workspace_user', JSON.stringify(userWithAvatar));
    } catch {
      // ignore
    }
    setCurrentView('workspace');
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('study_workspace_user');
    } catch {
      // ignore
    }
    setCurrentView('auth');
  };

  const handleNavigateToQuestion = (questionNumber: number, dateStr?: string) => {
    const todayStr = getTodayDateKey();
    const isToday = !dateStr || dateStr === todayStr;

    if (isToday) {
      // If navigating today's question
      const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
      if (currentSession && currentSession.turns.length >= questionNumber) {
        const targetTurn = currentSession.turns[questionNumber - 1];
        setActiveSessionId(currentSession.id);
        setTargetTurnId(targetTurn.id);
      } else {
        // Look through all sessions for a matching turn
        const sessionWithTurn = sessions.find((s) => s.turns.some((t) => t.id === `turn-${todayStr}-${questionNumber}`));
        if (sessionWithTurn) {
          setActiveSessionId(sessionWithTurn.id);
          setTargetTurnId(`turn-${todayStr}-${questionNumber}`);
        } else if (currentSession && currentSession.turns.length > 0) {
          const turnIndex = (questionNumber - 1) % currentSession.turns.length;
          const targetTurn = currentSession.turns[turnIndex] || currentSession.turns[0];
          setActiveSessionId(currentSession.id);
          setTargetTurnId(targetTurn.id);
        } else {
          setActiveSessionId(DEFAULT_SESSION.id);
          setTargetTurnId(DEFAULT_SESSION.turns[0]?.id || 'turn-init-1');
        }
      }
    } else {
      // Past date question: look up or construct historical investigation
      const dateTimestamp = new Date(dateStr).getTime() || Date.now() - 86400000;
      const sessionId = `session-hist-${dateStr}-${questionNumber}`;
      const turnId = `turn-hist-${dateStr}-${questionNumber}`;

      const existingSession = sessions.find((s) => s.id === sessionId);
      if (existingSession) {
        setActiveSessionId(existingSession.id);
        setTargetTurnId(existingSession.turns[0]?.id || turnId);
      } else {
        // Deterministically pick syllabus topic from textbook corpus
        const moduleIndex = (questionNumber + dateStr.length) % TEXTBOOK_CORPUS.length;
        const corpusModule = TEXTBOOK_CORPUS[moduleIndex] || TEXTBOOK_CORPUS[0];
        const sol = corpusModule.sources.find((s) => s.type === 'worked_solution')?.excerpt || 'Follow standard coordinate resolution.';
        const exp = corpusModule.sources.find((s) => s.type === 'explanation')?.excerpt || 'Authoritative principles apply.';

        const [y, m, d] = dateStr.split('-');
        const dateFormatted = `${MONTH_NAMES_SHORT[parseInt(m, 10) - 1] || m} ${parseInt(d, 10)}, ${y}`;

        const newHistoricalSession: WorkspaceSession = {
          id: sessionId,
          title: `${corpusModule.topic} (${dateFormatted} · Q${questionNumber})`,
          subject: corpusModule.subject,
          createdAt: dateTimestamp,
          updatedAt: dateTimestamp,
          turns: [
            {
              id: turnId,
              userQuery: corpusModule.defaultProblemPrompt,
              timestamp: dateTimestamp,
              status: 'complete',
              response: {
                questionRestatement: `Historical Investigation from ${dateFormatted} (Question #${questionNumber}):\n"${corpusModule.defaultProblemPrompt}".\nGrounded against authoritative syllabus material: ${corpusModule.subject}.`,
                solution: sol,
                explanation: exp,
                sources: corpusModule.sources,
              },
              sources: corpusModule.sources,
            },
          ],
        };

        setSessions((prev) => [newHistoricalSession, ...prev]);
        setActiveSessionId(sessionId);
        setTargetTurnId(turnId);
      }
    }

    // Switch view to workspace instantly
    setCurrentView('workspace');
  };

  // STEP 1: Provider, API Key, Model Setup Page
  if (currentView === 'provider-setup') {
    return (
      <ProviderSetupPage
        config={config}
        onSaveConfig={(updated) => setConfig(updated)}
        onNext={() => setCurrentView('auth')}
        colorMode={colorMode}
        onSelectMode={setColorMode}
      />
    );
  }

  // STEP 2: Sign In / Sign Up Page
  if (currentView === 'auth') {
    return (
      <AuthPage
        config={config}
        currentUser={currentUser}
        onAuthenticate={handleAuthenticate}
        onBackToConfig={() => setCurrentView('provider-setup')}
        colorMode={colorMode}
        onSelectMode={setColorMode}
      />
    );
  }

  // STEP 3: Profile Page
  if (currentView === 'profile') {
    return (
      <ProfilePage
        currentUser={
          currentUser || {
            email: 'mahimr837@gmail.com',
            name: 'Student Researcher',
            avatarUrl: getRandomAvatar(),
            collegeName: 'Notre Dame College, Dhaka',
            hscBoard: 'Dhaka',
            isAuthenticated: true,
          }
        }
        questionsUsedToday={questionsUsedToday}
        onNavigateToQuestion={handleNavigateToQuestion}
        config={config}
        onUpdateConfig={(partial) => setConfig((prev) => ({ ...prev, ...partial }))}
        availableModels={availableModels}
        onOpenProviderSetup={() => setCurrentView('provider-setup')}
        savedQuestions={savedQuestions}
        onRemoveSavedQuestion={handleRemoveSavedQuestion}
        onUpdateUser={(updated) => {
          setCurrentUser(updated);
          try {
            localStorage.setItem('study_workspace_user', JSON.stringify(updated));
          } catch {
            // ignore
          }
        }}
        onBackToWorkspace={() => setCurrentView('workspace')}
        colorMode={colorMode}
        onSelectMode={setColorMode}
      />
    );
  }

  // STEP 4: Main Workspace Page
  return (
    <div data-theme={colorMode} className="flex flex-col h-screen w-screen bg-[var(--theme-bg-app)] text-[var(--theme-text-primary)] antialiased overflow-hidden select-text">
      {/* 1. TOP CONFIGURATION BAR */}
      <TopConfigBar
        isMobileSidebarOpen={isMobileSidebarOpen}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        colorMode={colorMode}
        onSelectMode={setColorMode}
        onOpenProfile={() => setCurrentView('profile')}
      />

      {/* Main 2-Column Workspace Frame */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 2. LEFT SIDEBAR */}
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          currentUser={currentUser}
          colorMode={colorMode}
          onSelectMode={setColorMode}
          questionsUsedToday={questionsUsedToday}
          onOpenProfile={() => setCurrentView('profile')}
          onNavigateToQuestion={handleNavigateToQuestion}
        />

        {/* 3. MAIN WORKSPACE */}
        <Workspace
          turns={activeSession?.turns || []}
          onSubmitQuestion={handleSolveQuestion}
          onRegenerateTurn={handleRegenerateTurn}
          isLoading={isLoading}
          onSelectSample={(sampleText) => handleSolveQuestion(sampleText)}
          questionsUsedToday={questionsUsedToday}
          currentUser={currentUser}
          targetTurnId={targetTurnId}
          onNavigateToQuestion={handleNavigateToQuestion}
          savedQuestions={savedQuestions}
          onToggleSaveQuestion={handleToggleSaveQuestion}
        />
      </div>
    </div>
  );
}
