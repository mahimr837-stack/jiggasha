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
import { auth, getUserData, saveUserData } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getRandomAvatar } from './data/avatars';
import { TEXTBOOK_CORPUS } from './data/textbookCorpus';

const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DEFAULT_SESSION: WorkspaceSession = {
  id: 'session-quantum-1',
  title: 'Quantum Computing Overview',
  subject: 'AI Assistant',
  createdAt: Date.now() - 1000 * 60 * 30,
  updatedAt: Date.now() - 1000 * 60 * 30,
  turns: [
    {
      id: 'turn-init-1',
      userQuery: 'Explain quantum computing in simple terms for a general audience.',
      timestamp: Date.now() - 1000 * 60 * 30,
      status: 'complete',
      response: {
        questionRestatement: 'Query: Explain the core concepts of quantum computing simply.',
        solution: 'Quantum computing leverages quantum mechanical principles to process information in ways traditional computers cannot.\n\n1. Qubits vs Bits: Classical bits are either 0 or 1. Qubits can exist in a superposition of both states simultaneously.\n2. Entanglement: Qubits can be interconnected so that the state of one instantly influences another.\n3. Applications: Unlocking rapid optimization, complex molecule simulation, and cryptography.',
        explanation: 'In classical computing, state calculation happens linearly. Quantum superposition allows simultaneous evaluation of vast computational paths.',
        sources: [],
        groundingInfo: {
          googleSearchUsed: true,
          googleMapsUsed: false,
          searchQueries: ['Quantum computing basics explanation'],
          sources: [
            { title: 'Google Search Information Index', url: 'https://www.google.com' },
          ],
          summaryText: 'Verified information via Google Search Grounding.',
        },
      },
      sources: [],
    },
  ],
};

