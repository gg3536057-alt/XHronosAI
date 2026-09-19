import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  Sparkles,
  Sliders,
  Radio,
  Check,
  RotateCcw,
  Zap,
  Mic,
  Languages,
  Layers,
  HelpCircle,
  Cpu,
  Info,
  Flame,
} from 'lucide-react';
import { LanguageCode, VoicePersona, VoiceSettings, VoicePersonaId, VoiceEngineMode } from '../types';
import { VOICE_PERSONAS, DEFAULT_VOICE_SETTINGS } from '../services/voiceCatalog';
import { audioFx } from '../services/audioFxEngine';

interface VoiceStudioViewProps {
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  voices: SpeechSynthesisVoice[];
  voiceSettings: VoiceSettings;
  onUpdateSettings: (settings: Partial<VoiceSettings>) => void;
  speak: (text: string, onEnd?: () => void, overrides?: Partial<VoiceSettings>) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
  onOpenVoiceChat: () => void;
}

export const VoiceStudioView: React.FC<VoiceStudioViewProps> = ({
  language,
  onLanguageChange,
  voices,
  voiceSettings,
  onUpdateSettings,
  speak,
  stopSpeaking,
  isSpeaking,
  onOpenVoiceChat,
}) => {
  const [customText, setCustomText] = useState('Привет! Я твой обновленный голосовой ассистент. Теперь у каждого персонажа свой собственный реальный голос!');
  const [testingPersonaId, setTestingPersonaId] = useState<string | null>(null);

  // Filter voices matching current language or international
  const langPrefix = language.split('-')[0].toLowerCase();
  const filteredVoices = voices.filter((v) =>
    v.lang.toLowerCase().startsWith(langPrefix)
  );
  const displayVoices = filteredVoices.length > 0 ? filteredVoices : voices;

  const currentPersona =
    VOICE_PERSONAS.find((p) => p.id === voiceSettings.personaId) || VOICE_PERSONAS[0];

  const handleTestPersona = (persona: VoicePersona) => {
    if (isSpeaking) {
      stopSpeaking();
      if (testingPersonaId === persona.id) {
        setTestingPersonaId(null);
        return;
      }
    }
    setTestingPersonaId(persona.id);
    audioFx.playChime('activate');
    speak(persona.previewSample, () => setTestingPersonaId(null), {
      personaId: persona.id,
      pitch: persona.defaultPitch,
      rate: persona.defaultRate,
      engineMode: voiceSettings.engineMode,
    });
  };

  const handleTestCustomText = () => {
    if (!customText.trim()) return;
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    audioFx.playChime('activate');
    speak(customText);
  };

  const handleResetToDefaults = () => {
    audioFx.playChime('bubble');
    onUpdateSettings({
      personaId: 'alisa',
      selectedVoiceURI: null,
      pitch: 1.16,
      rate: 1.05,
      volume: 1.0,
      timbreEffect: 'natural',
      engineMode: 'neural',
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-4 sm:p-6 lg:p-8">
      {/* Header Banner */}
      <div className="max-w-6xl w-full mx-auto mb-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/90 via-slate-900 to-purple-950/90 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -top-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Глобальное обновление 3.0: Мультитембровый Студийный Звук</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Голосовая Студия OmniAI
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
                Исправлена монотонная озвучка: теперь каждый персонаж имеет собственный уникальный голос (Алиса — живой женский, Макс — мужской баритон, Джарвис — техно-бас), а не базовую системную Елену!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenVoiceChat}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition"
              >
                <Mic className="w-4 h-4" />
                <span>Живой диалог без рук</span>
              </button>

              <button
                onClick={handleResetToDefaults}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-semibold transition"
                title="Сбросить все звуковые настройки"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Сброс настроек</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Engine Switcher Callout Box */}
      <div className="max-w-6xl w-full mx-auto mb-6">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Режим синтеза речи:</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  voiceSettings.engineMode === 'neural'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {voiceSettings.engineMode === 'neural' ? '⚡ Нейронная Студия (Разные голоса)' : '🖥️ Локальный голос ОС'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                {voiceSettings.engineMode === 'neural'
                  ? 'Включен студийный движок: Алиса, Макс, Джарвис звучат реальными человеческими голосами с разными тембрами и полом.'
                  : 'Используется встроенный в систему голос (если в Windows установлена только Microsoft Elena, все персонажи будут говорить им).'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <button
              onClick={() => onUpdateSettings({ engineMode: 'neural' })}
              className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                voiceSettings.engineMode === 'neural'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Нейро-голоса</span>
            </button>
            <button
              onClick={() => onUpdateSettings({ engineMode: 'system' })}
              className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                voiceSettings.engineMode === 'system'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Голос ОС</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
        {/* Left Column: Voice Personas Grid (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-cyan-400" />
                <span>Персонажи и тембры ассистента</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Выберите персонаж. Нажмите на карточку, чтобы переключить активного диктора.
              </p>
            </div>

            {/* Speaking visualizer indicator */}
            {isSpeaking && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1" />
                <span>Идет воспроизведение...</span>
                <div className="flex items-end gap-0.5 h-4 ml-2">
                  <span className="w-1 bg-cyan-400 rounded-full animate-audio-1" />
                  <span className="w-1 bg-indigo-400 rounded-full animate-audio-2" />
                  <span className="w-1 bg-pink-400 rounded-full animate-audio-3" />
                  <span className="w-1 bg-cyan-400 rounded-full animate-audio-4" />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {VOICE_PERSONAS.map((persona) => {
              const isSelected = voiceSettings.personaId === persona.id;
              const isCurrentlyPlaying = isSpeaking && testingPersonaId === persona.id;

              return (
                <div
                  key={persona.id}
                  onClick={() => {
                    audioFx.playChime('bubble');
                    onUpdateSettings({
                      personaId: persona.id,
                      pitch: persona.defaultPitch,
                      rate: persona.defaultRate,
                    });
                  }}
                  className={`group relative flex flex-col justify-between p-5 rounded-3xl cursor-pointer transition-all duration-300 border text-left ${
                    isSelected
                      ? 'bg-slate-900/90 border-cyan-500/70 shadow-xl shadow-cyan-500/15 ring-2 ring-cyan-500/40'
                      : 'bg-slate-900/40 hover:bg-slate-900/70 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md bg-gradient-to-tr ${persona.color}`}
                        >
                          {persona.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-base leading-snug">
                              {persona.name}
                            </h3>
                            {isSelected && (
                              <span className="px-2 py-0.5 rounded-full bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold">
                                Активен
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-indigo-300/90 font-medium">
                            {persona.roleTitle}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow font-bold">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      {persona.description}
                    </p>
                  </div>

                  {/* Persona Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 mt-auto">
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                        persona.gender === 'female'
                          ? 'bg-pink-500/15 text-pink-300'
                          : persona.gender === 'male'
                          ? 'bg-blue-500/15 text-blue-300'
                          : 'bg-purple-500/15 text-purple-300'
                      }`}>
                        {persona.gender === 'female' ? 'Женский тембр' : persona.gender === 'male' ? 'Мужской тембр' : 'Кибернетический'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestPersona(persona);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        isCurrentlyPlaying
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 font-bold'
                      }`}
                      title="Прослушать образец этого голоса"
                    >
                      {isCurrentlyPlaying ? (
                        <>
                          <Square className="w-3 h-3 fill-current" />
                          <span>Стоп</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          <span>Слушать</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Installed System Voice Selector */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Установленные системные движки речи (OS Voices)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Найдено голосов в вашей операционной системе: {displayVoices.length}.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Язык фильтра:</span>
                <select
                  aria-label="Фильтр языка голосов"
                  value={language}
                  onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
                  className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500"
                >
                  <option value="ru">Русский (RU)</option>
                  <option value="en">English (US/UK)</option>
                  <option value="es">Español (ES)</option>
                  <option value="de">Deutsch (DE)</option>
                  <option value="zh">中文 (ZH)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                  Принудительно выбрать конкретный установленный голос:
                </label>
                <div className="relative">
                  <select
                    aria-label="Выбор конкретного системного голоса"
                    value={voiceSettings.selectedVoiceURI || ''}
                    onChange={(e) => {
                      const val = e.target.value || null;
                      onUpdateSettings({ selectedVoiceURI: val });
                    }}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="">
                      ✨ Автоматический интеллектуальный подбор под персонаж ({currentPersona.name})
                    </option>
                    {displayVoices.map((v) => (
                      <option key={(v as any).voiceURI || v.name} value={(v as any).voiceURI || v.name}>
                        {v.name} ({v.lang}) {v.default ? '★ По умолчанию' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {voiceSettings.selectedVoiceURI && (
              <div className="mt-3 flex items-center justify-between p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-300">
                <span>
                  Используется системный голос: <strong>{voiceSettings.selectedVoiceURI}</strong>
                </span>
                <button
                  onClick={() => onUpdateSettings({ selectedVoiceURI: null })}
                  className="text-[11px] underline text-cyan-400 hover:text-cyan-200 ml-2 font-medium"
                >
                  Вернуть авто-подбор
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Audio Equalizer, Sliders & Interactive Tester (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Fine Tuning Sliders Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-lg">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-4">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Тонкая настройка звучания</span>
            </h3>

            {/* Pitch Slider */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300">Высота тона (Pitch)</span>
                <span className="font-mono text-cyan-400 font-semibold">
                  {voiceSettings.pitch.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.7"
                step="0.05"
                value={voiceSettings.pitch}
                onChange={(e) => onUpdateSettings({ pitch: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Бас (0.5x)</span>
                <span>Стандарт (1.0x)</span>
                <span>Высокий (1.7x)</span>
              </div>
            </div>

            {/* Speed Rate Slider */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300">Скорость речи (Rate)</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {voiceSettings.rate.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.7"
                step="0.05"
                value={voiceSettings.rate}
                onChange={(e) => onUpdateSettings({ rate: parseFloat(e.target.value) })}
                className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Медленно</span>
                <span>Обычная</span>
                <span>Быстро</span>
              </div>
            </div>

            {/* Volume Slider */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300">Громкость (Volume)</span>
                <span className="font-mono text-purple-400 font-semibold">
                  {Math.round(voiceSettings.volume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={voiceSettings.volume}
                onChange={(e) => onUpdateSettings({ volume: parseFloat(e.target.value) })}
                className="w-full accent-purple-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Auto-Speak Toggle */}
            <div className="pt-4 border-t border-slate-800/80">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={voiceSettings.autoSpeakReplies}
                  onChange={(e) => onUpdateSettings({ autoSpeakReplies: e.target.checked })}
                  className="mt-0.5 rounded accent-cyan-500 w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-white block">
                    Автоматически озвучивать ответы в чате
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Каждое новое сообщение ассистента будет сразу произноситься выбранным голосом.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Interactive Speech Tester Sandbox */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-lg">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-3">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>Тестовая лаборатория фраз</span>
            </h3>

            <p className="text-xs text-slate-400 mb-3">
              Проверьте звучание текущего голоса ({currentPersona.name}) на произвольном тексте:
            </p>

            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none mb-3 shadow-inner"
            />

            <div className="flex gap-2">
              <button
                onClick={handleTestCustomText}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold transition shadow-md ${
                  isSpeaking
                    ? 'bg-rose-500 hover:bg-rose-600 text-white'
                    : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>Остановить речь</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>Озвучить текст ({currentPersona.name.split('/')[0].trim()})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
