import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Square,
  Sparkles,
  Copy,
  Check,
  Download,
  Trash2,
  FileText,
  CheckSquare,
  Languages,
  Volume2,
  ListTodo,
  Calendar,
  Clock,
  Send,
  Wand2,
} from 'lucide-react';
import { AudioMemo, LanguageCode } from '../types';
import { audioFx } from '../services/audioFxEngine';

interface AudioMemoTranscriberViewProps {
  onSendToChat: (text: string) => void;
  onSpeakText: (text: string) => void;
  language: LanguageCode;
}

const MEMOS_STORAGE_KEY = 'omniai_audio_memos';

export const AudioMemoTranscriberView: React.FC<AudioMemoTranscriberViewProps> = ({
  onSendToChat,
  onSpeakText,
  language,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcriptText, setTranscriptText] = useState('');
  const [copied, setCopied] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [aiOutputType, setAiOutputType] = useState<string>('');

  const [savedMemos, setSavedMemos] = useState<AudioMemo[]>(() => {
    try {
      const data = localStorage.getItem(MEMOS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  const timerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const startRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Ваш браузер не поддерживает встроенное распознавание речи Web Speech API.');
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = language === 'ru' ? 'ru-RU' : 'en-US';

      rec.onresult = (event: any) => {
        let full = '';
        for (let i = 0; i < event.results.length; i++) {
          full += event.results[i][0].transcript + ' ';
        }
        setTranscriptText(full.trim());
      };

      rec.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
      };

      rec.start();
      recognitionRef.current = rec;
      setIsRecording(true);
      setRecordingSeconds(0);
      setAiOutput(null);
      audioFx.playChime('activate');

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      alert('Ошибка доступа к микрофону');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
    audioFx.playChime('bubble');
  };

  const handleSaveMemo = () => {
    if (!transcriptText.trim()) return;
    const memo: AudioMemo = {
      id: `memo-${Date.now()}`,
      title: transcriptText.slice(0, 35) + (transcriptText.length > 35 ? '...' : ''),
      transcript: transcriptText,
      summary: aiOutputType === 'summary' && aiOutput ? aiOutput : undefined,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationSeconds: recordingSeconds,
      language,
      tags: ['голос', 'транскрипт'],
    };
    const updated = [memo, ...savedMemos];
    setSavedMemos(updated);
    try {
      localStorage.setItem(MEMOS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    audioFx.playChime('success');
  };

  const handleDeleteMemo = (id: string) => {
    const updated = savedMemos.filter((m) => m.id !== id);
    setSavedMemos(updated);
    try {
      localStorage.setItem(MEMOS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    audioFx.playChime('bubble');
  };

  // AI Quick Actions
  const runAIAction = async (actionType: 'summary' | 'todo' | 'business' | 'translate') => {
    if (!transcriptText.trim()) return;
    setIsProcessingAI(true);
    setAiOutputType(actionType);
    audioFx.playChime('activate');

    try {
      let prompt = '';
      if (actionType === 'summary') {
        prompt = `Сделай краткое структурированное саммари (3 ключевых тезиса) следующего текста голосовой заметки:\n\n"${transcriptText}"`;
      } else if (actionType === 'todo') {
        prompt = `Выдели все задачи, поручения и конкретные To-Do шаги с чекбоксами из следующей голосовой заметки:\n\n"${transcriptText}"`;
      } else if (actionType === 'business') {
        prompt = `Перепиши этот текст устной речи в аккуратный, лаконичный деловой отчет/письмо без слов-паразитов:\n\n"${transcriptText}"`;
      } else if (actionType === 'translate') {
        prompt = `Переведи этот текст на безупречный деловой английский язык:\n\n"${transcriptText}"`;
      }

      // Call API
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const data = await res.json();
      setAiOutput(data.reply || 'Не удалось обработать');
      audioFx.playChime('success');
    } catch (err: any) {
      setAiOutput(`Ошибка обработки: ${err.message}`);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    audioFx.playChime('success');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-slate-950 text-slate-100">
      {/* Left Column: Recording Studio */}
      <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto space-y-5">
        {/* Header Banner */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-cyan-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold mb-2">
              <Mic className="w-3.5 h-3.5" />
              <span>Голосовой Транскрибатор 3.0</span>
            </span>
            <h2 className="text-xl font-extrabold text-white">
              Запись речи, расшифровка и ИИ-анализ
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Надиктуйте мысль, задачу или конспект встречи. ИИ моментально расшифрует речь, выделит задачи или подготовит официальный отчет.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-red-500/25 transition hover:scale-105"
              >
                <Mic className="w-4 h-4 animate-pulse" />
                <span>Начать запись</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-red-400 border border-red-500/40 font-bold text-xs sm:text-sm transition shadow-lg"
              >
                <Square className="w-4 h-4 fill-red-400" />
                <span>Остановить ({formatTime(recordingSeconds)})</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Audio Visualizer (while recording) */}
        {isRecording && (
          <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-bold text-red-300">Идет прямая запись звука...</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-6 rounded-full bg-red-400 animate-audio-1" />
              <span className="w-1.5 h-8 rounded-full bg-pink-400 animate-audio-2" />
              <span className="w-1.5 h-5 rounded-full bg-red-400 animate-audio-3" />
              <span className="w-1.5 h-7 rounded-full bg-pink-400 animate-audio-4" />
              <span className="w-1.5 h-4 rounded-full bg-red-400 animate-audio-5" />
            </div>
            <span className="text-xs font-mono font-bold text-red-300">
              {formatTime(recordingSeconds)}
            </span>
          </div>
        )}

        {/* Transcript Box */}
        <div className="flex-1 flex flex-col rounded-3xl bg-slate-900/60 border border-slate-800/80 p-5 shadow-inner space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
            <span className="font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" /> Текст расшифровки:
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-cyan-400 text-[11px]">
                {transcriptText.length} симв.
              </span>
              <button
                onClick={() => handleCopyText(transcriptText)}
                disabled={!transcriptText}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 transition"
                title="Копировать"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleSaveMemo}
                disabled={!transcriptText}
                className="px-3 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold disabled:opacity-40 transition"
              >
                Сохранить заметку
              </button>
            </div>
          </div>

          <textarea
            value={transcriptText}
            onChange={(e) => setTranscriptText(e.target.value)}
            placeholder="Здесь появится расшифрованный текст при диктовке в микрофон, либо вы можете вставить текст вручную..."
            className="flex-1 w-full bg-transparent text-xs sm:text-sm text-slate-200 leading-relaxed resize-none focus:outline-none placeholder-slate-600 min-h-[140px]"
          />

          {/* Quick AI Action Buttons */}
          <div className="pt-3 border-t border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
              ИИ-обработка текста в 1 клик:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => runAIAction('summary')}
                disabled={!transcriptText || isProcessingAI}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 disabled:opacity-50 text-left border border-slate-700/60 transition group"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-cyan-300 mb-1">
                  <Sparkles className="w-3.5 h-3.5" /> Выжимка
                </div>
                <span className="text-[10px] text-slate-400">3 главных тезиса</span>
              </button>

              <button
                onClick={() => runAIAction('todo')}
                disabled={!transcriptText || isProcessingAI}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 disabled:opacity-50 text-left border border-slate-700/60 transition group"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-300 mb-1">
                  <ListTodo className="w-3.5 h-3.5" /> Задачи
                </div>
                <span className="text-[10px] text-slate-400">To-Do чек-лист</span>
              </button>

              <button
                onClick={() => runAIAction('business')}
                disabled={!transcriptText || isProcessingAI}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 disabled:opacity-50 text-left border border-slate-700/60 transition group"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-purple-300 mb-1">
                  <FileText className="w-3.5 h-3.5" /> Отчет
                </div>
                <span className="text-[10px] text-slate-400">Деловой стиль</span>
              </button>

              <button
                onClick={() => runAIAction('translate')}
                disabled={!transcriptText || isProcessingAI}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 disabled:opacity-50 text-left border border-slate-700/60 transition group"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-300 mb-1">
                  <Languages className="w-3.5 h-3.5" /> Перевод
                </div>
                <span className="text-[10px] text-slate-400">English Pro</span>
              </button>
            </div>
          </div>
        </div>

        {/* AI Result Card */}
        {isProcessingAI && (
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 flex items-center gap-3 animate-pulse">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-spin" />
            <span className="text-xs text-cyan-200 font-semibold">
              ИИ анализирует аудиозаметку и генерирует структурированный ответ...
            </span>
          </div>
        )}

        {aiOutput && !isProcessingAI && (
          <div className="p-5 rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Результат ИИ-обработки:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSpeakText(aiOutput)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
                  title="Озвучить ответ"
                >
                  <Volume2 className="w-3.5 h-3.5 text-pink-400" />
                </button>
                <button
                  onClick={() => onSendToChat(aiOutput)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
                  title="Перенести в Чат"
                >
                  <Send className="w-3.5 h-3.5 text-cyan-400" />
                </button>
              </div>
            </div>
            <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
              {aiOutput}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Audio Memo Archive */}
      <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-800 bg-slate-900/40 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="font-bold text-xs text-slate-300 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" /> Сохраненные заметки
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
            {savedMemos.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {savedMemos.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              Архив пуст. Надиктуйте текст и нажмите «Сохранить заметку».
            </div>
          ) : (
            savedMemos.map((m) => (
              <div
                key={m.id}
                onClick={() => setTranscriptText(m.transcript)}
                className="p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition group"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-bold text-xs text-white line-clamp-1 group-hover:text-cyan-300 transition">
                    {m.title}
                  </h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMemo(m.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 p-0.5 transition"
                    title="Удалить"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2">
                  {m.transcript}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>{m.createdAt}</span>
                  <span className="font-mono text-cyan-400">{m.durationSeconds}с</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
