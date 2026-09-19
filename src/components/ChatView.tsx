import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Send,
  Sparkles,
  Paperclip,
  Brain,
  Search,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Image as ImageIcon,
  ExternalLink,
  Bot,
  User,
  Trash2,
  Sliders,
  Download,
  Pin,
  FileText,
  X,
  Code,
} from 'lucide-react';
import { ChatMessage, LanguageCode, VoicePersona, VoiceSettings } from '../types';
import { audioFx } from '../services/audioFxEngine';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, image?: string, thinking?: boolean, search?: boolean) => Promise<void>;
  isLoading: boolean;
  onClearChat: () => void;
  language: LanguageCode;
  screenSnapshot?: string | null;
  speak?: (text: string, onEnd?: () => void) => void;
  stopSpeaking?: () => void;
  isSpeaking?: boolean;
  currentPersona?: VoicePersona;
  onOpenVoiceStudio?: () => void;
  voiceSettings?: VoiceSettings;
  onUpdateVoiceSettings?: (settings: Partial<VoiceSettings>) => void;
  initialPromptText?: string;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onClearChat,
  language,
  screenSnapshot,
  speak,
  stopSpeaking,
  isSpeaking = false,
  currentPersona,
  onOpenVoiceStudio,
  voiceSettings,
  onUpdateVoiceSettings,
  initialPromptText,
}) => {
  const [inputText, setInputText] = useState(initialPromptText || '');
  const [useThinking, setUseThinking] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // Search & Filter in Chat
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [pinnedMessageIds, setPinnedMessageIds] = useState<string[]>(() => {
    try {
      const p = localStorage.getItem('omniai_pinned_messages');
      return p ? JSON.parse(p) : [];
    } catch {
      return [];
    }
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialPromptText) {
      setInputText(initialPromptText);
    }
  }, [initialPromptText]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Auto-speak new assistant message if enabled in settings
  useEffect(() => {
    if (voiceSettings?.autoSpeakReplies && messages.length > 0 && speak) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'assistant' && !isLoading && speakingMessageId !== lastMsg.id) {
        setSpeakingMessageId(lastMsg.id);
        speak(lastMsg.text, () => setSpeakingMessageId(null));
      }
    }
  }, [messages, isLoading, voiceSettings?.autoSpeakReplies]);

  const togglePinMessage = (id: string) => {
    const updated = pinnedMessageIds.includes(id)
      ? pinnedMessageIds.filter((pId) => pId !== id)
      : [...pinnedMessageIds, id];
    setPinnedMessageIds(updated);
    try {
      localStorage.setItem('omniai_pinned_messages', JSON.stringify(updated));
    } catch {}
    audioFx.playChime('bubble');
  };

  const handleExportChat = (format: 'md' | 'json') => {
    audioFx.playChime('success');
    let content = '';
    let mimeType = 'text/plain';
    let filename = `chat-export-${new Date().toISOString().slice(0, 10)}`;

    if (format === 'md') {
      content = `# Экспорт истории чата OmniAI\nДата: ${new Date().toLocaleString()}\n\n---\n\n`;
      messages.forEach((m) => {
        const sender = m.role === 'user' ? '👤 Пользователь' : '🤖 OmniAI';
        const time = new Date(m.timestamp).toLocaleTimeString();
        content += `### ${sender} (${time})\n\n${m.text}\n\n---\n\n`;
      });
      filename += '.md';
      mimeType = 'text/markdown';
    } else {
      content = JSON.stringify(messages, null, 2);
      filename += '.json';
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !attachedImage) || isLoading) return;

    const textToSend = inputText;
    const imgToSend = attachedImage || undefined;
    setInputText('');
    setAttachedImage(null);
    setAttachedFileName(null);

    audioFx.playChime('activate');
    await onSendMessage(textToSend, imgToSend, useThinking, useSearch);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedImage(reader.result as string);
        setAttachedFileName(file.name);
      };
      reader.readAsDataURL(file);
    } else {
      // Text / code file reading
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        const formatted = `\n\n\`\`\`${file.name.split('.').pop() || 'text'}\n// Файл: ${file.name}\n${content}\n\`\`\``;
        setInputText((prev) => (prev ? prev + formatted : formatted));
        audioFx.playChime('bubble');
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    audioFx.playChime('success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleSpeakMessage = (msgId: string, text: string) => {
    if (!speak || !stopSpeaking) return;

    if (isSpeaking && speakingMessageId === msgId) {
      stopSpeaking();
      setSpeakingMessageId(null);
    } else {
      stopSpeaking();
      setSpeakingMessageId(msgId);
      audioFx.playChime('activate');
      speak(text, () => {
        setSpeakingMessageId(null);
      });
    }
  };

  const filteredMessages = useMemo(() => {
    if (!chatSearchQuery.trim()) return messages;
    const q = chatSearchQuery.toLowerCase();
    return messages.filter((m) => m.text.toLowerCase().includes(q));
  }, [messages, chatSearchQuery]);

  const pinnedMessages = useMemo(() => {
    return messages.filter((m) => pinnedMessageIds.includes(m.id));
  }, [messages, pinnedMessageIds]);

  const quickPrompts = [
    { label: '⚡ Рефакторинг кода', text: 'Проверь этот код, оптимизируй его и объясни улучшения:' },
    { label: '📝 Деловое письмо', text: 'Помоги составить вежливое и лаконичное деловое письмо:' },
    { label: '🔍 Фактчекинг', text: 'Проверь информацию и объясни подробности с источниками:' },
    { label: '🎙️ Озвучь мысль', text: 'Напиши красивый вдохновляющий монолог для проверки озвучки:' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Banner / Mode Selectors */}
      <div className="px-4 py-2.5 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md flex items-center justify-between gap-2 shrink-0 select-none">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Thinking Mode Toggle */}
          <button
            onClick={() => setUseThinking(!useThinking)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all duration-200 ${
              useThinking
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm'
                : 'bg-slate-900/70 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Глубокие пошаговые рассуждения модели перед ответом"
          >
            <Brain className={`w-3.5 h-3.5 ${useThinking ? 'text-purple-400' : ''}`} />
            <span>Рассуждения (Deep Think)</span>
          </button>

          {/* Web Search Grounding Toggle */}
          <button
            onClick={() => setUseSearch(!useSearch)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all duration-200 ${
              useSearch
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                : 'bg-slate-900/70 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Поиск актуальной информации в Google Search"
          >
            <Search className={`w-3.5 h-3.5 ${useSearch ? 'text-cyan-400' : ''}`} />
            <span>Веб-поиск (Live Grounding)</span>
          </button>

          {/* Voice Indicator & Auto-Speak Toggle */}
          {currentPersona && onOpenVoiceStudio && (
            <button
              onClick={onOpenVoiceStudio}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/70 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs transition"
              title="Настроить голос ассистента"
            >
              <span>{currentPersona.avatar}</span>
              <span className="hidden sm:inline font-medium">{currentPersona.name.split('/')[0].trim()}</span>
              <Sliders className="w-3 h-3 text-indigo-400 ml-0.5" />
            </button>
          )}

          {/* Auto-Speak Toggle Button */}
          {onUpdateVoiceSettings && voiceSettings && (
            <button
              onClick={() => onUpdateVoiceSettings({ autoSpeakReplies: !voiceSettings.autoSpeakReplies })}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs border transition ${
                voiceSettings.autoSpeakReplies
                  ? 'bg-pink-500/20 text-pink-300 border-pink-500/40 font-semibold'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-300'
              }`}
              title="Автоматически озвучивать ответы ассистента голосом"
            >
              <Volume2 className="w-3 h-3" />
              <span className="hidden md:inline">Авто-голос: {voiceSettings.autoSpeakReplies ? 'Вкл' : 'Выкл'}</span>
            </button>
          )}

          {/* Attach Current Screen Snapshot if available */}
          {screenSnapshot && !attachedImage && (
            <button
              onClick={() => setAttachedImage(screenSnapshot)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition"
              title="Прикрепить текущий кадр экрана к запросу"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Прикрепить кадр экрана</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Search Toggle */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`p-1.5 rounded-xl border transition ${
              isSearchOpen
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800'
            }`}
            title="Поиск по переписке"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Export Dropdown / Buttons */}
          {messages.length > 0 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleExportChat('md')}
                className="text-slate-400 hover:text-cyan-300 p-1.5 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition"
                title="Экспорт чата в Markdown (.md)"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={onClearChat}
                className="text-slate-500 hover:text-rose-400 p-1.5 rounded-xl hover:bg-slate-900 transition"
                title="Очистить историю чата"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Optional Search Bar */}
      {isSearchOpen && (
        <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <input
            type="text"
            placeholder="Поиск по истории диалога..."
            value={chatSearchQuery}
            onChange={(e) => setChatSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs text-slate-200 focus:outline-none placeholder-slate-500"
            autoFocus
          />
          {chatSearchQuery && (
            <button
              onClick={() => setChatSearchQuery('')}
              className="text-slate-500 hover:text-slate-300 text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-[10px] font-mono text-cyan-400">
            {filteredMessages.length} из {messages.length}
          </span>
        </div>
      )}

      {/* Pinned Messages Bar (if any pinned) */}
      {pinnedMessages.length > 0 && (
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Pin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-[11px] font-bold text-amber-300 shrink-0">Закрепленные:</span>
          {pinnedMessages.map((pm) => (
            <div
              key={pm.id}
              onClick={() => togglePinMessage(pm.id)}
              className="px-2.5 py-0.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-amber-500/30 text-[10px] text-slate-300 cursor-pointer flex items-center gap-1.5 shrink-0"
              title="Нажмите чтобы открепить"
            >
              <span className="max-w-[200px] truncate">{pm.text}</span>
              <X className="w-2.5 h-2.5 text-slate-500 hover:text-rose-400" />
            </div>
          ))}
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-8">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-pink-500/20 border border-indigo-500/30 flex items-center justify-center mb-4 shadow-xl shadow-indigo-500/10">
              <Bot className="w-8 h-8 text-cyan-400" />
            </div>
            <h2 className="text-xl font-extrabold text-white mb-2 tracking-tight">
              Рабочая станция OmniAI
            </h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed max-w-md">
              Интеллектуальный ассистент нового поколения. Поддерживает выбор из 6 живых голосовых тембров,
              рассуждения (Deep Think), работу с экраном и 100+ локальных утилит.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputText(qp.text + ' ')}
                  className="p-3 text-left rounded-2xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all duration-200 group shadow-sm"
                >
                  <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition">
                    {qp.label}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1 mt-1">{qp.text}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          filteredMessages.map((m) => {
            const isUser = m.role === 'user';
            const isThisMsgSpeaking = isSpeaking && speakingMessageId === m.id;
            const isPinned = pinnedMessageIds.includes(m.id);

            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto justify-end' : 'mr-auto'}`}
              >
                {!isUser && (
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 text-cyan-400 mt-1 shadow-md shadow-indigo-500/10">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`relative rounded-3xl p-4 sm:p-5 text-xs leading-relaxed max-w-[85vw] sm:max-w-2xl shadow-sm transition-all duration-200 ${
                    isUser
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-none shadow-indigo-500/10'
                      : isThisMsgSpeaking
                      ? 'bg-slate-900 border-2 border-cyan-500/80 text-slate-200 rounded-tl-none shadow-xl shadow-cyan-500/15'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {/* Pinned Badge */}
                  {isPinned && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold mb-2">
                      <Pin className="w-2.5 h-2.5" />
                      <span>Закреплено</span>
                    </div>
                  )}

                  {/* Attached Image if any */}
                  {m.image && (
                    <div className="mb-3 overflow-hidden rounded-2xl border border-slate-700/60 max-w-sm">
                      <img
                        src={m.image}
                        alt="Attached Context"
                        className="w-full object-cover max-h-64"
                      />
                    </div>
                  )}

                  {/* Message Text with simple formatting */}
                  <div className="whitespace-pre-wrap break-words font-sans text-xs leading-relaxed">
                    {m.text}
                  </div>

                  {/* Grounding Web Sources */}
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                      <div className="text-[10px] font-bold text-slate-400 mb-1.5 flex items-center gap-1">
                        <Search className="w-3 h-3 text-cyan-400" /> Источники из поиска:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {m.sources.map((src, sIdx) => (
                          <a
                            key={sIdx}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-cyan-400 text-[10px] border border-slate-700/70 transition"
                          >
                            <span>{src.title}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions (Pin / Copy / Speak / Timestamp) */}
                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        onClick={() => togglePinMessage(m.id)}
                        className={`p-1 rounded-lg transition ${
                          isPinned ? 'text-amber-400 hover:text-amber-300' : 'text-slate-500 hover:text-slate-300'
                        }`}
                        title={isPinned ? 'Открепить сообщение' : 'Закрепить вверху чата'}
                      >
                        <Pin className="w-3 h-3" />
                      </button>
                    </div>

                    {!isUser && (
                      <div className="flex items-center gap-3">
                        {/* Voice read out button */}
                        {speak && (
                          <button
                            onClick={() => handleToggleSpeakMessage(m.id, m.text)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition ${
                              isThisMsgSpeaking
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse'
                                : 'hover:text-cyan-400 hover:bg-slate-800 text-slate-400'
                            }`}
                            title={isThisMsgSpeaking ? 'Остановить воспроизведение' : 'Озвучить ответ текущим голосом'}
                          >
                            {isThisMsgSpeaking ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                                <span className="text-cyan-300 font-bold">Остановить</span>
                                <div className="flex items-end gap-0.5 h-3 ml-1">
                                  <span className="w-0.5 bg-cyan-400 rounded-full animate-audio-1" />
                                  <span className="w-0.5 bg-indigo-400 rounded-full animate-audio-2" />
                                  <span className="w-0.5 bg-cyan-400 rounded-full animate-audio-3" />
                                </div>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>Озвучить</span>
                              </>
                            )}
                          </button>
                        )}

                        {/* Copy button */}
                        <button
                          onClick={() => copyToClipboard(m.text, m.id)}
                          className="flex items-center gap-1 hover:text-cyan-400 transition"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 font-medium">Скопировано</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Копировать</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-9 h-9 rounded-2xl bg-indigo-500/30 border border-indigo-500/40 flex items-center justify-center shrink-0 text-indigo-300 mt-1 shadow-md shadow-indigo-500/10">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex gap-3 max-w-3xl mr-auto">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl rounded-tl-none p-4 flex items-center gap-2.5 text-xs text-slate-400 shadow-md">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce delay-100" />
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce delay-200" />
              <span className="ml-1 text-[11px] text-slate-400 font-medium">
                {useThinking ? 'Глубокий анализ рассуждений...' : 'Формирование ответа...'}
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 sm:p-4 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-xl shrink-0">
        {/* Attached preview */}
        {attachedImage && (
          <div className="mb-2.5 relative inline-block">
            <div className="relative rounded-xl overflow-hidden border border-cyan-500/40 w-24 h-16 shadow-lg">
              <img src={attachedImage} alt="Attachment" className="w-full h-full object-cover" />
            </div>
            <button
              onClick={() => {
                setAttachedImage(null);
                setAttachedFileName(null);
              }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 hover:bg-rose-600 rounded-full text-white text-[10px] flex items-center justify-center shadow"
            >
              ✕
            </button>
          </div>
        )}

        {attachedFileName && !attachedImage && (
          <div className="mb-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300">
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono">{attachedFileName}</span>
            <button
              onClick={() => setAttachedFileName(null)}
              className="text-slate-500 hover:text-white ml-1 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-end gap-2 max-w-4xl mx-auto w-full">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,text/*,.py,.js,.ts,.tsx,.json,.csv,.md,.html,.css,.sql"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-2xl text-slate-400 hover:text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition shrink-0 shadow-sm"
            title="Прикрепить изображение или скриншот"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <div className="relative flex-1">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Спросите что угодно, попросите написать код, анализ или озвучить мысль (Shift+Enter для новой строки)..."
              rows={1}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 resize-none max-h-36 min-h-[46px] transition shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || (!inputText.trim() && !attachedImage)}
            className="p-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-40 disabled:hover:from-cyan-500 text-slate-950 font-bold transition shrink-0 shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
