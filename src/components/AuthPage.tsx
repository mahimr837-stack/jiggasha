import React, { useState } from 'react';
import { UserAccount, AppConfig, ColorMode } from '../types';
import { ArrowLeft } from 'lucide-react';
import { ThemeSelector } from './ThemeSelector';
import { getRandomAvatar } from '../data/avatars';
import loginMascotsImg from '../assets/images/login_mascots_banner_1790405307956.jpg';

interface AuthPageProps {
  config: AppConfig;
  currentUser: UserAccount | null;
  onAuthenticate: (user: UserAccount) => void;
  onBackToConfig: () => void;
  colorMode: ColorMode;
  onSelectMode: (mode: ColorMode) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  config,
  currentUser,
  onAuthenticate,
  onBackToConfig,
  colorMode,
  onSelectMode,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState(currentUser?.email || 'mahimr837@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [fullName, setFullName] = useState(currentUser?.name || 'Mahim');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide your credentials to continue.');
      return;
    }
    if (mode === 'signup' && !fullName.trim()) {
      setError('Please provide your name to register.');
      return;
    }
    setError(null);

    const user: UserAccount = {
      email: email.trim(),
      name: mode === 'signup' ? fullName.trim() : (currentUser?.name || fullName.trim() || 'Student'),
      avatarUrl: currentUser?.avatarUrl || getRandomAvatar(),
      collegeName: currentUser?.collegeName,
      hscBoard: currentUser?.hscBoard,
      isAuthenticated: true,
    };

    onAuthenticate(user);
  };

  const handleGoogleLogin = () => {
    setError(null);
    const user: UserAccount = {
      email: currentUser?.email || 'mahimr837@gmail.com',
      name: currentUser?.name || 'Mahim',
      avatarUrl: currentUser?.avatarUrl || getRandomAvatar(),
      collegeName: currentUser?.collegeName,
      hscBoard: currentUser?.hscBoard,
      isAuthenticated: true,
    };
    onAuthenticate(user);
  };

  const handleFacebookLogin = () => {
    setError(null);
    const user: UserAccount = {
      email: 'mahim.fb@facebook.com',
      name: currentUser?.name || 'Mahim',
      avatarUrl: currentUser?.avatarUrl || getRandomAvatar(),
      collegeName: currentUser?.collegeName,
      hscBoard: currentUser?.hscBoard,
      isAuthenticated: true,
    };
    onAuthenticate(user);
  };

  return (
    <div
      data-theme={colorMode}
      className="relative min-h-screen w-screen bg-[var(--theme-bg-app)] flex flex-col justify-between p-5 sm:p-10 select-none text-[var(--theme-text-primary)] transition-colors duration-200"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between w-full max-w-4xl mx-auto">
        <button
          type="button"
          onClick={onBackToConfig}
          className="font-mono text-xs uppercase tracking-wider text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Back to Engine Setup</span>
          <span className="sm:hidden">Back</span>
        </button>

        {/* Mode selection circles */}
        <ThemeSelector currentMode={colorMode} onSelectMode={onSelectMode} />
      </header>

      {/* Main Centered Minimal Form Box */}
      <main className="w-full max-w-sm sm:max-w-md mx-auto my-auto py-6">
        {/* Mascot Banner Image at Top */}
        <div className="mb-5 overflow-hidden rounded-2xl border border-[var(--theme-border)] shadow-xs bg-[var(--theme-bg-surface)]">
          <img
            src={loginMascotsImg}
            alt="ছটু এবং মটু - জিজ্ঞাসা'র সবকিছু এরাই সামলিয়ে রাখে"
            className="w-full h-auto object-cover max-h-56 sm:max-h-64 select-none"
            loading="eager"
          />
        </div>

        {/* Brand Heading & Mode Switcher */}
        <div className="flex flex-col items-center text-center mb-5">
          {/* Mode Switcher: Sign In vs Create Account */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--theme-bg-surface)] border border-[var(--theme-border)] shadow-xs">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`px-3.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-[var(--theme-green-tint)] text-[var(--theme-primary-green)] font-semibold shadow-xs'
                  : 'text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`px-3.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[var(--theme-green-tint)] text-[var(--theme-primary-green)] font-semibold shadow-xs'
                  : 'text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)]'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div className="space-y-1">
              <label
                htmlFor="auth-fullname-input"
                className="block text-[11px] font-mono uppercase tracking-wider text-[var(--theme-text-secondary)]"
              >
                Full Name / নাম
              </label>
              <input
                id="auth-fullname-input"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Mahim"
                className="w-full h-10 px-3.5 bg-[var(--theme-bg-input)] border border-[var(--theme-border)] hover:border-[var(--theme-primary-green)]/40 focus:border-[var(--theme-primary-green)] focus:ring-1 focus:ring-[var(--theme-primary-green)] rounded text-xs sm:text-sm text-[var(--theme-text-primary)] placeholder:text-[var(--theme-text-secondary)]/60 focus:outline-none transition-colors"
              />
            </div>
          )}

          <div className="space-y-1">
            <label
              htmlFor="auth-email-input"
              className="block text-[11px] font-mono uppercase tracking-wider text-[var(--theme-text-secondary)]"
            >
              Email Address / ইমেইল
            </label>
            <input
              id="auth-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
              className="w-full h-10 px-3.5 bg-[var(--theme-bg-input)] border border-[var(--theme-border)] hover:border-[var(--theme-primary-green)]/40 focus:border-[var(--theme-primary-green)] focus:ring-1 focus:ring-[var(--theme-primary-green)] rounded text-xs sm:text-sm text-[var(--theme-text-primary)] placeholder:text-[var(--theme-text-secondary)]/60 focus:outline-none transition-colors font-mono"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="auth-password-input"
              className="block text-[11px] font-mono uppercase tracking-wider text-[var(--theme-text-secondary)]"
            >
              Password / পাসওয়ার্ড
            </label>
            <input
              id="auth-password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full h-10 px-3.5 bg-[var(--theme-bg-input)] border border-[var(--theme-border)] hover:border-[var(--theme-primary-green)]/40 focus:border-[var(--theme-primary-green)] focus:ring-1 focus:ring-[var(--theme-primary-green)] rounded text-xs sm:text-sm text-[var(--theme-text-primary)] placeholder:text-[var(--theme-text-secondary)]/60 focus:outline-none transition-colors font-mono"
            />
          </div>

          {error && (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-lg font-mono">
              {error}
            </div>
          )}

          {/* Primary Submit Button: এগিয়ে যাও */}
          <div className="pt-1.5">
            <button
              type="submit"
              className="w-full h-10 bg-[var(--theme-primary-green)] hover:bg-[var(--theme-primary-green-hover)] text-white rounded-[10px] text-xs sm:text-sm font-medium flex items-center justify-center transition-colors shadow-xs cursor-pointer"
            >
              <span>{mode === 'signin' ? 'এগিয়ে যাও' : 'একাউন্ট তৈরি করুন ও এগিয়ে যাও'}</span>
            </button>
          </div>
        </form>

        {/* Minimal Divider: "অথবা," */}
        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--theme-border)]" />
          </div>
          <span className="relative px-3 text-xs text-[var(--theme-text-secondary)] font-mono bg-[var(--theme-bg-app)] transition-colors">
            অথবা,
          </span>
        </div>

        {/* Two Social Login Buttons: Facebook & Google */}
        <div className="grid grid-cols-2 gap-3">
          {/* Facebook Login Button */}
          <button
            type="button"
            onClick={handleFacebookLogin}
            className="h-10 px-3 bg-[var(--theme-bg-surface)] hover:bg-[var(--theme-bg-subtle)] border border-[var(--theme-border)] hover:border-[var(--theme-primary-green)]/40 rounded-[10px] text-xs sm:text-sm font-medium text-[var(--theme-text-primary)] flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {/* Facebook authentic logo */}
            <svg
              className="w-4 h-4 fill-[#1877F2] flex-shrink-0"
              viewBox="0 0 24 24"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Facebook</span>
          </button>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="h-10 px-3 bg-[var(--theme-bg-surface)] hover:bg-[var(--theme-bg-subtle)] border border-[var(--theme-border)] hover:border-[var(--theme-primary-green)]/40 rounded-[10px] text-xs sm:text-sm font-medium text-[var(--theme-text-primary)] flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {/* Google authentic 4-color logo */}
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google</span>
          </button>
        </div>

        {/* Engine status indicator chip at bottom */}
        <div className="mt-8 flex items-center justify-between text-[11px] text-[var(--theme-text-secondary)] font-mono px-1">
          <span>Model: {config.model}</span>
          <button
            type="button"
            onClick={onBackToConfig}
            className="hover:text-[var(--theme-primary-green)] underline cursor-pointer transition-colors"
          >
            Change
          </button>
        </div>
      </main>
    </div>
  );
};
