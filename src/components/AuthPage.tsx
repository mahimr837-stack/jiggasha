import React, { useState, useEffect } from 'react';
import { UserAccount, AppConfig, ColorMode } from '../types';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ThemeSelector } from './ThemeSelector';
import { getRandomAvatar } from '../data/avatars';
import loginMascotsImg from '../assets/images/login_mascots_banner_1790405307956.jpg';
import { auth, googleProvider, saveUserData, getUserData } from '../firebase';
import {
  signInWithPopup
} from 'firebase/auth';

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
  const [error, setError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  const handleGoogleLogin = async () => {
    setError(null);
    setAuthLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const storedData = await getUserData(firebaseUser.uid);

      const userAccount: UserAccount = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || 'user@gmail.com',
        name: firebaseUser.displayName || storedData?.displayName || 'Google User',
        avatarUrl: firebaseUser.photoURL || getRandomAvatar(),
        isAuthenticated: true,
        apiKeySettings: storedData?.apiKey ? {
          provider: storedData.provider || 'Gemini',
          apiKey: storedData.apiKey,
          model: storedData.model || 'gemini-3.6-flash',
        } : undefined,
      };

      await saveUserData(firebaseUser.uid, {
        uid: firebaseUser.uid,
        email: userAccount.email,
        displayName: userAccount.name,
        createdAt: storedData?.createdAt || new Date().toISOString(),
      });

      onAuthenticate(userAccount);
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google Sign-in failed.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const [fbAppIdInput, setFbAppIdInput] = useState(() => localStorage.getItem('facebook_app_id') || '');
  const [showFbModal, setShowFbModal] = useState(false);
  const [serverFbAppId, setServerFbAppId] = useState<string>('');

  useEffect(() => {
    // Check client env variable or server process secret
    const envFbId = (import.meta as any).env?.VITE_FACEBOOK_APP_ID || '';
    if (envFbId) {
      setServerFbAppId(envFbId);
    }
    fetch('/api/config/auth')
      .then((res) => res.json())
      .then((data) => {
        if (data.facebookAppId) {
          setServerFbAppId(data.facebookAppId);
        }
      })
      .catch(() => {
        // ignore fetch error
      });
  }, []);

  const getEffectiveFbAppId = () => {
    return serverFbAppId || localStorage.getItem('facebook_app_id') || fbAppIdInput.trim();
  };

  const executeFacebookOAuthLogin = async (appIdToUse: string) => {
    setError(null);
    setAuthLoading(true);

    const redirectUri = window.location.origin + '/facebook-callback.html';

    // Standard Facebook Login OAuth 2.0 authorization request
    const params = new URLSearchParams({
      client_id: appIdToUse,
      redirect_uri: redirectUri,
      response_type: 'token',
      scope: 'public_profile,email',
      display: 'popup',
    });

    const oauthUrl = `https://www.facebook.com/v20.0/dialog/oauth?${params.toString()}`;

    const width = 580;
    const height = 680;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;

    const popup = window.open(
      oauthUrl,
      'FacebookLoginPopup',
      `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`
    );

    if (!popup) {
      setError('Popup blocked! Please allow popups for this site and try again.');
      setAuthLoading(false);
      return;
    }

    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'FB_AUTH_SUCCESS' && event.data.token) {
        window.removeEventListener('message', handleMessage);
        try {
          const res = await fetch(
            `https://graph.facebook.com/v20.0/me?fields=id,name,email,picture.type(large)&access_token=${event.data.token}`
          );
          const userInfo = await res.json();
          if (userInfo.id) {
            const user: UserAccount = {
              email: userInfo.email || `${userInfo.id}@facebook.com`,
              name: userInfo.name || 'Facebook User',
              avatarUrl: userInfo.picture?.data?.url || getRandomAvatar(),
              collegeName: currentUser?.collegeName,
              hscBoard: currentUser?.hscBoard,
              isAuthenticated: true,
            };
            onAuthenticate(user);
          } else {
            setError(userInfo.error?.message || 'Could not fetch Facebook profile information.');
          }
        } catch {
          setError('Failed to fetch user details from Facebook Graph API.');
        } finally {
          setAuthLoading(false);
        }
      } else if (event.data?.type === 'FB_AUTH_ERROR') {
        window.removeEventListener('message', handleMessage);
        setError(event.data.error || 'Facebook login was cancelled or failed.');
        setAuthLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);

    // Monitor popup closure
    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        window.removeEventListener('message', handleMessage);
        setAuthLoading(false);
      }
    }, 1000);
  };

  const handleFacebookLogin = async () => {
    const appId = getEffectiveFbAppId();
    if (!appId) {
      setShowFbModal(true);
      return;
    }
    executeFacebookOAuthLogin(appId);
  };

  const handleSaveFbAppId = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = fbAppIdInput.trim();
    if (!cleanId) {
      setError('Please enter a valid Facebook App ID.');
      return;
    }
    localStorage.setItem('facebook_app_id', cleanId);
    setShowFbModal(false);
    executeFacebookOAuthLogin(cleanId);
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

        {/* Error Notice */}
        {error && (
          <div className="mb-4 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-lg font-mono">
            {error}
          </div>
        )}

        {/* Authentication Options */}
        <div className="space-y-3">
          {/* Primary Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={authLoading}
            className="w-full h-11 px-4 bg-[var(--theme-bg-surface)] hover:bg-[var(--theme-bg-subtle)] disabled:opacity-50 border border-[var(--theme-border)] hover:border-[var(--theme-primary-green)]/60 rounded-xl text-xs sm:text-sm font-medium text-[var(--theme-text-primary)] flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xs disabled:cursor-not-allowed"
          >
            {authLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[var(--theme-primary-green)]" />
            ) : (
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
            )}
            <span>Sign in with Google</span>
          </button>

          {/* Facebook Login Button */}
          <button
            type="button"
            onClick={handleFacebookLogin}
            disabled={authLoading}
            className="w-full h-11 px-4 bg-[var(--theme-bg-surface)] hover:bg-[var(--theme-bg-subtle)] disabled:opacity-50 border border-[var(--theme-border)] hover:border-[#1877F2]/40 rounded-xl text-xs sm:text-sm font-medium text-[var(--theme-text-primary)] flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xs disabled:cursor-not-allowed"
          >
            <svg
              className="w-4 h-4 fill-[#1877F2] flex-shrink-0"
              viewBox="0 0 24 24"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Continue with Facebook</span>
          </button>
        </div>



        {/* Facebook App ID Configuration Modal */}
        {showFbModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-[var(--theme-bg-surface)] border border-[var(--theme-border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 fill-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <h3 className="text-sm font-semibold text-[var(--theme-text-primary)]">Facebook App ID</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFbModal(false)}
                  className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-[var(--theme-text-secondary)] leading-relaxed">
                Paste your Facebook App ID below to enable direct Facebook Login for your users:
              </p>

              <form onSubmit={handleSaveFbAppId} className="space-y-3">
                <input
                  type="text"
                  value={fbAppIdInput}
                  onChange={(e) => setFbAppIdInput(e.target.value)}
                  placeholder="e.g. 123456789012345"
                  required
                  autoFocus
                  className="w-full h-10 px-3.5 bg-[var(--theme-bg-input)] border border-[var(--theme-border)] focus:border-[var(--theme-primary-green)] rounded-lg text-xs font-mono text-[var(--theme-text-primary)] focus:outline-none"
                />

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowFbModal(false)}
                    className="h-8 px-3 rounded-lg border border-[var(--theme-border)] text-xs text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-8 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-lg text-xs font-medium shadow-xs transition-colors"
                  >
                    Connect & Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
