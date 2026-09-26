import React, { useState, useRef } from 'react';
import { UserAccount, ColorMode, AppConfig, SavedQuestion } from '../types';
import { ThemeSelector } from './ThemeSelector';
import { PRESET_AVATARS, isPresetAvatar } from '../data/avatars';
import { ProfileUsageTracker } from './ProfileUsageTracker';
import {
  ArrowLeft,
  Camera,
  Check,
  Edit2,
  X,
  Lock,
  School,
  GraduationCap,
  LifeBuoy,
  Send,
  Trash2,
  AlertCircle,
  User,
  Cpu,
  Key,
  ChevronDown,
  RotateCcw,
  Bookmark,
  Copy,
  ChevronRight,
} from 'lucide-react';

interface ProfilePageProps {
  currentUser: UserAccount | null;
  onUpdateUser: (updatedUser: UserAccount) => void;
  onBackToWorkspace: () => void;
  colorMode: ColorMode;
  onSelectMode: (mode: ColorMode) => void;
  questionsUsedToday?: number;
  onNavigateToQuestion?: (questionNumber: number, dateStr?: string) => void;
  config?: AppConfig;
  onUpdateConfig?: (partial: Partial<AppConfig>) => void;
  availableModels?: { id: string; name: string }[];
  onOpenProviderSetup?: () => void;
  savedQuestions?: SavedQuestion[];
  onRemoveSavedQuestion?: (id: string) => void;
  onOpenSavedQuestion?: (saved: SavedQuestion) => void;
}

