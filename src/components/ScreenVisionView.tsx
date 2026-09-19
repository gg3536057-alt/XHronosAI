import React, { useState, useEffect } from 'react';
import {
  Eye,
  Monitor,
  Smartphone,
  Play,
  Square,
  Camera,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Send,
  Upload,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useScreenCapture } from '../hooks/useScreenCapture';

interface ScreenVisionViewProps {
  onSendToChat: (text: string, image?: string) => void;
  onOpenAppLauncher: () => void;
}

export const ScreenVisionView: React.FC<ScreenVisionViewProps> = ({
  onSendToChat,
  onOpenAppLauncher,
}) => {
  const {
    isCapturing,
    snapshot,
    error,
    supportsDisplayMedia,
    startScreenCapture,
    stopScreenCapture,
    takeSnapshot,
    setManualImage,
  } = useScreenCapture();

  const [customPrompt, setCustomPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [analysisTime, setAnalysisTime] = useState<string | null>(null);
  const [autoScanSec, setAutoScanSec] = useState<number>(0);
  const [analysisMode, setAnalysisMode] = useState<'general' | 'code' | 'action'>('general');

  // Handle auto-scan timer
  useEffect(() => {
    if (!isCapturing || autoScanSec <= 0) return;

    const interval = setInterval(async () => {
      const currentSnap = takeSnapshot();
      if (currentSnap && !isAnalyzing) {
        handleAnalyze(currentSnap);
      }
    }, autoScanSec * 1000);

    return () => clearInterval(interval);
  }, [isCapturing, autoScanSec, isAnalyzing, takeSnapshot]);

  const handleAnalyze = async (imgToAnalyze?: string) => {
    const targetImage = imgToAnalyze || snapshot;
    if (!targetImage) return;

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/vision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: targetImage,
          query: customPrompt || 'Проанализируй экран: что здесь происходит, есть ли ошибки, и какие действия предпринять дальше?',
          mode: analysisMode,
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAnalysisResult(data.analysis);
        setAnalysisTime(new Date().toLocaleTimeString());
      } else {
        setAnalysisResult(data.error || 'Не удалось получить анализ экрана.');
      }
    } catch (err: any) {
      setAnalysisResult(`Ошибка сети: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleMobileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setManualImage(dataUrl);
      handleAnalyze(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-950 p-4 space-y-4">
      {/* Header card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                Screen Vision — Слежение и анализ экрана
                {isCapturing && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                    LIVE STREAMING
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                ИИ видит ваши окна, код, браузер, ошибки консоли или приложение на смартфоне. Делайте моментальные снимки экрана или включите непрерывный мониторинг.
              </p>
            </div>
          </div>

          {/* PC Screen Capture Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {supportsDisplayMedia ? (
              isCapturing ? (
                <button
                  onClick={stopScreenCapture}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white transition shadow-sm"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Остановить захват</span>
                </button>
              ) : (
                <button
                  onClick={startScreenCapture}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/20 transition"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Захватить экран ПК</span>
                </button>
              )
            ) : (
              <div className="text-xs text-amber-400 bg-amber-500/10 px-3 py-2 rounded-xl border border-amber-500/30">
                Захват экрана доступен в браузере ПК
              </div>
            )}

            {/* Android / Mobile Screenshot upload */}
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer">
              <Smartphone className="w-3.5 h-3.5 text-pink-400" />
              <span>Скриншот с Android</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleMobileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Scan interval & Mode configuration */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Режим анализа:</span>
            <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
              <button
                onClick={() => setAnalysisMode('general')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                  analysisMode === 'general' ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Общий
              </button>
              <button
                onClick={() => setAnalysisMode('code')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                  analysisMode === 'code' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Код & Ошибки
              </button>
              <button
                onClick={() => setAnalysisMode('action')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                  analysisMode === 'action' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Действие & Запуск
              </button>
            </div>
          </div>

          {isCapturing && (
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Авто-скан:</span>
              <select
                aria-label="Интервал авто-сканирования экрана"
                value={autoScanSec}
                onChange={(e) => setAutoScanSec(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
              >
                <option value={0}>Выключен (по кнопке)</option>
                <option value={15}>Каждые 15 сек</option>
                <option value={30}>Каждые 30 сек</option>
                <option value={60}>Каждые 60 сек</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/15 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Vision Workspace (Split view: Screen Preview + AI Analysis) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* Left: Screen Snapshot & Quick Trigger */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-sky-400" /> Текущий снимок экрана
              </span>
              {snapshot && (
                <button
                  onClick={() => takeSnapshot()}
                  disabled={!isCapturing}
                  className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 disabled:opacity-40"
                >
                  <RefreshCw className="w-3 h-3" /> Обновить кадр
                </button>
              )}
            </div>

            {snapshot ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-black aspect-video max-h-80 flex items-center justify-center">
                <img
                  src={snapshot}
                  alt="Экран пользователя"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center flex flex-col items-center justify-center h-64 bg-slate-950/40">
                <Monitor className="w-10 h-10 text-slate-600 mb-3" />
                <p className="text-xs text-slate-400 font-medium mb-1">Экран пока не захвачен</p>
                <p className="text-[11px] text-slate-500 max-w-xs">
                  Нажмите «Захватить экран ПК» вверху или загрузите скриншот со смартфона Android.
                </p>
              </div>
            )}
          </div>

          {/* Quick Query Input */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Что спросить по экрану? (например: найди ошибку, объясни формулу)..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
              <button
                onClick={() => handleAnalyze()}
                disabled={!snapshot || isAnalyzing}
                className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shrink-0 shadow-sm"
              >
                {isAnalyzing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Анализ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: AI Vision Output & Insights */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Вердикт и рекомендации ИИ
              </span>
              {analysisTime && (
                <span className="text-[10px] text-slate-500">Обновлено: {analysisTime}</span>
              )}
            </div>

            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 min-h-[220px] max-h-[380px] overflow-y-auto text-xs leading-relaxed text-slate-200">
              {isAnalyzing ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <Sparkles className="w-8 h-8 text-sky-400 animate-spin mb-3" />
                  <p className="text-xs font-semibold text-slate-300">Изучаю визуальный контекст экрана...</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Распознаю активные элементы, текст, код и интерфейсы.
                  </p>
                </div>
              ) : analysisResult ? (
                <div className="whitespace-pre-wrap">{analysisResult}</div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-500">
                  <Eye className="w-8 h-8 text-slate-700 mb-2" />
                  <p className="text-xs">Нажмите «Анализ», чтобы получить разбор экрана от ИИ.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Context Actions based on Screen */}
          {analysisResult && (
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
              <button
                onClick={() => onSendToChat(`Анализ экрана: ${analysisResult}`, snapshot || undefined)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition"
              >
                <Send className="w-3 h-3" />
                <span>Обсудить в чате</span>
              </button>

              <button
                onClick={onOpenAppLauncher}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 transition"
              >
                <span>Открыть программу для задачи</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
