import React, { useState, useEffect } from 'react';
import { 
  WifiOff, 
  Cpu, 
  Database, 
  HardDrive, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Play,
  RotateCcw
} from 'lucide-react';
import { offlineAI } from '../services/offlineEngine';

export const OfflineHubView: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedItemsCount, setCachedItemsCount] = useState(0);
  const [testInput, setTestInput] = useState('25 * 400 + sqrt(144) - (35 / 7)');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check localStorage items
    setCachedItemsCount(localStorage.length);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRunOfflineTest = async () => {
    setIsEvaluating(true);
    try {
      const res = await offlineAI.processOffline(testInput, [], 'ru');
      setTestResult(res.text);
    } catch (e: any) {
      setTestResult(`Ошибка: ${e.message}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleClearLocalCache = () => {
    if (window.confirm('Очистить локальный кэш приложения (историю диалогов и настройки)?')) {
      localStorage.clear();
      setCachedItemsCount(0);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <WifiOff className="w-5 h-5" />
              </span>
              <h1 className="text-lg font-bold">Автономный режим (Zero-Cloud Offline)</h1>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              OmniAI Workstation спроектирован для бесперебойной работы даже при полном отсутствии интернета: в самолете, в бункере или при сбоях связи.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="font-medium text-slate-300">
                {isOnline ? 'Сеть подключена' : 'Офлайн (Изоляция)'}
              </span>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold">Локальный эвристический движок</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Выполняет синтаксический анализ кода, математические расчеты, проверку JSON, форматирование текста в изолированной среде V8.
            </p>
            <div className="pt-2 text-[11px] text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Задержка: &lt;1 мс
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold">Локальная память и PWA</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Все диалоги, созданные скрипты и сохраненные параметры пишутся в локальное защищенное хранилище браузера (IndexedDB/LocalStorage).
            </p>
            <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Записей в кэше: {cachedItemsCount}</span>
              <button 
                onClick={handleClearLocalCache}
                className="text-red-400 hover:text-red-300 flex items-center gap-0.5"
              >
                <RotateCcw className="w-3 h-3" /> Сбросить
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold">Полная приватность (Air-Gapped)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              При работе в офлайн-режиме ваши файлы, пароли и токены никогда не покидают пределы оперативной памяти вашего устройства.
            </p>
            <div className="pt-2 text-[11px] text-purple-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Безопасность 100%
            </div>
          </div>
        </div>

        {/* Live Offline Engine Playground */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold">Тестирование автономного ИИ-движка</h2>
            </div>
            <span className="text-xs text-slate-500">Без отправки HTTP-запросов</span>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Введите запрос, формулу или код..."
                className="flex-1 px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
              />
              <button
                onClick={handleRunOfflineTest}
                disabled={isEvaluating}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium text-xs rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {isEvaluating ? 'Обработка...' : 'Тест'}
              </button>
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-1.5">
              {[
                '25 * 400 + sqrt(144) - (35 / 7)',
                '{"status":"ready","nodes":12}',
                'Сгенерируй надежный пароль',
                'Какое сейчас системное время?',
                'const x: number = 42; console.log(x);',
                'Что ты умеешь в офлайн-режиме?'
              ].map((sample, i) => (
                <button
                  key={i}
                  onClick={() => setTestInput(sample)}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700/80 transition-colors"
                >
                  {sample.length > 25 ? sample.slice(0, 25) + '...' : sample}
                </button>
              ))}
            </div>

            {testResult && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-wrap">
                {testResult}
              </div>
            )}
          </div>
        </div>

        {/* Offline Readiness Matrix */}
        <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/80 space-y-3">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Матрица готовности модулей к автономной работе
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/50">
              <span className="text-slate-300">Инструменты (100+ функций)</span>
              <span className="text-emerald-400 font-mono text-[11px]">100% Офлайн</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/50">
              <span className="text-slate-300">Синтез речи (TTS)</span>
              <span className="text-emerald-400 font-mono text-[11px]">Системный</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/50">
              <span className="text-slate-300">Распознавание речи (STT)</span>
              <span className="text-amber-400 font-mono text-[11px]">Браузерное</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/50">
              <span className="text-slate-300">Снимок экрана & OCR</span>
              <span className="text-emerald-400 font-mono text-[11px]">Локальный холст</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/50">
              <span className="text-slate-300">Лаунчер приложений ПК/Android</span>
              <span className="text-emerald-400 font-mono text-[11px]">100% Офлайн</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/50">
              <span className="text-slate-300">Облачный Gemini 2.5 Flash</span>
              <span className="text-cyan-400 font-mono text-[11px]">Требует сеть</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
