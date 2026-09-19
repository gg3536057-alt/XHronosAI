import React from 'react';
import {
  Laptop,
  Smartphone,
  Eye,
  Mic,
  Rocket,
  Download,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  X,
  ExternalLink,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, install } = usePWAInstall();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-white">
                Инструкция: Что куда нажимать на ПК и Телефоне
              </h2>
              <p className="text-xs text-slate-400">
                Полное руководство по установке, возможностям и управлению
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed">
          {/* Section 1: Android Setup */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-pink-400">
              <Smartphone className="w-5 h-5" />
              <span>1. Как установить и пользоваться на телефоне (Android / iOS)</span>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-slate-300">
              <li>
                <strong>Установка в 1 клик (Android):</strong> Откройте приложение в Google Chrome на телефоне. Вверху или в меню браузера (три точки) нажмите <span className="text-sky-300 font-semibold">«Установить приложение»</span> или <span className="text-sky-300 font-semibold">«Добавить на главный экран»</span>. Появится полноценная иконка приложения на рабочем столе телефона!
              </li>
              <li>
                <strong>Для iPhone (iOS):</strong> Откройте в Safari $\rightarrow$ кнопка «Поделиться» (квадрат со стрелкой) $\rightarrow$ «На экран Домой».
              </li>
              <li>
                <strong>Слежение за экраном на телефоне:</strong> Сделайте скриншот любого приложения на телефоне (зажмите кнопку питания + уменьшение громкости) $\rightarrow$ перейдите во вкладку <span className="text-sky-300 font-semibold">«Зрение экрана»</span> $\rightarrow$ нажмите <span className="text-pink-300 font-semibold">«Скриншот с Android»</span> $\rightarrow$ ИИ моментально прочитает происходящее на экране и подскажет ответ!
              </li>
              <li>
                <strong>Голосовой разговор без рук:</strong> Нажмите на иконку <span className="text-indigo-300 font-semibold">«Голос»</span> в шапке или в меню. Говорите свободно на русском или любом языке — ассистент сам отвечает вслух и слушает продолжение.
              </li>
            </ol>
          </div>

          {/* Section 2: PC Setup */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-sky-400">
              <Laptop className="w-5 h-5" />
              <span>2. Как пользоваться на ПК (Windows, macOS, Linux)</span>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-slate-300">
              <li>
                <strong>Установка как отдельное окно:</strong> Нажмите кнопку <span className="text-emerald-400 font-semibold">«Установить»</span> в правом верхнем углу шапки. Программа установится как автономное десктопное приложение с ярлыком на панели задач.
              </li>
              <li>
                <strong>Слежение за экраном ПК в реальном времени:</strong> Перейдите во вкладку <span className="text-sky-300 font-semibold">«Зрение экрана»</span> $\rightarrow$ нажмите <span className="text-sky-300 font-semibold">«Захватить экран ПК»</span> $\rightarrow$ выберите весь экран или конкретное окно программы $\rightarrow$ ИИ сразу увидит открытый код, браузер или документ.
              </li>
              <li>
                <strong>Запуск программ по запросу:</strong> Перейдите во вкладку <span className="text-emerald-300 font-semibold">«Запуск программ»</span> или введите фразу типа <em>«открой телеграм»</em> или <em>«запусти музыку»</em> $\rightarrow$ система активирует запуск нужного софта через протоколы Windows/Linux.
              </li>
              <li>
                <strong>Контекстное меню и горячие клавиши:</strong> Выделите мышкой любой фрагмент текста $\rightarrow$ появится всплывающее меню быстрых действий ИИ. В любой момент нажмите <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-sky-300 font-mono">Alt + K</kbd> для вызова командной строки!
              </li>
            </ol>
          </div>

          {/* Section 3: Summary of Free AI capabilities */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-purple-400">
              <Sparkles className="w-5 h-5" />
              <span>3. Бесплатные функции на базе ИИ (альтернатива ChatGPT и Grok)</span>
            </div>
            <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
              <li><strong>Чат и рассуждения (Thinking):</strong> поддержка больших запросов, кода, формул, файлов и анализа изображений.</li>
              <li><strong>Поиск в сети (Google Grounding):</strong> актуальная информация без галлюцинаций с ссылками на первоисточники.</li>
              <li><strong>AI Image Studio:</strong> создание иллюстраций и арта в стилях Фотореализм, Киберпанк, 3D и Аниме.</li>
              <li><strong>Мультиязычность:</strong> мгновенный перевод и речь на русском, английском, немецком, испанском и китайском языках.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          {isInstallable && (
            <button
              onClick={install}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition"
            >
              <Download className="w-4 h-4" />
              <span>Установить приложение прямо сейчас</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto px-5 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 transition"
          >
            Понятно, к работе!
          </button>
        </div>
      </div>
    </div>
  );
};
