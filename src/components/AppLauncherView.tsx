import React, { useState } from 'react';
import {
  Rocket,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  Search,
  Plus,
  Monitor,
  Smartphone,
  Play,
  MessageSquare,
  Music,
  Code,
  Calculator,
  Mail,
  Folder,
  Globe,
  Sparkles,
} from 'lucide-react';
import { AppShortcut } from '../types';

export const AppLauncherView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [customApps, setCustomApps] = useState<AppShortcut[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppUri, setNewAppUri] = useState('');
  const [aiCommandInput, setAiCommandInput] = useState('');
  const [aiSuggestedApp, setAiSuggestedApp] = useState<AppShortcut | null>(null);

  const defaultApps: AppShortcut[] = [
    {
      id: 'tg',
      name: 'Telegram',
      category: 'messenger',
      icon: 'MessageSquare',
      uriScheme: 'tg://',
      webUrl: 'https://web.telegram.org',
      cmdWindows: 'start telegram',
      cmdMacLinux: 'xdg-open tg://',
      cmdAndroid: 'am start -n org.telegram.messenger/.DefaultIcon',
      description: 'Мессенджер Telegram для общения и каналов',
    },
    {
      id: 'vscode',
      name: 'VS Code',
      category: 'dev',
      icon: 'Code',
      uriScheme: 'vscode://',
      webUrl: 'https://vscode.dev',
      cmdWindows: 'code',
      cmdMacLinux: 'code',
      cmdAndroid: 'code',
      description: 'Редактор кода и среда разработки',
    },
    {
      id: 'discord',
      name: 'Discord',
      category: 'messenger',
      icon: 'MessageSquare',
      uriScheme: 'discord://',
      webUrl: 'https://discord.com/app',
      cmdWindows: 'start discord',
      cmdMacLinux: 'xdg-open discord://',
      cmdAndroid: 'am start -n com.discord/.MainActivity',
      description: 'Голосовые и текстовые сообщества',
    },
    {
      id: 'spotify',
      name: 'Spotify',
      category: 'media',
      icon: 'Music',
      uriScheme: 'spotify://',
      webUrl: 'https://open.spotify.com',
      cmdWindows: 'start spotify',
      cmdMacLinux: 'spotify',
      cmdAndroid: 'am start -a android.intent.action.VIEW -d spotify://',
      description: 'Музыка, треки и подкасты',
    },
    {
      id: 'calc',
      name: 'Калькулятор',
      category: 'system',
      icon: 'Calculator',
      uriScheme: 'calculator://',
      cmdWindows: 'calc',
      cmdMacLinux: 'gnome-calculator',
      cmdAndroid: 'am start -a android.intent.action.MAIN -c android.intent.category.APP_CALCULATOR',
      description: 'Быстрые расчеты на ПК и Android',
    },
    {
      id: 'email',
      name: 'Почта (Email)',
      category: 'office',
      icon: 'Mail',
      uriScheme: 'mailto:',
      cmdWindows: 'start mailto:',
      cmdMacLinux: 'xdg-open mailto:',
      cmdAndroid: 'am start -a android.intent.action.SENDTO -d mailto:',
      description: 'Почтовый клиент по умолчанию',
    },
    {
      id: 'browser',
      name: 'Браузер (Google Chrome)',
      category: 'browser',
      icon: 'Globe',
      uriScheme: 'https://google.com',
      cmdWindows: 'start chrome https://google.com',
      cmdMacLinux: 'google-chrome',
      cmdAndroid: 'am start -a android.intent.action.VIEW -d https://google.com',
      description: 'Поиск и веб-навигация',
    },
    {
      id: 'explorer',
      name: 'Проводник / Файлы',
      category: 'system',
      icon: 'Folder',
      cmdWindows: 'explorer .',
      cmdMacLinux: 'nautilus .',
      cmdAndroid: 'am start -a android.intent.action.GET_CONTENT -t */*',
      description: 'Файловый менеджер системы',
    },
  ];

  const allApps = [...defaultApps, ...customApps];

  const filteredApps = allApps.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLaunch = (app: AppShortcut) => {
    if (app.uriScheme) {
      window.location.href = app.uriScheme;
    } else if (app.webUrl) {
      window.open(app.webUrl, '_blank');
    }
  };

  const copyCommand = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAiCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const query = aiCommandInput.toLowerCase();
    if (!query) return;

    if (query.includes('телег') || query.includes('tg') || query.includes('напиши')) {
      setAiSuggestedApp(defaultApps.find((a) => a.id === 'tg') || null);
    } else if (query.includes('код') || query.includes('vscode') || query.includes('разработ')) {
      setAiSuggestedApp(defaultApps.find((a) => a.id === 'vscode') || null);
    } else if (query.includes('музык') || query.includes('песн') || query.includes('спотифай')) {
      setAiSuggestedApp(defaultApps.find((a) => a.id === 'spotify') || null);
    } else if (query.includes('посчит') || query.includes('кальк')) {
      setAiSuggestedApp(defaultApps.find((a) => a.id === 'calc') || null);
    } else if (query.includes('письм') || query.includes('почт') || query.includes('email')) {
      setAiSuggestedApp(defaultApps.find((a) => a.id === 'email') || null);
    } else {
      setAiSuggestedApp(defaultApps.find((a) => a.id === 'browser') || null);
    }
  };

  const handleAddCustomApp = () => {
    if (!newAppName.trim() || !newAppUri.trim()) return;
    const newApp: AppShortcut = {
      id: Date.now().toString(),
      name: newAppName.trim(),
      category: 'system',
      icon: 'Rocket',
      uriScheme: newAppUri.trim(),
      description: 'Пользовательское приложение',
    };
    setCustomApps((prev) => [...prev, newApp]);
    setNewAppName('');
    setNewAppUri('');
    setShowAddModal(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-950 p-4 space-y-4">
      {/* Top Banner & AI Natural Language Launcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">App Launcher & Командный центр</h2>
              <p className="text-xs text-slate-400">
                Запуск программ на ПК и Android в один клик по системным протоколам (URI) или командам
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Plus className="w-3.5 h-3.5 text-sky-400" />
            <span>Добавить программу</span>
          </button>
        </div>

        {/* AI Intent Launcher input */}
        <form onSubmit={handleAiCommand} className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Sparkles className="w-3.5 h-3.5 text-sky-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={aiCommandInput}
              onChange={(e) => setAiCommandInput(e.target.value)}
              placeholder="Скажите ИИ своими словами: «открой телеграм», «хочу слушать музыку», «запусти калькулятор»..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shrink-0 shadow-md shadow-emerald-500/20"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Запустить</span>
          </button>
        </form>

        {/* AI Suggested App Prompt Result */}
        {aiSuggestedApp && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                ИИ распознал намерение. Рекомендуемая программа: <strong>{aiSuggestedApp.name}</strong>
              </span>
            </div>
            <button
              onClick={() => handleLaunch(aiSuggestedApp)}
              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition"
            >
              Открыть сейчас
            </button>
          </div>
        )}
      </div>

      {/* Search Filter */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по установленным приложениям..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-400"
          />
        </div>
        <div className="text-[11px] text-slate-500">
          Всего программ: {filteredApps.length}
        </div>
      </div>

      {/* Grid of Apps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredApps.map((app) => (
          <div
            key={app.id}
            className="bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-3.5 flex flex-col justify-between transition group"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-sky-400 group-hover:bg-sky-500/20 transition">
                    <Rocket className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs text-white">{app.name}</h3>
                    <p className="text-[10px] text-slate-400">{app.description}</p>
                  </div>
                </div>

                {/* Direct Launch Button */}
                {app.uriScheme ? (
                  <button
                    onClick={() => handleLaunch(app)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 transition shadow-sm"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Открыть</span>
                  </button>
                ) : app.webUrl ? (
                  <a
                    href={app.webUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 transition"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Веб</span>
                  </a>
                ) : null}
              </div>
            </div>

            {/* Quick Terminal Command Pills for Windows / Linux / Android */}
            {(app.cmdWindows || app.cmdAndroid) && (
              <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500 truncate max-w-[240px]">
                  <Terminal className="w-3 h-3 text-slate-500 shrink-0" />
                  <span className="truncate">{app.cmdWindows || app.cmdAndroid}</span>
                </div>
                <button
                  onClick={() => copyCommand(app.cmdWindows || app.cmdAndroid || '', app.id)}
                  className="flex items-center gap-1 text-slate-400 hover:text-sky-400 transition ml-2 shrink-0"
                  title="Скопировать команду для терминала"
                >
                  {copiedId === app.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Скопировано</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Команда</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Custom App Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full space-y-3">
            <h3 className="font-bold text-sm text-white">Добавить программу в Launcher</h3>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Название программы:</label>
              <input
                type="text"
                value={newAppName}
                onChange={(e) => setNewAppName(e.target.value)}
                placeholder="Например: Obsidian, Steam, Zoom"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">URI-протокол или ссылка:</label>
              <input
                type="text"
                value={newAppUri}
                onChange={(e) => setNewAppUri(e.target.value)}
                placeholder="Например: obsidian://, steam://, zoommtg://"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
              >
                Отмена
              </button>
              <button
                onClick={handleAddCustomApp}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
