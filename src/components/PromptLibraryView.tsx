import React, { useState, useMemo } from 'react';
import {
  Search,
  Sparkles,
  Send,
  Copy,
  Check,
  Bookmark,
  Plus,
  Trash2,
  Code,
  PenTool,
  Brain,
  Briefcase,
  Play,
  Sliders,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { PromptItem, PromptCategory } from '../types';
import { PROMPTS_DATA, PROMPT_CATEGORIES } from '../data/promptLibraryData';
import { audioFx } from '../services/audioFxEngine';

interface PromptLibraryViewProps {
  onSendToChat: (promptText: string) => void;
}

const CUSTOM_PROMPTS_KEY = 'omniai_custom_prompts';

export const PromptLibraryView: React.FC<PromptLibraryViewProps> = ({ onSendToChat }) => {
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePrompt, setActivePrompt] = useState<PromptItem>(PROMPTS_DATA[0]);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);

  // Custom user prompts
  const [customPrompts, setCustomPrompts] = useState<PromptItem[]>(() => {
    try {
      const data = localStorage.getItem(CUSTOM_PROMPTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  // Form state for creating custom prompt
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<PromptCategory>('coding');
  const [newDescription, setNewDescription] = useState('');
  const [newTemplate, setNewTemplate] = useState('');
  const [newTags, setNewTags] = useState('');

  // Combine built-in and custom
  const allPrompts = useMemo(() => {
    return [...customPrompts, ...PROMPTS_DATA];
  }, [customPrompts]);

  const filteredPrompts = useMemo(() => {
    return allPrompts.filter((p) => {
      const matchCat =
        selectedCategory === 'all' ||
        (selectedCategory === 'custom' ? p.isCustom : p.category === selectedCategory);
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [allPrompts, selectedCategory, searchQuery]);

  // Compute final prompt text by replacing variables
  const renderedPrompt = useMemo(() => {
    let result = activePrompt.template;
    if (activePrompt.variables) {
      activePrompt.variables.forEach((v) => {
        const val = variableValues[v.name] ?? v.defaultValue ?? '';
        const pattern = new RegExp(`\\{\\{${v.name}\\}\\}`, 'g');
        result = result.replace(pattern, val);
      });
    }
    return result;
  }, [activePrompt, variableValues]);

  const handleSelectPrompt = (prompt: PromptItem) => {
    audioFx.playChime('bubble');
    setActivePrompt(prompt);
    // Initialize default values
    const defaults: Record<string, string> = {};
    if (prompt.variables) {
      prompt.variables.forEach((v) => {
        defaults[v.name] = v.defaultValue || '';
      });
    }
    setVariableValues(defaults);
  };

  const handleCopy = () => {
    audioFx.playChime('success');
    navigator.clipboard.writeText(renderedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecuteInChat = () => {
    audioFx.playChime('activate');
    onSendToChat(renderedPrompt);
  };

  const handleSaveCustomPrompt = () => {
    if (!newTitle.trim() || !newTemplate.trim()) return;
    const newP: PromptItem = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      description: newDescription.trim() || 'Пользовательский промпт',
      template: newTemplate.trim(),
      tags: newTags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      isCustom: true,
    };
    const updated = [newP, ...customPrompts];
    setCustomPrompts(updated);
    try {
      localStorage.setItem(CUSTOM_PROMPTS_KEY, JSON.stringify(updated));
    } catch {}
    setActivePrompt(newP);
    setIsCreatingCustom(false);
    setNewTitle('');
    setNewDescription('');
    setNewTemplate('');
    setNewTags('');
    audioFx.playChime('success');
  };

  const handleDeleteCustomPrompt = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customPrompts.filter((p) => p.id !== id);
    setCustomPrompts(updated);
    try {
      localStorage.setItem(CUSTOM_PROMPTS_KEY, JSON.stringify(updated));
    } catch {}
    if (activePrompt.id === id) {
      setActivePrompt(PROMPTS_DATA[0]);
    }
    audioFx.playChime('bubble');
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-slate-950 text-slate-100">
      {/* Left Sidebar: Prompt Catalog */}
      <div className="w-full md:w-84 lg:w-96 border-r border-slate-800 flex flex-col bg-slate-900/50 shrink-0">
        {/* Header & Search */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold tracking-wide">Промпт-Лаборатория</h2>
            </div>
            <button
              onClick={() => setIsCreatingCustom(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Создать</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Поиск по названию или тегам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-slate-200 placeholder-slate-500"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              Все ({allPrompts.length})
            </button>
            {PROMPT_CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition ${
                  selectedCategory === c.id
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
          {filteredPrompts.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Ничего не найдено по запросу «{searchQuery}»
            </div>
          ) : (
            filteredPrompts.map((p) => {
              const isSelected = activePrompt.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectPrompt(p)}
                  className={`p-3 rounded-2xl cursor-pointer transition border text-left group ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-950/80 to-slate-900 border-cyan-500/60 shadow-md ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/40 hover:bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-xs text-white group-hover:text-cyan-300 transition line-clamp-1">
                      {p.title}
                    </h3>
                    {p.isCustom ? (
                      <button
                        onClick={(e) => handleDeleteCustomPrompt(p.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 transition p-0.5"
                        title="Удалить мой промпт"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono shrink-0">
                        {p.category}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2">
                    {p.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {p.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-800/70 text-slate-400"
                      >
                        #{t}
                      </span>
                    ))}
                    {p.variables && p.variables.length > 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono ml-auto">
                        {p.variables.length} перем.
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Prompt Workspace & Live Variable Fill */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 p-4 sm:p-6">
        <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Prompt Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold uppercase">
                  {activePrompt.category}
                </span>
                {activePrompt.isCustom && (
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                    Мой кастомный
                  </span>
                )}
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-white">
                {activePrompt.title}
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                {activePrompt.description}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700/60"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Скопировано</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Копировать</span>
                  </>
                )}
              </button>

              <button
                onClick={handleExecuteInChat}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs transition shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Запустить в Чат</span>
              </button>
            </div>
          </div>

          {/* Variables Input Section (if prompt has parameters) */}
          {activePrompt.variables && activePrompt.variables.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Параметры и переменные шаблона:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activePrompt.variables.map((v) => (
                  <div key={v.name} className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 block">
                      {v.label}
                    </label>
                    <input
                      type="text"
                      placeholder={v.placeholder}
                      value={variableValues[v.name] ?? v.defaultValue ?? ''}
                      onChange={(e) =>
                        setVariableValues({ ...variableValues, [v.name]: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rendered Prompt Preview */}
          <div className="flex-1 flex flex-col rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden shadow-inner">
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Готовый текст запроса к ИИ:</span>
              <span className="text-[11px] font-mono text-cyan-400">
                {renderedPrompt.length} симв.
              </span>
            </div>
            <textarea
              readOnly
              value={renderedPrompt}
              className="flex-1 w-full bg-transparent p-4 text-xs font-mono text-slate-200 leading-relaxed resize-none focus:outline-none select-all"
            />
          </div>
        </div>
      </div>

      {/* Modal: Create Custom Prompt */}
      {isCreatingCustom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Создать свой персональный промпт</span>
              </h3>
              <button
                onClick={() => setIsCreatingCustom(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Название промпта:</label>
                <input
                  type="text"
                  placeholder="Например: Экспертный переводчик сленга"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Категория:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as PromptCategory)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="coding">Кодинг & DevOps</option>
                  <option value="writing">Тексты & Копирайтинг</option>
                  <option value="reasoning">Логика & Анализ</option>
                  <option value="business">Бизнес & Карьера</option>
                  <option value="creative">Креатив & Сценарии</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Краткое описание:</label>
                <input
                  type="text"
                  placeholder="Для чего этот промпт нужен..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Текст шаблона (можно использовать переменные {'{{переменная}}'}):
                </label>
                <textarea
                  rows={5}
                  placeholder="Напиши подробный анализ на тему: {{тема}}..."
                  value={newTemplate}
                  onChange={(e) => setNewTemplate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 font-mono focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Теги через запятую:
                </label>
                <input
                  type="text"
                  placeholder="анализ, маркетинг, ai"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsCreatingCustom(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveCustomPrompt}
                disabled={!newTitle.trim() || !newTemplate.trim()}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition shadow-md shadow-cyan-500/20"
              >
                Сохранить промпт
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
