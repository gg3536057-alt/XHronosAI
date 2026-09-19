import React, { useState, useEffect } from 'react';
import { ActiveTab, ChatMessage, LanguageCode } from './types';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { ChatView } from './components/ChatView';
import { VoiceStudioView } from './components/VoiceStudioView';
import { ScreenVisionView } from './components/ScreenVisionView';
import { VoiceChatModal } from './components/VoiceChatModal';
import { ImageGenView } from './components/ImageGenView';
import { AppLauncherView } from './components/AppLauncherView';
import { ContextMenuWidget } from './components/ContextMenuWidget';
import { InstallGuideModal } from './components/InstallGuideModal';
import { ComfortSettingsModal } from './components/ComfortSettingsModal';
import { ToolboxView } from './components/ToolboxView';
import { OfflineHubView } from './components/OfflineHubView';
import { PromptLibraryView } from './components/PromptLibraryView';
import { ThemeStudioView } from './components/ThemeStudioView';
import { AudioMemoTranscriberView } from './components/AudioMemoTranscriberView';
import { offlineAI } from './services/offlineEngine';
import { themeManager } from './services/themeEngine';
import { useSpeech } from './hooks/useSpeech';
import { UserComfortSettings, AppTheme } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [language, setLanguage] = useState<LanguageCode>('ru');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isComfortOpen, setIsComfortOpen] = useState(false);
  const [sharedScreenSnapshot, setSharedScreenSnapshot] = useState<string | null>(null);
  const [initialChatPrompt, setInitialChatPrompt] = useState<string>('');

  // Global Theme Engine State
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => themeManager.getActiveTheme());

  useEffect(() => {
    themeManager.init();
  }, []);

  // User Comfort Preferences
  const [comfortSettings, setComfortSettings] = useState<UserComfortSettings>(() => {
    try {
      const saved = localStorage.getItem('omni_comfort_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { fontSize: 'md', compactMode: false, soundEffects: true };
  });

  const [colorScheme, setColorScheme] = useState<'slate' | 'warm' | 'oled'>(() => {
    try {
      const saved = localStorage.getItem('omni_color_scheme');
      if (saved === 'warm' || saved === 'oled' || saved === 'slate') return saved;
    } catch {}
    return 'slate';
  });

  const handleUpdateComfort = (partial: Partial<UserComfortSettings>) => {
    setComfortSettings((prev) => {
      const updated = { ...prev, ...partial };
      try {
        localStorage.setItem('omni_comfort_settings', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleUpdateColorScheme = (scheme: 'slate' | 'warm' | 'oled') => {
    setColorScheme(scheme);
    try {
      localStorage.setItem('omni_color_scheme', scheme);
    } catch {}
  };

  // Central speech synthesis hook
  const {
    speak,
    stopSpeaking,
    isSpeaking,
    voices,
    voiceSettings,
    updateVoiceSettings,
    currentPersona,
  } = useSpeech(language);

  // Global Hotkey handler (Escape to stop audio/close, Alt+V for voice, Alt+C for comfort)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopSpeaking();
        setIsComfortOpen(false);
        setIsVoiceOpen(false);
        setIsGuideOpen(false);
      } else if (e.altKey && (e.key === 'v' || e.key === 'м')) {
        e.preventDefault();
        setActiveTab('voices');
      } else if (e.altKey && (e.key === 'c' || e.key === 'с')) {
        e.preventDefault();
        setIsComfortOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stopSpeaking]);

  // Load chat history from localStorage on first mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('omni_ai_chat');
      if (saved) {
        setMessages(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load local chat history:', e);
    }
  }, []);

  // Persist chat history
  useEffect(() => {
    try {
      localStorage.setItem('omni_ai_chat', JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to persist chat history:', e);
    }
  }, [messages]);

  const handleSendMessage = async (
    text: string,
    image?: string,
    thinking = false,
    search = false
  ) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      image,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoadingChat(true);

    // If completely offline or network fails, gracefully fallback to local offline engine
    if (!navigator.onLine) {
      try {
        const offlineRes = await offlineAI.processOffline(text, messages, language);
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: offlineRes.text,
          timestamp: new Date().toISOString(),
          thinking: offlineRes.reasoningSteps?.join('\n'),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err: any) {
        const errorMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: `Ошибка локального движка: ${err.message}`,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoadingChat(false);
      }
      return;
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            text: m.text,
            image: m.image,
          })),
          language,
          thinking,
          searchGrounding: search,
          systemInstruction: `Ты — продвинутый всесторонний ИИ-ассистент OmniAI по имени ${currentPersona.name}. Твой стиль: ${currentPersona.roleTitle}. Отвечай грамотно, структурированно, понятно и доброжелательно. Язык: ${language}.`,
        }),
      });

      if (!res.ok) {
        throw new Error(`Статус ответа ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: data.text || 'Не удалось получить ответ от модели.',
        timestamp: new Date().toISOString(),
        sources: data.sources,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.warn('Network call failed, attempting local fallback:', err);
      try {
        const offlineRes = await offlineAI.processOffline(text, messages, language);
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: `*(Автономный локальный ответ, так как сеть недоступна)*\n\n${offlineRes.text}`,
          timestamp: new Date().toISOString(),
          thinking: offlineRes.reasoningSteps?.join('\n'),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        const errorMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: `Ошибка связи: ${err.message || 'Не удалось отправить запрос.'}`,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleClearChat = () => {
    stopSpeaking();
    setMessages([]);
    localStorage.removeItem('omni_ai_chat');
  };

  const handleSendToChat = (text: string, image?: string) => {
    setActiveTab('chat');
    setInitialChatPrompt(text);
    handleSendMessage(text, image);
  };

  const handleApplyPromptToChat = (promptText: string) => {
    setInitialChatPrompt(promptText);
    setActiveTab('chat');
  };

  const fontScaleClass =
    comfortSettings.fontSize === 'sm'
      ? 'text-xs'
      : comfortSettings.fontSize === 'lg'
      ? 'text-base'
      : 'text-sm';

  const themeBgClass =
    colorScheme === 'warm'
      ? 'bg-[#141210] text-[#ece7e1]'
      : colorScheme === 'oled'
      ? 'bg-black text-zinc-100'
      : 'bg-slate-950 text-slate-100';

  return (
    <div
      className={`h-screen w-screen flex flex-col ${themeBgClass} ${fontScaleClass} font-sans overflow-hidden transition-colors duration-200`}
      style={{
        backgroundColor: currentTheme.colors.bg,
        color: currentTheme.colors.textPrimary,
      }}
    >
      {/* Top Header */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenVoiceStudio={() => setActiveTab('voices')}
        onOpenComfort={() => setIsComfortOpen(true)}
        onOpenThemes={() => setActiveTab('themes')}
        activeThemeName={currentTheme.name}
        currentPersona={currentPersona}
        isVoiceActive={isVoiceOpen || isSpeaking}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar (Desktop) / Bottom Nav (Mobile) */}
        <Navigation
          activeTab={activeTab}
          onTabChange={(tab) => {
            if (tab === 'voice') {
              setIsVoiceOpen(true);
            } else if (tab === 'guide') {
              setIsGuideOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
        />

        {/* Tab View Switcher */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeTab === 'chat' && (
            <ChatView
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoadingChat}
              onClearChat={handleClearChat}
              language={language}
              screenSnapshot={sharedScreenSnapshot}
              speak={speak}
              stopSpeaking={stopSpeaking}
              isSpeaking={isSpeaking}
              currentPersona={currentPersona}
              onOpenVoiceStudio={() => setActiveTab('voices')}
              voiceSettings={voiceSettings}
              onUpdateVoiceSettings={updateVoiceSettings}
              initialPromptText={initialChatPrompt}
            />
          )}

          {activeTab === 'prompts' && (
            <PromptLibraryView onSendToChat={handleApplyPromptToChat} />
          )}

          {activeTab === 'themes' && (
            <ThemeStudioView
              currentTheme={currentTheme}
              onThemeChange={(t) => setCurrentTheme(t)}
            />
          )}

          {activeTab === 'transcribe' && (
            <AudioMemoTranscriberView
              onSendToChat={handleSendToChat}
              onSpeakText={(text) => speak(text)}
              language={language}
            />
          )}

          {activeTab === 'voices' && (
            <VoiceStudioView
              language={language}
              onLanguageChange={setLanguage}
              voices={voices}
              voiceSettings={voiceSettings}
              onUpdateSettings={updateVoiceSettings}
              speak={speak}
              stopSpeaking={stopSpeaking}
              isSpeaking={isSpeaking}
              onOpenVoiceChat={() => setIsVoiceOpen(true)}
            />
          )}

          {activeTab === 'tools' && (
            <ToolboxView onSendToChat={handleSendToChat} />
          )}

          {activeTab === 'offline' && (
            <OfflineHubView />
          )}

          {activeTab === 'vision' && (
            <ScreenVisionView
              onSendToChat={handleSendToChat}
              onOpenAppLauncher={() => setActiveTab('launcher')}
            />
          )}

          {activeTab === 'images' && (
            <ImageGenView onSendToChat={handleSendToChat} />
          )}

          {activeTab === 'launcher' && (
            <AppLauncherView />
          )}

          {activeTab === 'context' && (
            <div className="flex-1 p-6 overflow-y-auto max-w-3xl mx-auto space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                <h2 className="text-lg font-bold text-white mb-2">Контекстное меню и быстрые действия</h2>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  Вы можете выделить любой текст в приложении или нажать <kbd className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400 font-mono font-semibold">Alt + K</kbd> для вызова мгновенных действий ИИ без переключения окон:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-sm">
                    <strong className="text-cyan-400 block mb-1 font-bold">⚡ Объясни простыми словами</strong>
                    <p className="text-slate-400 text-[11px] leading-relaxed">Разбор сложных терминов, технической документации и заковыристых формулировок.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-sm">
                    <strong className="text-emerald-400 block mb-1 font-bold">✍️ Исправление ошибок</strong>
                    <p className="text-slate-400 text-[11px] leading-relaxed">Проверка орфографии, пунктуации и тона текста перед отправкой в чат или мессенджер.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-sm">
                    <strong className="text-purple-400 block mb-1 font-bold">💻 Преобразование в код</strong>
                    <p className="text-slate-400 text-[11px] leading-relaxed">Создание скриптов, функций, регулярных выражений и рефакторинг фрагментов.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-sm">
                    <strong className="text-pink-400 block mb-1 font-bold">🌐 Мгновенный перевод</strong>
                    <p className="text-slate-400 text-[11px] leading-relaxed">Двусторонний качественный перевод с сохранением контекста и идиом.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Global Interactive Context Menu & Hotkey Palette */}
      <ContextMenuWidget
        onRunAction={(title, text, prompt) => {
          handleSendMessage(`${prompt}\n\n"${text}"`);
        }}
      />

      {/* Voice Chat Interactive Overlay */}
      <VoiceChatModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        language={language}
        onLanguageChange={setLanguage}
        onOpenVoiceStudio={() => {
          setIsVoiceOpen(false);
          setActiveTab('voices');
        }}
      />

      {/* Step-by-Step "Что куда" Installation & Setup Guide */}
      <InstallGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Comfort & Ergonomics Settings Modal */}
      <ComfortSettingsModal
        isOpen={isComfortOpen}
        onClose={() => setIsComfortOpen(false)}
        comfort={comfortSettings}
        onUpdateComfort={handleUpdateComfort}
        colorScheme={colorScheme}
        onUpdateColorScheme={handleUpdateColorScheme}
      />
    </div>
  );
}
