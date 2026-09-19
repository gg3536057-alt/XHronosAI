import React from 'react';
import {
  X,
  Eye,
  Type,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Keyboard,
  Check,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { UserComfortSettings } from '../types';
import { audioFx } from '../services/audioFxEngine';

interface ComfortSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  comfort: UserComfortSettings;
  onUpdateComfort: (newSettings: Partial<UserComfortSettings>) => void;
  colorScheme: 'slate' | 'warm' | 'oled';
  onUpdateColorScheme: (theme: 'slate' | 'warm' | 'oled') => void;
}

export const ComfortSettingsModal: React.FC<ComfortSettingsModalProps> = ({
  isOpen,
  onClose,
  comfort,
  onUpdateComfort,
  colorScheme,
  onUpdateColorScheme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Background glow */}
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Центр Комфорта и Эргономики</h2>
              <p className="text-xs text-slate-400">Настройки для снижения усталости глаз и удобства работы</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1 relative z-10 text-xs">
          {/* Font Scaling */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-white flex items-center gap-2">
                <Type className="w-4 h-4 text-cyan-400" /> Размер шрифта и масштабирование
              </span>
              <span className="text-slate-400 font-mono font-semibold">
                {comfort.fontSize === 'sm' ? 'Компактный' : comfort.fontSize === 'md' ? 'Стандартный' : 'Крупный'}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] mb-3 leading-relaxed">
              Увеличьте текст для комфортного чтения без утомления зрения при долгой работе.
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  audioFx.playChime('bubble');
                  onUpdateComfort({ fontSize: 'sm' });
                }}
                className={`py-2 px-3 rounded-xl border text-center font-bold transition ${
                  comfort.fontSize === 'sm'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                A <span className="text-[10px] font-normal block text-slate-400">Компакт (13px)</span>
              </button>
              <button
                onClick={() => {
                  audioFx.playChime('bubble');
                  onUpdateComfort({ fontSize: 'md' });
                }}
                className={`py-2 px-3 rounded-xl border text-center font-bold transition ${
                  comfort.fontSize === 'md'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                A+ <span className="text-[10px] font-normal block text-slate-400">Стандарт (15px)</span>
              </button>
              <button
                onClick={() => {
                  audioFx.playChime('bubble');
                  onUpdateComfort({ fontSize: 'lg' });
                }}
                className={`py-2 px-3 rounded-xl border text-center font-bold transition ${
                  comfort.fontSize === 'lg'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                A++ <span className="text-[10px] font-normal block text-slate-400">Крупный (17px)</span>
              </button>
            </div>
          </div>

          {/* Color Temperature & Eye Comfort */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4">
            <span className="font-bold text-white flex items-center gap-2 mb-2">
              <Moon className="w-4 h-4 text-indigo-400" /> Цветовая палитра для глаз
            </span>
            <p className="text-slate-400 text-[11px] mb-3 leading-relaxed">
              Выберите мягкий оттенок темной темы:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  audioFx.playChime('bubble');
                  onUpdateColorScheme('slate');
                }}
                className={`p-3 rounded-xl border text-left transition ${
                  colorScheme === 'slate'
                    ? 'bg-indigo-950/50 border-cyan-500/60 shadow-md ring-1 ring-cyan-500/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="font-bold text-slate-200 block text-xs">🌌 Глубокий Slate</span>
                <span className="text-[10px] text-slate-400">Технологичный</span>
              </button>
              <button
                onClick={() => {
                  audioFx.playChime('bubble');
                  onUpdateColorScheme('warm');
                }}
                className={`p-3 rounded-xl border text-left transition ${
                  colorScheme === 'warm'
                    ? 'bg-amber-950/40 border-amber-500/60 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="font-bold text-amber-200 block text-xs">☕ Теплый Вечер</span>
                <span className="text-[10px] text-amber-400/80">Без синего света</span>
              </button>
              <button
                onClick={() => {
                  audioFx.playChime('bubble');
                  onUpdateColorScheme('oled');
                }}
                className={`p-3 rounded-xl border text-left transition ${
                  colorScheme === 'oled'
                    ? 'bg-black border-slate-600 shadow-md ring-1 ring-white/20'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="font-bold text-white block text-xs">🌑 OLED Black</span>
                <span className="text-[10px] text-slate-400">Макс. контраст</span>
              </button>
            </div>
          </div>

          {/* Sound FX Switcher */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="font-bold text-white flex items-center gap-2">
                {comfort.soundEffects ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                <span>Звуковые отклики интерфейса</span>
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                Мягкие звуки при клике, отправке сообщений и переключении экранов.
              </p>
            </div>
            <button
              onClick={() => {
                const nextVal = !comfort.soundEffects;
                onUpdateComfort({ soundEffects: nextVal });
                if (nextVal) audioFx.playChime('success');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition text-xs ${
                comfort.soundEffects
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {comfort.soundEffects ? 'Включены' : 'Выключены'}
            </button>
          </div>

          {/* Keyboard Shortcuts Cheatsheet */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4">
            <span className="font-bold text-white flex items-center gap-2 mb-2.5">
              <Keyboard className="w-4 h-4 text-purple-400" /> Горячие клавиши для скорости (ПК)
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Отправить запрос:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-cyan-300 text-[10px]">Enter</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Новая строка:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-cyan-300 text-[10px]">Shift+Enter</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Быстрые действия:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-cyan-300 text-[10px]">Alt+K</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Остановить голос / Закрыть:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-cyan-300 text-[10px]">Esc</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 mt-2 border-t border-slate-800/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-md shadow-cyan-500/20"
          >
            Применить и закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
