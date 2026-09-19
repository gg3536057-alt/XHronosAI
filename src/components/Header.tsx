import React from 'react';
import {
  Sparkles,
  Mic,
  Download,
  HelpCircle,
  Globe,
  Volume2,
  Wifi,
  Sliders,
  Palette,
} from 'lucide-react';
import { LanguageCode, VoicePersona } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onOpenVoice: () => void;
  onOpenGuide: () => void;
  onOpenVoiceStudio: () => void;
  onOpenComfort?: () => void;
  onOpenThemes?: () => void;
  activeThemeName?: string;
  currentPersona: VoicePersona;
  isVoiceActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  onOpenVoice,
  onOpenGuide,
  onOpenVoiceStudio,
  onOpenComfort,
  onOpenThemes,
  activeThemeName,
  currentPersona,
  isVoiceActive = false,
}) => {
  const { isInstallable, install } = usePWAInstall();

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 select-none shadow-sm">
      {/* Brand & Status */}
      <div className="flex items-center gap-3.5">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-pink-500 p-[1.5px] shadow-lg shadow-indigo-500/20 group cursor-pointer">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center transition group-hover:bg-slate-900">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
              OmniAI <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/30">Workstation</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-emerald-400 font-semibold text-[10px] tracking-wide uppercase">Онлайн</span>
            </span>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <span className="hidden sm:inline text-slate-400 text-[11px]">Кроссплатформенный ассистент</span>
          </div>
        </div>
      </div>

      {/* Quick Tools & Voice Selector Quick Badge */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Active Voice Persona Quick Badge */}
        <button
          onClick={onOpenVoiceStudio}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/60 transition shadow-sm group"
          title="Настроить голос и тембр ассистента"
        >
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="text-sm">{currentPersona.avatar}</span>
            <span className="hidden md:inline font-semibold group-hover:text-white">
              {currentPersona.name.split('/')[0].trim()}
            </span>
          </div>
          <Volume2 className="w-3.5 h-3.5 text-indigo-400 group-hover:text-cyan-400 transition" />
        </button>

        {/* Language Switcher */}
        <div className="relative flex items-center">
          <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
          <select
            aria-label="Выбор языка интерфейса и речи"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
            className="text-xs bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 rounded-xl pl-8 pr-2.5 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer transition font-medium"
          >
            <option value="ru">RU (Русский)</option>
            <option value="en">EN (English)</option>
            <option value="es">ES (Español)</option>
            <option value="de">DE (Deutsch)</option>
            <option value="zh">ZH (中文)</option>
          </select>
        </div>

        {/* Live Voice Dialog Trigger */}
        <button
          onClick={onOpenVoice}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-md ${
            isVoiceActive
              ? 'bg-rose-500 text-white animate-pulse'
              : 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-indigo-500/20'
          }`}
          title="Запустить голосовой диалог без рук"
        >
          <Mic className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Голос Live</span>
        </button>

        {/* Install PWA Button */}
        {isInstallable && (
          <button
            onClick={install}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
            title="Установить как приложение на ПК или Android"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Установить</span>
          </button>
        )}

        {/* Comfort Settings button */}
        {onOpenComfort && (
          <button
            onClick={onOpenComfort}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
            title="Настройки комфорта: размер шрифта, режим для глаз, горячие клавиши"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Комфорт</span>
          </button>
        )}

        {/* Themes button */}
        {onOpenThemes && (
          <button
            onClick={onOpenThemes}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
            title="Выбор темы оформления и конструктор своей темы"
          >
            <Palette className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline">{activeThemeName || 'Темы'}</span>
          </button>
        )}

        {/* Guide button */}
        <button
          onClick={onOpenGuide}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
          title="Инструкция пользователя"
        >
          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Гид</span>
        </button>
      </div>
    </header>
  );
};