const SECONDARY_SESSION: WorkspaceSession = {
  id: 'session-performance-2',
  title: 'Web Performance Optimization',
  subject: 'Software Engineering',
  createdAt: Date.now() - 1000 * 60 * 120,
  updatedAt: Date.now() - 1000 * 60 * 120,
  turns: [
    {
      id: 'turn-perf-1',
      userQuery: 'What are key strategies for optimizing web application performance?',
      timestamp: Date.now() - 1000 * 60 * 120,
      status: 'complete',
      response: {
        questionRestatement: 'Query: Key strategies for web application performance optimization.',
        solution: '1. Asset Compression & Lazy Loading: Defer offscreen assets and compress images.\n2. Code Splitting & Caching: Leverage browser cache and bundle dynamic imports.\n3. Efficient DOM & Server Rendering: Minimize layout shifts and optimize API payloads.',
        explanation: 'Reducing initial payload size and critical rendering path blockages maximizes First Contentful Paint (FCP) and Time to Interactive (TTI).',
        sources: [],
        groundingInfo: {
          googleSearchUsed: true,
          googleMapsUsed: false,
          searchQueries: ['Web application performance optimization strategies'],
          sources: [
            { title: 'Google Search Index', url: 'https://www.google.com' },
          ],
          summaryText: 'Verified web performance strategies via Google Search Grounding.',
        },
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
      model: 'gemini-3.1-flash-lite',
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
    { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite (Fast & Reliable)' },
    { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash' },
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

  // Firebase Auth State Listener & User Firestore Settings Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const storedData = await getUserData(firebaseUser.uid);
          const savedApiKey = storedData?.apiKey || '';
          const savedProvider = storedData?.provider || 'Gemini';
          const savedModel = storedData?.model || 'gemini-3.6-flash';

          setConfig((prev) => ({
            ...prev,
            provider: savedProvider,
            model: savedModel,
            customApiKey: savedApiKey,
          }));

          const userAccount: UserAccount = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: storedData?.displayName || firebaseUser.displayName || 'User',
            avatarUrl: firebaseUser.photoURL || undefined,
            isAuthenticated: true,
            apiKeySettings: savedApiKey ? {
              provider: savedProvider,
              apiKey: savedApiKey,
              model: savedModel,
            } : undefined,
          };

          setCurrentUser(userAccount);
        } catch (err) {
          console.error('Error fetching user Firestore data:', err);
        }
      } else {
        setCurrentUser(null);
        setConfig((prev) => ({
          ...prev,
          customApiKey: '',
        }));
      }
    });

    return () => unsubscribe();
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
      processingStage: 'searching',
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

    const updateStage = (stage: 'searching' | 'thinking' | 'preparing') => {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSession.id) {
            return {
              ...s,
              turns: s.turns.map((t) => (t.id === newTurnId ? { ...t, processingStage: stage } : t)),
            };
          }
          return s;
        })
      );
    };

    // Fallback timers to ensure smooth state progression if network response is buffered
    const tThinking = setTimeout(() => updateStage('thinking'), 400);
    const tPreparing = setTimeout(() => updateStage('preparing'), 1600);

    try {
      const historyPayload = activeSession.turns
        .filter((t) => t.response)
        .map((t) => ({
          question: t.userQuery,
          answer: t.response?.solution || '',
        }));

      const res = await fetch('/api/study/solve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          question: queryText,
          model: config.model,
          customApiKey: config.customApiKey || undefined,
          history: historyPayload,
          stream: true,
        }),
      });

      if (!res.ok) {
        clearTimeout(tThinking);
        clearTimeout(tPreparing);
        throw new Error(`Server returned status ${res.status}`);
      }

      let data: any = null;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream') && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              try {
                const event = JSON.parse(trimmed.slice(6));
                if (event.type === 'status' && event.stage) {
                  clearTimeout(tThinking);
                  clearTimeout(tPreparing);
                  updateStage(event.stage);
                } else if (event.type === 'complete') {
                  clearTimeout(tThinking);
                  clearTimeout(tPreparing);
                  data = event.data;
                } else if (event.type === 'error') {
                  clearTimeout(tThinking);
                  clearTimeout(tPreparing);
                  throw new Error(event.error || 'Server error');
                }
              } catch (e: any) {
                if (e.message && !e.message.includes('JSON')) {
                  throw e;
                }
              }
            }
          }
        }
      } else {
        data = await res.json();
      }

      clearTimeout(tThinking);
      clearTimeout(tPreparing);

      if (!data) {
        throw new Error('No valid response received');
      }

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
                    groundingInfo: data.groundingInfo,
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
      clearTimeout(tThinking);
      clearTimeout(tPreparing);
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

    // Reset target turn to generating status and clear old response
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSession.id) {
          return {
            ...s,
            turns: s.turns.map((t) =>
              t.id === turnId
                ? {
                    ...t,
                    status: 'generating' as const,
                    processingStage: 'searching' as const,
                    response: undefined,
                  }
                : t
            ),
          };
        }
        return s;
      })
    );

    setIsLoading(true);

    const updateStage = (stage: 'searching' | 'thinking' | 'preparing') => {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSession.id) {
            return {
              ...s,
              turns: s.turns.map((t) => (t.id === turnId ? { ...t, processingStage: stage } : t)),
            };
          }
          return s;
        })
      );
    };

    const tThinking = setTimeout(() => updateStage('thinking'), 400);
    const tPreparing = setTimeout(() => updateStage('preparing'), 1600);

    try {
      const res = await fetch('/api/study/solve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          question: targetTurn.userQuery,
          model: config.model,
          customApiKey: config.customApiKey || undefined,
          stream: true,
        }),
      });

      if (!res.ok) {
        clearTimeout(tThinking);
        clearTimeout(tPreparing);
        throw new Error('Regeneration request failed');
      }

      let data: any = null;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream') && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              try {
                const event = JSON.parse(trimmed.slice(6));
                if (event.type === 'status' && event.stage) {
                  clearTimeout(tThinking);
                  clearTimeout(tPreparing);
                  updateStage(event.stage);
                } else if (event.type === 'complete') {
                  clearTimeout(tThinking);
                  clearTimeout(tPreparing);
                  data = event.data;
                } else if (event.type === 'error') {
                  clearTimeout(tThinking);
                  clearTimeout(tPreparing);
                  throw new Error(event.error || 'Server error');
                }
              } catch (e: any) {
                if (e.message && !e.message.includes('JSON')) {
                  throw e;
                }
              }
            }
          }
        }
      } else {
        data = await res.json();
      }

      clearTimeout(tThinking);
      clearTimeout(tPreparing);

      if (!data) {
        throw new Error('No valid response received');
      }

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
                    groundingInfo: data.groundingInfo,
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
      clearTimeout(tThinking);
      clearTimeout(tPreparing);
      console.error('Error during regeneration:', err);
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSession.id) {
            return {
              ...s,
              turns: s.turns.map((t) =>
                t.id === turnId ? { ...t, status: 'error' as const } : t
              ),
            };
          }
          return s;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthenticate = async (user: UserAccount) => {
    const userWithAvatar: UserAccount = {
      ...user,
      avatarUrl: user.avatarUrl || getRandomAvatar(),
    };
    setCurrentUser(userWithAvatar);
    if (user.uid) {
      try {
        await saveUserData(user.uid, {
          uid: user.uid,
          email: user.email,
          displayName: user.name || 'User',
          ...(user.apiKeySettings ? {
            provider: user.apiKeySettings.provider,
            apiKey: user.apiKeySettings.apiKey,
            model: user.apiKeySettings.model,
          } : {}),
        });
      } catch (err) {
        console.error('Error saving user data on auth:', err);
      }
    }
    setCurrentView('workspace');
  };

  const handleSaveConfig = async (updatedConfig: AppConfig) => {
    setConfig(updatedConfig);
    if (currentUser?.uid) {
      try {
        await saveUserData(currentUser.uid, {
          provider: updatedConfig.provider,
          model: updatedConfig.model,
          apiKey: updatedConfig.customApiKey,
        });
      } catch (err) {
        console.error('Error saving API key config to Firestore:', err);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Error signing out:', err);
    }
    setCurrentUser(null);
    setConfig((prev) => ({ ...prev, customApiKey: '' }));
    try {
      localStorage.removeItem('study_workspace_user');
      localStorage.removeItem('study_workspace_config');
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
        onSaveConfig={handleSaveConfig}
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
        onUpdateConfig={(partial) => {
          const updated = { ...config, ...partial };
          handleSaveConfig(updated);
        }}
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
