import React, { useState } from 'react';
import { AppConfig, ColorMode } from '../types';
import { ArrowRight, Eye, EyeOff, Check } from 'lucide-react';
import { ThemeSelector } from './ThemeSelector';
import apiKeyBanner from '../assets/images/api_key_banner_1790400916055.jpg';

interface ProviderSetupPageProps {
  config: AppConfig;
  onSaveConfig: (updated: AppConfig) => void;
  onNext: () => void;
  colorMode: ColorMode;
  onSelectMode: (mode: ColorMode) => void;
}

export const ProviderSetupPage: React.FC<ProviderSetupPageProps> = ({
  config,
  onSaveConfig,
  onNext,
  colorMode,
  onSelectMode,
}) => {
  const [provider, setProvider] = useState(config.provider || 'Gemini');
  const [apiKey, setApiKey] = useState(config.customApiKey || '');
  const [model, setModel] = useState(config.model || 'gemini-3.8-flash');
  const [showKey, setShowKey] = useState(false);

  const modelOptionsByProvider: Record<string, { id: string; name: string }[]> = {
    Gemini: [
      { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (Recommended)' },
      { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite (High Speed)' },
    ],
    OpenAI: [
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
    ],
    Anthropic: [
      { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet' },
      { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku' },
    ],
  };

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    const available = modelOptionsByProvider[newProvider];
    if (available && available.length > 0) {
      setModel(available[0].id);
    }
  };

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      ...config,
      provider,
      customApiKey: apiKey.trim(),
      model,
    });
    onNext();
  };

  return (
    <div
      data-theme={colorMode}
      className="relative min-h-screen w-screen bg-[var(--theme-bg-app)] flex flex-col justify-center items-center text-[var(--theme-text-primary)] font-sans p-6 sm:p-12 transition-colors duration-200"
    >
      {/* Top Right Mode Selection Circles */}
      <div className="absolute top-5 right-5 sm:top-8 sm:right-8">
        <ThemeSelector currentMode={colorMode} onSelectMode={onSelectMode} />
      </div>

      {/* Main Container */}
      <div className="max-w-md w-full mx-auto py-8">
        {/* Top Image Banner */}
        <div className="mb-6 rounded-2xl overflow-hidden border border-[var(--theme-border)] shadow-sm bg-[var(--theme-bg-surface)]">
          <img
            src={apiKeyBanner}
            alt="কন্ট্রোলটা নিজের হাতে। প্রশ্নটা হোক নিজের।"
            className="w-full h-auto object-cover rounded-2xl block select-none"
            referrerPolicy="no-referrer"
          />
        </div>

        <form onSubmit={handleProceed} className="space-y-5">
          {/* Provider */}
          <div className="space-y-1.5">
            <label
              htmlFor="provider-select"
              className="block font-mono text-[11px] uppercase tracking-wider text-[var(--theme-text-secondary)]"
            >
              Provider
            </label>
            <select
              id="provider-select"
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="w-full h-10 px-3 bg-[var(--theme-bg-input)] border border-[var(--theme-border)] hover:border-[var(--theme-primary-green)]/40 focus:border-[var(--theme-primary-green)] focus:ring-1 focus:ring-[var(--theme-primary-green)] rounded text-xs text-[var(--theme-text-primary)] font-medium focus:outline-none transition-colors cursor-pointer"
            >
              <option value="Gemini">Gemini (Google AI Studio)</option>
              <option value="OpenAI">OpenAI (Compatible)</option>
              <option value="Anthropic">Anthropic (Compatible)</option>
            </select>
          </div>

          {/* API Key */}
          <div className="space-y-1.5">
            <label
              htmlFor="api-key-input"
              className="block font-mono text-[11px] uppercase tracking-wider text-[var(--theme-text-secondary)]"
            >
              API Key
            </label>

            <div className="relative">
              <input
                id="api-key-input"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={
                  config.hasServerKey
                    ? 'Default server key active (leave blank or override)'
                    : 'Paste API key (e.g. AIzaSy...)'
                }
                className="w-full h-10 pl-3 pr-10 bg-[var(--theme-bg-input)] border border-[var(--theme-border)] hover:border-[var(--theme-primary-green)]/40 focus:border-[var(--theme-primary-green)] focus:ring-1 focus:ring-[var(--theme-primary-green)] rounded text-xs font-mono text-[var(--theme-text-primary)] focus:outline-none transition-colors placeholder:text-[var(--theme-text-secondary)]/60"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                aria-label={showKey ? "Hide API key" : "Show API key"}
                className="absolute right-3 top-3 text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] cursor-pointer transition-colors"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Model */}
          <div className="space-y-1.5">
            <label
              htmlFor="model-select"
              className="block font-mono text-[11px] uppercase tracking-wider text-[var(--theme-text-secondary)]"
            >
              Model
            </label>
            <select
              id="model-select"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full h-10 px-3 bg-[var(--theme-bg-input)] border border-[var(--theme-border)] hover:border-[var(--theme-primary-green)]/40 focus:border-[var(--theme-primary-green)] focus:ring-1 focus:ring-[var(--theme-primary-green)] rounded text-xs text-[var(--theme-text-primary)] font-medium focus:outline-none transition-colors cursor-pointer"
            >
              {(modelOptionsByProvider[provider] || modelOptionsByProvider['Gemini']).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Submit action */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full h-10 bg-[var(--theme-primary-green)] hover:bg-[var(--theme-primary-green-hover)] text-white rounded-[10px] text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <span>Continue to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
