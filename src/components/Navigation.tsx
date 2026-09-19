import React from 'react';
import {
  MessageSquare,
  Eye,
  Mic,
  Volume2,
  Image as ImageIcon,
  Rocket,
  Wrench,
  WifiOff,
  Zap,
  HelpCircle,
  Command,
  Sparkles,
  Palette,
  BookOpen,
  AudioLines,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isVisionActive?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  isVisionActive = false,
}) => {
  const tabs = [
    {
      id: 'chat' as ActiveTab,
      label: 'Чат & Рассуждения',
      shortLabel: 'Чат',
      icon: MessageSquare,
      description: 'Диалог с памятью и рассуждениями',
    },
    {
      id: 'prompts' as ActiveTab,
      label: 'Промпт-Лаборатория',
      shortLabel: 'Промпты',
      icon: BookOpen,
      description: '60+ готовых профессиональных промптов',
      badge: 'NEW',
    },
    {
      id: 'themes' as ActiveTab,
      label: 'Темы & Своя Тема',
      shortLabel: 'Темы',
      icon: Palette,
      description: 'Выбор палитры и конструктор темы',
      badge: 'СТИЛЬ',
    },
    {
      id: 'transcribe' as ActiveTab,
      label: 'Аудио-заметки',
      shortLabel: 'Заметки',
      icon: AudioLines,
      description: 'Запись речи, транскрипция и ИИ-анализ',
      badge: 'REC',
    },
    {
      id: 'voices' as ActiveTab,
      label: 'Голоса ассистента',
      shortLabel: 'Голоса',
      icon: Volume2,
      description: 'Студия озвучки, персонажи и тембры',
      badge: 'Голоса',
    },
    {
      id: 'tools' as ActiveTab,
      label: 'Инструменты (100+)',
      shortLabel: 'Утилиты',
      icon: Wrench,
      description: 'Текст, код, хэши, расчеты, ОС',
      badge: '100+',
    },
    {
      id: 'offline' as ActiveTab,
      label: 'Автономный ИИ',
      shortLabel: 'Офлайн',
      icon: WifiOff,
      description: 'Работа без интернета и локальный хаб',
      badge: 'OFFLINE',
    },
    {
      id: 'vision' as ActiveTab,
      label: 'Зрение экрана',
      shortLabel: 'Экран',
      icon: Eye,
      description: 'Анализ монитора и приложений',
      badge: isVisionActive ? 'LIVE' : undefined,
    },
    {
      id: 'voice' as ActiveTab,
      label: 'Голосовой диалог',
      shortLabel: 'Диалог',
      icon: Mic,
      description: 'Разговор без рук в реальном времени',
    },
    {
      id: 'images' as ActiveTab,
      label: 'Картинки & Арт',
      shortLabel: 'Картинки',
      icon: ImageIcon,
      description: 'Генерация концепт-арта и фото',
    },
    {
      id: 'launcher' as ActiveTab,
      label: 'Запуск программ',
      shortLabel: 'Запуск',
      icon: Rocket,
      description: 'Открытие приложений ПК и Android',
    },
    {
      id: 'context' as ActiveTab,
      label: 'Контекст-меню',
      shortLabel: 'Действия',
      icon: Zap,
      description: 'Быстрые команды и хоткеи',
    },
    {
      id: 'guide' as ActiveTab,
      label: 'Гид «Что куда»',
      shortLabel: 'Гид',
      icon: HelpCircle,
      description: 'Инструкции для ПК и смартфона',
    },
  ];

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800/80 bg-slate-950/60 p-3 shrink-0 select-none backdrop-blur-xl">
        <div className="flex items-center justify-between px-3 mb-3">
          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Рабочая станция
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] text-cyan-400/90 font-medium">
            <Sparkles className="w-3 h-3" /> v2.6 Pro
          </span>
        </div>

        <nav className="space-y-1.5 overflow-y-auto pr-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/20 to-cyan-500/10 text-cyan-300 font-semibold shadow-md border border-indigo-500/40 ring-1 ring-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 transition-colors ${
                    isActive
                      ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30'
                      : 'bg-slate-900 text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate flex items-center justify-between">
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          tab.badge === 'LIVE'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse'
                            : tab.badge === 'OFFLINE'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : tab.badge === 'Голоса'
                            ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    {tab.description}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom Quick Status & Shortcut Hint */}
        <div className="mt-auto pt-3 border-t border-slate-800/80">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 text-[11px] text-slate-400 shadow-sm">
            <div className="flex items-center justify-between text-slate-300 font-medium mb-1">
              <span className="flex items-center gap-1.5 font-bold text-xs">
                <Command className="w-3.5 h-3.5 text-cyan-400" /> Быстрый запуск
              </span>
              <kbd className="px-1.5 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-[10px] text-slate-300 font-mono font-semibold">
                Alt + K
              </kbd>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Вызов плавающего контекстного меню и мгновенных действий.
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation (visible only on small screens) */}
      <nav className="md:hidden flex items-center justify-around border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-xl px-1 py-2 shrink-0 z-20 select-none overflow-x-auto no-scrollbar gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition min-w-[56px] shrink-0 ${
                isActive
                  ? 'bg-indigo-500/20 text-cyan-300 font-bold border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className="w-4 h-4" />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-cyan-400" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{tab.shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
