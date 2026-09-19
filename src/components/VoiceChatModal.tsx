import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Radio,
  Sliders,
  Check,
  ChevronDown,
} from 'lucide-react';
import { LanguageCode, VoicePersonaId } from '../types';
import { useSpeech } from '../hooks/useSpeech';
import { VOICE_PERSONAS } from '../services/voiceCatalog';
import { audioFx } from '../services/audioFxEngine';

interface VoiceChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onOpenVoiceStudio?: () => void;
}

export const VoiceChatModal: React.FC<VoiceChatModalProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  onOpenVoiceStudio,
}) => {
  const {
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    hasSupport,
    startListening,
    stopListening,
    resetTranscript,
    speak,
    stopSpeaking,
    voiceSettings,
    updateVoiceSettings,
    currentPersona,
  } = useSpeech(language);

  const [conversation, setConversation] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [handsFree, setHandsFree] = useState(true);
  const [showVoicePicker, setShowVoicePicker] = useState(false);

  const silenceTimerRef = useRef<any>(null);

  // Auto-send when user finishes speaking in hands-free mode
  useEffect(() => {
    if (!handsFree || isSpeaking || isProcessing) return;

    if (transcript.trim().length > 0) {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        handleSendVoice(transcript);
      }, 1500); // 1.5s silence trigger
    }

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [transcript, interimTranscript, handsFree, isSpeaking, isProcessing]);

  const handleSendVoice = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    const userQuery = textToSend.trim();
    resetTranscript();
    stopListening();

    setConversation((prev) => [...prev, { role: 'user', text: userQuery }]);
    setIsProcessing(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...conversation.map((c) => ({ role: c.role, text: c.text })),
            { role: 'user', text: userQuery },
          ],
          language,
          systemInstruction: `Ты — голосовой ассистент OmniAI по имени ${currentPersona.name}. Твой стиль: ${currentPersona.roleTitle}. Отвечай кратко, живо, дружелюбно и естественно на слух (2-4 предложения). Не используй громоздкие таблицы или блоки кода, если тебя об этом прямо не просили. Язык: ${language}.`,
        }),
      });

      const data = await res.json();
      const reply = data.text || 'Не удалось получить ответ.';

      setConversation((prev) => [...prev, { role: 'assistant', text: reply }]);
      setIsProcessing(false);

      // Speak response out loud using selected persona
      speak(reply, () => {
        if (handsFree) {
          startListening();
        }
      });
    } catch (err) {
      setIsProcessing(false);
      const errMsg = 'Произошла ошибка при обращении к серверу.';
      setConversation((prev) => [...prev, { role: 'assistant', text: errMsg }]);
      speak(errMsg);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-between p-4 sm:p-8 animate-in fade-in duration-300 select-none">
      {/* Top bar */}
      <div className="w-full max-w-3xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-500/20">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-white">
                Live Voice Dialogue
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                Hands-Free
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Голос:{' '}
              <strong className="text-indigo-300 font-semibold">{currentPersona.name}</strong>{' '}
              ({currentPersona.roleTitle})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Persona quick switch dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowVoicePicker(!showVoicePicker)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-200 hover:border-indigo-500 transition"
              title="Сменить персонаж голоса"
            >
              <span className="text-sm">{currentPersona.avatar}</span>
              <span className="hidden sm:inline font-medium">{currentPersona.name.split('/')[0].trim()}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showVoicePicker && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="text-[11px] font-bold text-slate-400 px-3 py-1.5 uppercase tracking-wider">
                  Выбрать голос
                </div>
                {VOICE_PERSONAS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      audioFx.playChime('bubble');
                      updateVoiceSettings({
                        personaId: p.id,
                        pitch: p.defaultPitch,
                        rate: p.defaultRate,
                      });
                      setShowVoicePicker(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition ${
                      voiceSettings.personaId === p.id
                        ? 'bg-indigo-600/30 text-white font-bold border border-indigo-500/40'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{p.avatar}</span>
                      <div>
                        <div className="text-xs">{p.name}</div>
                        <div className="text-[10px] text-slate-400">{p.roleTitle}</div>
                      </div>
                    </div>
                    {voiceSettings.personaId === p.id && <Check className="w-4 h-4 text-indigo-400" />}
                  </button>
                ))}

                {onOpenVoiceStudio && (
                  <button
                    onClick={() => {
                      stopListening();
                      stopSpeaking();
                      onClose();
                      onOpenVoiceStudio();
                    }}
                    className="w-full mt-2 pt-2 border-t border-slate-800 flex items-center justify-center gap-1.5 py-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Открыть Студию Голоса</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Language Selector */}
          <select
            aria-label="Выбор языка голосового диалога"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
            className="text-xs bg-slate-900 border border-slate-700/80 text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="ru">Русский (RU)</option>
            <option value="en">English (EN)</option>
            <option value="es">Español (ES)</option>
            <option value="de">Deutsch (DE)</option>
            <option value="zh">中文 (ZH)</option>
          </select>

          <button
            onClick={() => {
              stopListening();
              stopSpeaking();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
            title="Закрыть диалог"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Central Visual Orb & Sound Waves */}
      <div className="flex flex-col items-center justify-center my-auto text-center max-w-md w-full">
        <div className="relative flex items-center justify-center mb-8">
          {/* Animated glow rings */}
          {isSpeaking && (
            <>
              <div className="absolute w-52 h-52 rounded-full bg-indigo-500/20 animate-ping opacity-60 pointer-events-none" />
              <div className="absolute w-64 h-64 rounded-full bg-cyan-500/15 animate-pulse delay-75 pointer-events-none" />
              <div className="absolute w-80 h-80 rounded-full bg-purple-500/10 animate-pulse delay-150 pointer-events-none" />
            </>
          )}

          {isListening && !isSpeaking && (
            <>
              <div className="absolute w-48 h-48 rounded-full bg-emerald-500/25 animate-ping opacity-50 pointer-events-none" />
              <div className="absolute w-60 h-60 rounded-full bg-emerald-500/10 animate-pulse pointer-events-none" />
            </>
          )}

          {/* Central orb */}
          <div
            className={`w-36 h-36 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-500 border-2 ${
              isSpeaking
                ? 'bg-gradient-to-tr from-cyan-500 via-indigo-600 to-pink-500 border-white/50 shadow-indigo-500/50 scale-110'
                : isListening
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 border-white/50 shadow-emerald-500/50 scale-105'
                : isProcessing
                ? 'bg-gradient-to-tr from-purple-600 to-indigo-700 border-white/50 shadow-purple-500/50 animate-spin'
                : 'bg-slate-900 border-slate-800 text-slate-500 shadow-slate-900'
            }`}
          >
            {isSpeaking ? (
              <div className="flex flex-col items-center">
                <Volume2 className="w-12 h-12 text-white animate-bounce mb-1" />
                <div className="flex items-end gap-1 h-3">
                  <span className="w-1 bg-white rounded-full animate-audio-1" />
                  <span className="w-1 bg-white rounded-full animate-audio-2" />
                  <span className="w-1 bg-white rounded-full animate-audio-3" />
                  <span className="w-1 bg-white rounded-full animate-audio-4" />
                </div>
              </div>
            ) : isListening ? (
              <Mic className="w-12 h-12 text-white animate-pulse" />
            ) : isProcessing ? (
              <Sparkles className="w-12 h-12 text-white" />
            ) : (
              <MicOff className="w-10 h-10 text-slate-500" />
            )}
          </div>
        </div>

        {/* Current State Text */}
        <div className="text-base font-bold text-white mb-2 flex items-center gap-2">
          {isSpeaking ? (
            <>
              <span>{currentPersona.avatar}</span>
              <span>{currentPersona.name.split('/')[0].trim()} отвечает...</span>
            </>
          ) : isListening ? (
            <span className="text-emerald-400">Слушаю вас... Говорите свободно</span>
          ) : isProcessing ? (
            <span className="text-indigo-300 animate-pulse">Генерация ответа...</span>
          ) : (
            <span className="text-slate-400">Микрофон в режиме ожидания</span>
          )}
        </div>

        {/* Live speech transcription */}
        <div className="text-xs text-slate-300 min-h-[48px] px-6 max-w-md leading-relaxed">
          {transcript || interimTranscript ? (
            <span className="text-cyan-300 font-semibold bg-cyan-950/40 px-3 py-1.5 rounded-xl border border-cyan-500/20 inline-block">
              «{transcript} {interimTranscript}»
            </span>
          ) : (
            <span className="text-slate-500">
              {isListening
                ? 'Например: «Расскажи главное о квантовых компьютерах» или «Составь план тренировки»'
                : 'Нажмите «Начать говорить» или включите микрофон'}
            </span>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="w-full max-w-md flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          {/* Toggle Listening */}
          <button
            onClick={() => {
              if (isListening) {
                stopListening();
              } else {
                stopSpeaking();
                startListening();
              }
            }}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-xs shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 ${
              isListening
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/25'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" />
                <span>Остановить микрофон</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>Начать говорить</span>
              </>
            )}
          </button>

          {/* Stop Speaking if playing */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-lg"
              title="Заглушить речь"
            >
              <VolumeX className="w-4 h-4" />
            </button>
          )}

          {/* Hands Free Toggle */}
          <button
            onClick={() => setHandsFree(!handsFree)}
            className={`px-4 py-3.5 rounded-2xl text-xs font-semibold border transition ${
              handsFree
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
            title="Автоматически продолжать слушать после каждого ответа"
          >
            Диалог: {handsFree ? 'Авто' : 'Ручной'}
          </button>
        </div>

        {/* Support warning if Web Speech is missing */}
        {!hasSupport && (
          <p className="text-[11px] text-amber-400 text-center">
            Внимание: браузер не поддерживает распознавание речи Web Speech API напрямую. Рекомендуется Chrome, Edge или мобильный браузер на Android.
          </p>
        )}
      </div>
    </div>
  );
};