const HSC_BOARDS = [
  'Dhaka',
  'Rajshahi',
  'Comilla',
  'Jessore',
  'Chittagong',
  'Barisal',
  'Sylhet',
  'Dinajpur',
  'Mymensingh',
  'Madrasah',
  'Technical',
];

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  onUpdateUser,
  onBackToWorkspace,
  colorMode,
  onSelectMode,
  questionsUsedToday = 8,
  onNavigateToQuestion,
  config = { provider: 'Gemini', model: 'gemini-3.8-flash', customApiKey: '', hasServerKey: true },
  onUpdateConfig,
  availableModels = [
    { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash' },
    { id: 'gemini-3.7-pro', name: 'Gemini 3.7 Pro' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  ],
  onOpenProviderSetup,
  savedQuestions = [],
  onRemoveSavedQuestion,
  onOpenSavedQuestion,
}) => {
  // Fallback defaults if currentUser was not yet initialized
  const email = currentUser?.email || 'mahimr837@gmail.com';
  const currentName = currentUser?.name || 'Student Researcher';
  const currentAvatar = currentUser?.avatarUrl || '';
  const currentCollege = currentUser?.collegeName || 'Notre Dame College, Dhaka';
  const currentBoard = currentUser?.hscBoard || 'Dhaka';

  // Saved Questions Modal State
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [copiedSavedId, setCopiedSavedId] = useState<string | null>(null);

  const handleCopySaved = (sq: SavedQuestion) => {
    const text = `Question: ${sq.question}\n\nSolution:\n${sq.solution}\n\nExplanation:\n${sq.explanation}`;
    navigator.clipboard.writeText(text);
    setCopiedSavedId(sq.id);
    setTimeout(() => setCopiedSavedId(null), 2000);
  };

  // AI Config State
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [keyInput, setKeyInput] = useState(config.customApiKey);
  const [keySavedSuccess, setKeySavedSuccess] = useState(false);

  const handleSaveKey = () => {
    if (onUpdateConfig) {
      onUpdateConfig({ customApiKey: keyInput.trim() });
    }
    setIsEditingKey(false);
    setKeySavedSuccess(true);
    setTimeout(() => setKeySavedSuccess(false), 2500);
  };

  const handleResetKey = () => {
    setKeyInput('');
    if (onUpdateConfig) {
      onUpdateConfig({ customApiKey: '' });
    }
    setIsEditingKey(false);
    setKeySavedSuccess(true);
    setTimeout(() => setKeySavedSuccess(false), 2500);
  };

  // 1. Profile Picture State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarSavedSuccess, setAvatarSavedSuccess] = useState(false);

  // 2. Name State
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(currentName);
  const [nameSavedSuccess, setNameSavedSuccess] = useState(false);

  // 3. Change Password State
  const [isPasswordExpanded, setIsPasswordExpanded] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // 4. College Name State
  const [isEditingCollege, setIsEditingCollege] = useState(false);
  const [collegeInput, setCollegeInput] = useState(currentCollege);
  const [collegeSavedSuccess, setCollegeSavedSuccess] = useState(false);

  // 5. HSC Board State
  const [isEditingBoard, setIsEditingBoard] = useState(false);
  const [boardSelect, setBoardSelect] = useState(currentBoard);
  const [boardSavedSuccess, setBoardSavedSuccess] = useState(false);

  // 6. Support Modal State
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSentSuccess, setSupportSentSuccess] = useState(false);

  // Helper to extract initials
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return 'S';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Handle Select Preset Avatar
  const handleSelectPresetAvatar = (avatarSrc: string) => {
    onUpdateUser({
      ...(currentUser || { email, isAuthenticated: true }),
      email,
      name: currentName,
      avatarUrl: avatarSrc,
      collegeName: currentCollege,
      hscBoard: currentBoard,
      isAuthenticated: true,
    });
    setIsAvatarModalOpen(false);
    setAvatarSavedSuccess(true);
    setTimeout(() => setAvatarSavedSuccess(false), 2500);
  };

  // Handle Photo Upload
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read as base64 data URL
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        onUpdateUser({
          ...(currentUser || { email, isAuthenticated: true }),
          email,
          name: currentName,
          avatarUrl: result,
          collegeName: currentCollege,
          hscBoard: currentBoard,
          isAuthenticated: true,
        });
        setAvatarSavedSuccess(true);
        setTimeout(() => setAvatarSavedSuccess(false), 2500);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateUser({
      ...(currentUser || { email, isAuthenticated: true }),
      email,
      name: currentName,
      avatarUrl: '',
      collegeName: currentCollege,
      hscBoard: currentBoard,
      isAuthenticated: true,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle Save Name
  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;

    onUpdateUser({
      ...(currentUser || { email, isAuthenticated: true }),
      email,
      name: trimmed,
      avatarUrl: currentAvatar,
      collegeName: currentCollege,
      hscBoard: currentBoard,
      isAuthenticated: true,
    });
    setIsEditingName(false);
    setNameSavedSuccess(true);
    setTimeout(() => setNameSavedSuccess(false), 2500);
  };

  // Handle Update Password
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    // Success simulation
    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => {
      setPasswordSuccess(false);
      setIsPasswordExpanded(false);
    }, 2200);
  };

  // Handle Save College
  const handleSaveCollege = () => {
    const trimmed = collegeInput.trim();
    if (!trimmed) return;

    onUpdateUser({
      ...(currentUser || { email, isAuthenticated: true }),
      email,
      name: currentName,
      avatarUrl: currentAvatar,
      collegeName: trimmed,
      hscBoard: currentBoard,
      isAuthenticated: true,
    });
    setIsEditingCollege(false);
    setCollegeSavedSuccess(true);
    setTimeout(() => setCollegeSavedSuccess(false), 2500);
  };

  // Handle Save Board
  const handleSaveBoard = () => {
    onUpdateUser({
      ...(currentUser || { email, isAuthenticated: true }),
      email,
      name: currentName,
      avatarUrl: currentAvatar,
      collegeName: currentCollege,
      hscBoard: boardSelect,
      isAuthenticated: true,
    });
    setIsEditingBoard(false);
    setBoardSavedSuccess(true);
    setTimeout(() => setBoardSavedSuccess(false), 2500);
  };

  // Handle Support Form Submit
  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportSubject.trim() || !supportMessage.trim()) return;

    setSupportSentSuccess(true);
    setTimeout(() => {
      setSupportSentSuccess(false);
      setIsSupportModalOpen(false);
      setSupportSubject('');
      setSupportMessage('');
    }, 2000);
  };

  return (
    <div
      data-theme={colorMode}
      className="min-h-screen w-screen bg-[var(--theme-bg-app)] text-[var(--theme-text-primary)] font-sans flex flex-col transition-colors duration-200"
    >
      {/* Top Header Bar */}
      <header className="h-13 border-b border-[var(--theme-border)] bg-[var(--theme-bg-surface)] px-4 sm:px-8 flex items-center justify-between text-xs select-none transition-colors duration-200">
        <button
          type="button"
          onClick={onBackToWorkspace}
          className="flex items-center gap-1.5 text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors cursor-pointer py-1.5 px-2 rounded-lg hover:bg-[var(--theme-bg-subtle)]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium text-xs">Back to Workspace</span>
        </button>

        <div className="flex items-center gap-3">
          <ThemeSelector currentMode={colorMode} onSelectMode={onSelectMode} size="sm" />
        </div>
      </header>

      {/* Main Profile Content Area */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-xl w-full mx-auto space-y-4">
          {/* SECTION 1: PROFILE PICTURE */}
          <div className="border border-[var(--theme-border)] rounded-xl p-6 bg-[var(--theme-bg-surface)] shadow-xs flex flex-col items-center justify-center text-center transition-colors duration-200">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoSelect}
              accept="image/*"
              className="hidden"
              aria-label="Upload profile photo"
            />

            <div className="relative group">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Click to upload custom photo"
                className="w-22 h-22 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-[var(--theme-border)] hover:border-[var(--theme-primary-green)] transition-all cursor-pointer flex items-center justify-center relative focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-green)]"
              >
                {currentAvatar ? (
                  <img
                    src={currentAvatar}
                    alt={currentName}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full bg-[var(--theme-green-tint)] flex items-center justify-center text-[var(--theme-primary-green)] font-bold text-2xl tracking-wider select-none">
                    {getInitials(currentName)}
                  </div>
                )}

                {/* Hover overlay with camera icon */}
                <div className="absolute inset-0 bg-black/45 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] font-medium tracking-tight">Upload</span>
                </div>
              </button>

              {/* Remove photo button if avatar is set */}
              {currentAvatar && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  title="Remove picture"
                  className="absolute -top-1 -right-1 p-1 bg-[var(--theme-bg-surface)] border border-[var(--theme-border)] text-[var(--theme-text-secondary)] hover:text-rose-600 rounded-full shadow-xs cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Change Avatar action & confirmation badge */}
            <div className="flex flex-col items-center gap-1.5 mt-3">
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="text-xs font-medium text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] bg-[var(--theme-bg-subtle)] hover:bg-[var(--theme-border)]/50 border border-[var(--theme-border)] px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Change Avatar</span>
              </button>

              {avatarSavedSuccess && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--theme-primary-green)] bg-[var(--theme-green-tint)] px-2 py-0.5 rounded-full">
                  <Check className="w-3 h-3" />
                  Saved
                </span>
              )}
            </div>

            <p className="mt-2 text-xs text-[var(--theme-text-secondary)]">
              Click photo to upload a custom picture (PNG, JPG)
            </p>
          </div>

          {/* SECTION 2: NAME */}
          <div className="border border-[var(--theme-border)] rounded-xl p-4 sm:p-5 bg-[var(--theme-bg-surface)] shadow-xs transition-colors duration-200">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--theme-text-secondary)]">
                Name
              </span>
              {nameSavedSuccess && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--theme-primary-green)] bg-[var(--theme-green-tint)] px-2 py-0.5 rounded-full">
                  <Check className="w-3 h-3" />
                  Saved
                </span>
              )}
            </div>

            {isEditingName ? (
              <div className="space-y-2 mt-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Enter full name"
                  autoFocus
                  className="w-full h-10 px-3 bg-[var(--theme-bg-input)] border border-[var(--theme-border)] focus:border-[var(--theme-primary-green)] focus:ring-1 focus:ring-[var(--theme-primary-green)] rounded-lg text-sm text-[var(--theme-text-primary)] focus:outline-none transition-colors"
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setNameInput(currentName);
                      setIsEditingName(false);
                    }}
                    className="h-8 px-3 rounded-lg border border-[var(--theme-border)] text-xs text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-bg-subtle)] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveName}
                    disabled={!nameInput.trim()}
                    className="h-8 px-3.5 bg-[var(--theme-primary-green)] hover:bg-[var(--theme-primary-green-hover)] text-white rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 pt-0.5">
                <div className="text-sm sm:text-base font-medium text-[var(--theme-text-primary)]">
                  {currentName}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNameInput(currentName);
                    setIsEditingName(true);
                  }}
                  className="flex items-center gap-1 text-xs text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary-green)] py-1 px-2.5 rounded-lg border border-[var(--theme-border)] hover:border-[var(--theme-primary-green)]/40 bg-[var(--theme-bg-subtle)] transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>
            )}
          </div>

          {/* SECTION 3: CHANGE PASSWORD */}
          <div className="border border-[var(--theme-border)] rounded-xl p-4 sm:p-5 bg-[var(--theme-bg-surface)] shadow-xs transition-colors duration-200">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[var(--theme-text-secondary)]" />
                <div className="text-sm font-medium text-[var(--theme-text-primary)]">
                  Change Password
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsPasswordExpanded(!isPasswordExpanded);
                  setPasswordError(null);
                }}
                className="h-8 px-3 rounded-lg border border-[var(--theme-border)] hover:border-[var(--theme-primary-green)]/50 text-xs font-medium text-[var(--theme-text-primary)] bg-[var(--theme-bg-subtle)] transition-colors cursor-pointer"
              >
                {isPasswordExpanded ? 'Close' : 'Change'}
              </button>
            </div>

            {isPasswordExpanded && (
              <form onSubmit={handleUpdatePassword} className="mt-4 pt-4 border-t border-[var(--theme-border)] space-y-3">
                <div className="space-y-1">
                  <label
                    htmlFor="current-password-input"
                    className="block text-[11px] font-mono uppercase tracking-wider text-[var(--theme-text-secondary)]"
                  >
                    Current Password
                  </label>
                  <input
                    id="current-password-input"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full h-9 px-3 bg-[var(--theme-bg-input)] border border-[var(--theme-border)] focus:border-[var(--theme-primary-green)] focus:ring-1 focus:ring-[var(--theme-primary-green)] rounded-lg text-xs font-mono text-[var(--theme-text-primary)] focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="new-password-input"
                    className="block text-[11px] font-mono uppercase tracking-wider text-[var(--theme-text-secondary)]"
                  >
                    New Password
                  </label>
                  <input
                    id="new-password-input"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full h-9 px-3 bg-[var(--theme-bg-input)] border border-[var(--theme-border)] focus:border-[var(--theme-primary-green)] focus:ring-1 focus:ring-[var(--theme-primary-green)] rounded-lg text-xs font-mono text-[var(--theme-text-primary)] focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="confirm-password-input"
                    className="block text-[11px] font-mono uppercase tracking-wider text-[var(--theme-text-secondary)]"
                  >
                    Confirm New Password
                  </label>
                  <input
                    id="confirm-password-input"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full h-9 px-3 bg-[var(--theme-bg-input)] border border-[var(--theme-border)] focus:border-[var(--theme-primary-green)] focus:ring-1 focus:ring-[var(--theme-primary-green)] rounded-lg text-xs font-mono text-[var(--theme-text-primary)] focus:outline-none transition-colors"
                  />
                </div>

                {/* Validation error in Terracotta color strictly */}
                {passwordError && (
                  <div className="p-2.5 rounded-lg bg-[var(--theme-terracotta-tint)] border border-[var(--theme-terracotta)]/40 text-[var(--theme-terracotta)] text-xs flex items-center gap-1.5 font-sans">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {/* Success state */}
                {passwordSuccess && (
                  <div className="p-2.5 rounded-lg bg-[var(--theme-green-tint)] border border-[var(--theme-green-tint-border)] text-[var(--theme-primary-green)] text-xs flex items-center gap-1.5 font-medium">
                    <Check className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Password updated successfully!</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPasswordExpanded(false);
                      setPasswordError(null);
                    }}
                    className="h-8 px-3 rounded-lg border border-[var(--theme-border)] text-xs text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-bg-subtle)] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-8 px-3.5 bg-[var(--theme-primary-green)] hover:bg-[var(--theme-primary-green-hover)] text-white rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* SECTION 4: COLLEGE NAME */}
          <div className="border border-[var(--theme-border)] rounded-xl p-4 sm:p-5 bg-[var(--theme-bg-surface)] shadow-xs transition-colors duration-200">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--theme-text-secondary)]">
                College Name
              </span>
              {collegeSavedSuccess && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--theme-primary-green)] bg-[var(--theme-green-tint)] px-2 py-0.5 rounded-full">
                  <Check className="w-3 h-3" />
                  Saved
                </span>
              )}
            </div>

            {isEditingCollege ? (
              <div className="space-y-2 mt-2">
                <div className="relative">
                  <input
                    type="text"
                    value={collegeInput}
                    onChange={(e) => setCollegeInput(e.target.value)}
                    placeholder="e.g. Notre Dame College, Dhaka"
                    autoFocus
                    className="w-full h-10 px-3 bg-[var(--theme-bg-input)] border border-[var(--theme-border)] focus:border-[var(--theme-primary-green)] focus:ring-1 focus:ring-[var(--theme-primary-green)] rounded-lg text-sm text-[var(--theme-text-primary)] focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCollegeInput(currentCollege);
                      setIsEditingCollege(false);
                    }}
                    className="h-8 px-3 rounded-lg border border-[var(--theme-border)] text-xs text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-bg-subtle)] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCollege}
                    disabled={!collegeInput.trim()}
                    className="h-8 px-3.5 bg-[var(--theme-primary-green)] hover:bg-[var(--theme-primary-green-hover)] text-white rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 pt-0.5">
                <div className="flex items-center gap-2.5">
                  <School className="w-4 h-4 text-[var(--theme-text-secondary)] flex-shrink-0" />
                  <span className="text-sm font-medium text-[var(--theme-text-primary)]">
                    {currentCollege}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCollegeInput(currentCollege);
                    setIsEditingCollege(true);
                  }}
                  className="flex items-center gap-1 text-xs text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary-green)] py-1 px-2.5 rounded-lg border border-[var(--theme-border)] hover:border-[var(--theme-primary-green)]/40 bg-[var(--theme-bg-subtle)] transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>
            )}
          </div>

          {/* SECTION 5: HSC BOARD */}
          <div className="border border-[var(--theme-border)] rounded-xl p-4 sm:p-5 bg-[var(--theme-bg-surface)] shadow-xs transition-colors duration-200">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--theme-text-secondary)]">
                HSC Board
              </span>
              {boardSavedSuccess && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--theme-primary-green)] bg-[var(--theme-green-tint)] px-2 py-0.5 rounded-full">
                  <Check className="w-3 h-3" />
                  Saved
                </span>
              )}
            </div>

            {isEditingBoard ? (
              <div className="space-y-2 mt-2">
                <select
                  value={boardSelect}
                  onChange={(e) => setBoardSelect(e.target.value)}
                  className="w-full h-10 px-3 bg-[var(--theme-bg-input)] border border-[var(--theme-border)] hover:border-[var(--theme-primary-green)]/50 focus:border-[var(--theme-primary-green)] focus:ring-1 focus:ring-[var(--theme-primary-green)] rounded-lg text-sm text-[var(--theme-text-primary)] focus:outline-none transition-colors cursor-pointer"
                >
                  {HSC_BOARDS.map((board) => (
                    <option key={board} value={board}>
                      {board} Board
                    </option>
                  ))}
                </select>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setBoardSelect(currentBoard);
                      setIsEditingBoard(false);
                    }}
                    className="h-8 px-3 rounded-lg border border-[var(--theme-border)] text-xs text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-bg-subtle)] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveBoard}
                    className="h-8 px-3.5 bg-[var(--theme-primary-green)] hover:bg-[var(--theme-primary-green-hover)] text-white rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 pt-0.5">
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="w-4 h-4 text-[var(--theme-text-secondary)] flex-shrink-0" />
                  <span className="text-sm font-medium text-[var(--theme-text-primary)]">
                    {currentBoard} Board
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setBoardSelect(currentBoard);
                    setIsEditingBoard(true);
                  }}
                  className="flex items-center gap-1 text-xs text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary-green)] py-1 px-2.5 rounded-lg border border-[var(--theme-border)] hover:border-[var(--theme-primary-green)]/40 bg-[var(--theme-bg-subtle)] transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>
            )}
          </div>

          {/* SECTION: AI ENGINE & MODEL CONFIGURATION */}
          <div className="border border-[var(--theme-border)] rounded-xl p-4 sm:p-5 bg-[var(--theme-bg-surface)] shadow-xs transition-colors duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--theme-border)]">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[var(--theme-primary-green)]" />
                <h3 className="text-sm font-semibold text-[var(--theme-text-primary)]">
                  AI Engine & Model
                </h3>
              </div>
              {keySavedSuccess && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--theme-primary-green)] bg-[var(--theme-green-tint)] px-2 py-0.5 rounded-full">
                  <Check className="w-3 h-3" />
                  Saved
                </span>
              )}
            </div>

            {/* 1. Provider */}
            <div className="flex items-center justify-between gap-3 pt-0.5">
              <div>
                <span className="block text-[11px] font-mono uppercase tracking-wider text-[var(--theme-text-secondary)]">
                  Provider
                </span>
                <span className="text-sm font-medium text-[var(--theme-text-primary)]">
                  {config.provider}
                </span>
              </div>
              {onOpenProviderSetup && (
                <button
                  type="button"
                  onClick={onOpenProviderSetup}
                  className="flex items-center gap-1 text-xs text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary-green)] py-1 px-2.5 rounded-lg border border-[var(--theme-border)] hover:border-[var(--theme-primary-green)]/40 bg-[var(--theme-bg-subtle)] transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Change</span>
                </button>
              )}
            </div>

            {/* 2. Model Selection */}
            <div className="space-y-1.5 pt-2 border-t border-[var(--theme-border)]">
              <span className="block text-[11px] font-mono uppercase tracking-wider text-[var(--theme-text-secondary)]">
                Active Model
              </span>
              <div className="relative">
                <select
                  value={config.model}
                  onChange={(e) => onUpdateConfig && onUpdateConfig({ model: e.target.value })}
                  aria-label="Select active model"
                  className="w-full h-10 pl-3 pr-8 bg-[var(--theme-bg-input)] border border-[var(--theme-border)] hover:border-[var(--theme-primary-green)]/50 focus:border-[var(--theme-primary-green)] focus:ring-1 focus:ring-[var(--theme-primary-green)] rounded-lg text-sm text-[var(--theme-text-primary)] focus:outline-none transition-colors cursor-pointer appearance-none"
                >
                  {availableModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[var(--theme-text-secondary)] absolute right-2.5 top-3 pointer-events-none" />
              </div>
            </div>

            {/* 3. API Key */}
            <div className="space-y-1.5 pt-2 border-t border-[var(--theme-border)]">
              <div className="flex items-center justify-between">
                <span className="block text-[11px] font-mono uppercase tracking-wider text-[var(--theme-text-secondary)]">
                  API Key
                </span>
                {!isEditingKey && (
                  <button
                    type="button"
                    onClick={() => {
                      setKeyInput(config.customApiKey);
                      setIsEditingKey(true);
                    }}
                    className="flex items-center gap-1 text-xs text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary-green)] py-1 px-2.5 rounded-lg border border-[var(--theme-border)] hover:border-[var(--theme-primary-green)]/40 bg-[var(--theme-bg-subtle)] transition-colors cursor-pointer"
                  >
                    <Key className="w-3 h-3" />
                    <span>{config.customApiKey ? 'Change Key' : 'Add Custom Key'}</span>
                  </button>
                )}
              </div>

              {isEditingKey ? (
                <div className="space-y-2 mt-1">
                  <input
                    type="password"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="AIzaSy... (leave blank to use default)"
                    autoFocus
                    className="w-full h-10 px-3 bg-[var(--theme-bg-input)] border border-[var(--theme-border)] focus:border-[var(--theme-primary-green)] focus:ring-1 focus:ring-[var(--theme-primary-green)] rounded-lg font-mono text-xs text-[var(--theme-text-primary)] focus:outline-none transition-colors"
                  />
                  <div className="flex items-center justify-between gap-2 pt-1">
                    {config.customApiKey ? (
                      <button
                        type="button"
                        onClick={handleResetKey}
                        className="text-xs text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset to default</span>
                      </button>
                    ) : <span />}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setKeyInput(config.customApiKey);
                          setIsEditingKey(false);
                        }}
                        className="h-8 px-3 rounded-lg border border-[var(--theme-border)] text-xs text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-bg-subtle)] transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveKey}
                        className="h-8 px-3.5 bg-[var(--theme-primary-green)] hover:bg-[var(--theme-primary-green-hover)] text-white rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer"
                      >
                        Save Key
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs font-mono text-[var(--theme-text-secondary)] bg-[var(--theme-bg-subtle)] px-3 py-2 rounded-lg border border-[var(--theme-border)] truncate">
                  {config.customApiKey
                    ? `Custom Key: ••••••••${config.customApiKey.slice(-4)}`
                    : (config.hasServerKey ? 'Default Server-Configured Gemini Key (Active)' : 'No API key configured')}
                </div>
              )}
            </div>
          </div>

          {/* SECTION 6: QUESTION USAGE TRACKER WITH DATE PICKER & TABS */}
          <ProfileUsageTracker
            questionsUsedToday={questionsUsedToday}
            maxQuestions={50}
            onNavigateToQuestion={onNavigateToQuestion}
          />

          {/* SECTION 7: SAVED QUESTIONS */}
          <div className="border border-[var(--theme-border)] rounded-xl p-4 sm:p-5 bg-[var(--theme-bg-surface)] shadow-xs transition-colors duration-200">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Bookmark className="w-4 h-4 text-[var(--theme-primary-green)] flex-shrink-0" />
                <span className="text-sm font-medium text-[var(--theme-text-primary)]">
                  Saved Questions
                </span>
                {savedQuestions.length > 0 && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[var(--theme-green-tint)] text-[var(--theme-primary-green)] font-medium">
                    {savedQuestions.length}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsSavedModalOpen(true)}
                className="h-8 px-3.5 bg-[var(--theme-primary-green)] hover:bg-[var(--theme-primary-green-hover)] text-white rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Saved Questions</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SECTION 8: SUPPORT */}
          <div className="border border-[var(--theme-border)] rounded-xl p-4 sm:p-5 bg-[var(--theme-bg-surface)] shadow-xs transition-colors duration-200">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <LifeBuoy className="w-4 h-4 text-[var(--theme-text-secondary)] flex-shrink-0" />
                <div className="text-sm font-medium text-[var(--theme-text-primary)]">
                  Support
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSupportModalOpen(true)}
                className="h-8 px-3.5 bg-[var(--theme-primary-green)] hover:bg-[var(--theme-primary-green-hover)] text-white rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Contact</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* SAVED QUESTIONS MODAL */}
      {isSavedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[85vh] flex flex-col bg-[var(--theme-bg-surface)] border border-[var(--theme-border)] rounded-xl shadow-xl overflow-hidden animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[var(--theme-border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[var(--theme-primary-green)]" />
                <h3 className="text-sm font-semibold text-[var(--theme-text-primary)]">
                  Saved Questions
                </h3>
                <span className="text-xs text-[var(--theme-text-secondary)] font-mono">
                  ({savedQuestions.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsSavedModalOpen(false)}
                className="p-1 text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
              {savedQuestions.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <Bookmark className="w-8 h-8 mx-auto text-[var(--theme-text-secondary)]/40 stroke-1" />
                  <p className="text-xs text-[var(--theme-text-secondary)]">
                    No saved questions yet.
                  </p>
                </div>
              ) : (
                savedQuestions.map((sq) => (
                  <div
                    key={sq.id}
                    className="border border-[var(--theme-border)] rounded-xl p-4 bg-[var(--theme-bg-subtle)] space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-sm font-medium text-[var(--theme-text-primary)] leading-relaxed">
                        {sq.question}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopySaved(sq)}
                          title="Copy Answer"
                          className="p-1.5 text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] rounded-lg transition-colors cursor-pointer"
                        >
                          {copiedSavedId === sq.id ? (
                            <Check className="w-3.5 h-3.5 text-[var(--theme-primary-green)]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {onRemoveSavedQuestion && (
                          <button
                            type="button"
                            onClick={() => onRemoveSavedQuestion(sq.id)}
                            title="Remove"
                            className="p-1.5 text-[var(--theme-text-secondary)] hover:text-[var(--theme-terracotta)] rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {sq.solution && (
                      <div className="pt-2 border-t border-[var(--theme-border)]">
                        <span className="block text-[10px] font-mono uppercase tracking-wider text-[var(--theme-text-secondary)] mb-1">
                          Solution
                        </span>
                        <div className="text-xs text-[var(--theme-text-primary)] font-mono bg-[var(--theme-bg-surface)] p-2.5 rounded-lg border border-[var(--theme-border)] whitespace-pre-line leading-relaxed">
                          {sq.solution}
                        </div>
                      </div>
                    )}

                    {sq.explanation && (
                      <div>
                        <span className="block text-[10px] font-mono uppercase tracking-wider text-[var(--theme-text-secondary)] mb-1">
                          Explanation
                        </span>
                        <div className="text-xs text-[var(--theme-text-primary)] bg-[var(--theme-bg-surface)] p-2.5 rounded-lg border border-[var(--theme-border)] whitespace-pre-line leading-relaxed">
                          {sq.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUPPORT MODAL DIALOG */}
      {isSupportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--theme-bg-surface)] border border-[var(--theme-border)] rounded-xl p-5 sm:p-6 shadow-xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-[var(--theme-primary-green)]" />
                <h3 className="text-sm font-semibold text-[var(--theme-text-primary)]">
                  Contact Academic Support
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSupportModalOpen(false)}
                className="p-1 text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {supportSentSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-[var(--theme-green-tint)] text-[var(--theme-primary-green)] flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <div className="text-sm font-medium text-[var(--theme-text-primary)]">
                  Message Sent
                </div>
                <div className="text-xs text-[var(--theme-text-secondary)] max-w-xs mx-auto">
                  Our academic support team has received your inquiry and will reply to <span className="font-mono">{email}</span> shortly.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendSupport} className="space-y-3">
                <div className="space-y-1">
                  <label
                    htmlFor="support-email"
                    className="block text-[11px] font-mono uppercase tracking-wider text-[var(--theme-text-secondary)]"
                  >
                    From
                  </label>
                  <input
                    id="support-email"
                    type="email"
                    value={email}
                    disabled
                    className="w-full h-9 px-3 bg-[var(--theme-bg-subtle)] border border-[var(--theme-border)] rounded-lg text-xs font-mono text-[var(--theme-text-secondary)] cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="support-subject"
                    className="block text-[11px] font-mono uppercase tracking-wider text-[var(--theme-text-secondary)]"
                  >
                    Subject
                  </label>
                  <input
                    id="support-subject"
                    type="text"
                    value={supportSubject}
                    onChange={(e) => setSupportSubject(e.target.value)}
                    placeholder="e.g. Physics question discrepancy or feedback"
                    required
                    className="w-full h-9 px-3 bg-[var(--theme-bg-input)] border border-[var(--theme-border)] focus:border-[var(--theme-primary-green)] focus:ring-1 focus:ring-[var(--theme-primary-green)] rounded-lg text-xs text-[var(--theme-text-primary)] focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="support-message"
                    className="block text-[11px] font-mono uppercase tracking-wider text-[var(--theme-text-secondary)]"
                  >
                    Message
                  </label>
                  <textarea
                    id="support-message"
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="Describe your issue or question..."
                    rows={4}
                    required
                    className="w-full p-3 bg-[var(--theme-bg-input)] border border-[var(--theme-border)] focus:border-[var(--theme-primary-green)] focus:ring-1 focus:ring-[var(--theme-primary-green)] rounded-lg text-xs text-[var(--theme-text-primary)] focus:outline-none transition-colors resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSupportModalOpen(false)}
                    className="h-8 px-3 rounded-lg border border-[var(--theme-border)] text-xs text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-bg-subtle)] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-8 px-4 bg-[var(--theme-primary-green)] hover:bg-[var(--theme-primary-green-hover)] text-white rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* AVATAR SELECTION MODAL */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div
            className="w-full max-w-lg bg-[var(--theme-bg-surface)] border border-[var(--theme-border)] rounded-2xl p-5 sm:p-6 shadow-xl transition-all"
            role="dialog"
            aria-modal="true"
            aria-labelledby="avatar-modal-title"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-[var(--theme-border)]">
              <div>
                <h3
                  id="avatar-modal-title"
                  className="text-base font-semibold text-[var(--theme-text-primary)]"
                >
                  Choose an Avatar
                </h3>
                <p className="text-xs text-[var(--theme-text-secondary)] mt-0.5">
                  Select one of the 12 character avatars for your profile picture
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="p-1.5 text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-bg-subtle)] rounded-lg transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 12 Avatars Grid (6 columns x 2 rows on sm+, responsive on mobile) */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4 py-2">
              {PRESET_AVATARS.map((avatar) => {
                const isSelected = currentAvatar === avatar.src;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => handleSelectPresetAvatar(avatar.src)}
                    className={`group relative flex flex-col items-center justify-center p-1 rounded-xl transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary-green)] ${
                      isSelected
                        ? 'bg-[var(--theme-green-tint)]/60'
                        : 'hover:bg-[var(--theme-bg-subtle)]'
                    }`}
                    title={avatar.name}
                  >
                    <div
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden transition-all duration-200 border border-[var(--theme-border)] ${
                        isSelected
                          ? 'ring-3 ring-[var(--theme-primary-green)] ring-offset-2 ring-offset-[var(--theme-bg-surface)] scale-105 shadow-md'
                          : 'group-hover:scale-105 group-hover:shadow-md'
                      }`}
                    >
                      <img
                        src={avatar.src}
                        alt={avatar.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                          <div className="w-5 h-5 rounded-full bg-[var(--theme-primary-green)] text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-[var(--theme-text-secondary)] group-hover:text-[var(--theme-text-primary)] mt-1.5 font-medium truncate max-w-full text-center">
                      {avatar.gender === 'male' ? 'Male' : 'Female'} P{avatar.pair}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 mt-3 border-t border-[var(--theme-border)]">
              <span className="text-[11px] text-[var(--theme-text-secondary)]">
                Selecting an avatar updates your profile immediately
              </span>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="h-8 px-3.5 rounded-lg border border-[var(--theme-border)] text-xs text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-bg-subtle)] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
