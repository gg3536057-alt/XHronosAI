import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  CheckCheck,
  Code,
  Languages,
  FileText,
  Copy,
  Check,
  X,
  Command,
  Search,
  ArrowRight,
} from 'lucide-react';

interface ContextMenuWidgetProps {
  onRunAction: (actionTitle: string, selectedText: string, promptTemplate: string) => void;
}

export const ContextMenuWidget: React.FC<ContextMenuWidgetProps> = ({ onRunAction }) => {
  const [selectedText, setSelectedText] = useState('');
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');
  const [resultModal, setResultModal] = useState<{ title: string; content: string } | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);

  const actions = [
    {
      id: 'explain',
      title: 'Объясни простыми словами',
      icon: Sparkles,
      color: 'text-sky-400',
      prompt: 'Объясни подробно, понятно и доступно следующий фрагмент:',
    },
    {
      id: 'grammar',
      title: 'Исправь ошибки и пунктуацию',
      icon: CheckCheck,
      color: 'text-emerald-400',
      prompt: 'Исправь все орфографические, пунктуационные и стилистические ошибки в этом тексте, сохранив смысл:',
    },
    {
      id: 'code',
      title: 'Преобразуй в код / Рефакторинг',
      icon: Code,
      color: 'text-purple-400',
      prompt: 'Напиши качественный, чистый и производительный программный код по следующему описанию или оптимизируй данный фрагмент:',
    },
    {
      id: 'translate',
      title: 'Переведи (RU ↔ EN)',
      icon: Languages,
      color: 'text-pink-400',
      prompt: 'Переведи этот фрагмент (если на русском — переведи на качественный английский, если на иностранном — переведи на естественный русский):',
    },
    {
      id: 'summary',
      title: 'Краткая выжимка (TL;DR)',
      icon: FileText,
      color: 'text-amber-400',
      prompt: 'Сделай краткую, емкую выжимку в 3-5 ключевых тезисах:',
    },
  ];

  // Listen for text selection
  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 2) {
        setSelectedText(text);
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();

        if (rect) {
          // Position menu above selection, clamp to window
          const x = Math.min(Math.max(rect.left + rect.width / 2, 120), window.innerWidth - 140);
          const y = Math.max(rect.top - 48, 10);
          setMenuPosition({ x, y });
        }
      } else {
        setMenuPosition(null);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuPosition(null);
      }
    };

    // Global hotkey Alt+K or Ctrl+K for Command Palette
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === 'k') || (e.ctrlKey && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setMenuPosition(null);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const executeAction = async (action: (typeof actions)[0], text: string) => {
    setMenuPosition(null);
    setIsExecuting(true);
    setResultModal({ title: action.title, content: 'ИИ обрабатывает контекст...' });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', text: `${action.prompt}\n\n"${text}"` }],
          language: 'ru',
        }),
      });
      const data = await res.json();
      setResultModal({
        title: action.title,
        content: data.text || 'Не удалось получить ответ.',
      });
    } catch (err: any) {
      setResultModal({
        title: action.title,
        content: `Ошибка: ${err.message}`,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const copyResult = () => {
    if (resultModal) {
      navigator.clipboard.writeText(resultModal.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      {/* Floating Selection Bubble */}
      {menuPosition && selectedText && (
        <div
          ref={menuRef}
          style={{
            left: `${menuPosition.x}px`,
            top: `${menuPosition.y}px`,
            transform: 'translateX(-50%)',
          }}
          className="fixed z-50 flex items-center gap-1 p-1 bg-slate-900 border border-slate-700 shadow-2xl rounded-xl animate-in fade-in zoom-in duration-150 select-none"
        >
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => executeAction(act, selectedText)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1 text-[11px]"
                title={act.title}
              >
                <Icon className={`w-3.5 h-3.5 ${act.color}`} />
              </button>
            );
          })}
        </div>
      )}

      {/* Command Palette (Alt+K / Ctrl+K) */}
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="p-3 border-b border-slate-800 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                autoFocus
                value={paletteQuery}
                onChange={(e) => setPaletteQuery(e.target.value)}
                placeholder="Быстрое действие: выберите команду или введите текст..."
                className="flex-1 bg-transparent border-none text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
              />
              <kbd className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                ESC
              </kbd>
            </div>

            <div className="p-2 max-h-72 overflow-y-auto space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1">
                Быстрые действия ИИ
              </div>
              {actions.map((act) => {
                const Icon = act.icon;
                return (
                  <button
                    key={act.id}
                    onClick={() => {
                      setIsCommandPaletteOpen(false);
                      executeAction(act, paletteQuery || selectedText || 'Общий запрос');
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 text-left transition text-xs group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-800 group-hover:bg-slate-700">
                        <Icon className={`w-4 h-4 ${act.color}`} />
                      </div>
                      <span className="text-slate-200 font-medium">{act.title}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Result Modal for Quick Context Action */}
      {resultModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-xs sm:text-sm text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>{resultModal.title}</span>
              </h3>
              <button
                onClick={() => setResultModal(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto text-xs text-slate-200 leading-relaxed whitespace-pre-wrap flex-1">
              {resultModal.content}
            </div>

            <div className="p-3 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
              <button
                onClick={copyResult}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Скопировано' : 'Копировать'}</span>
              </button>

              <button
                onClick={() => setResultModal(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950"
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
