import React, { useState, useMemo } from 'react';
import { TOOLS_DATA } from '../data/toolboxData';
import { AIToolItem, ToolCategory } from '../types';
import { 
  Search, 
  Wrench, 
  WifiOff, 
  Check, 
  Copy, 
  Play, 
  FileText, 
  Code, 
  Binary, 
  Shield, 
  Calculator, 
  Timer, 
  HardDrive,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ToolboxViewProps {
  onSendToChat?: (text: string) => void;
}

const CATEGORIES: { id: ToolCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Все (100+)' },
  { id: 'text', label: 'Текст и редактура' },
  { id: 'dev', label: 'Разработка и код' },
  { id: 'crypto', label: 'Хэши и крипто' },
  { id: 'security', label: 'Безопасность' },
  { id: 'math', label: 'Математика и единицы' },
  { id: 'productivity', label: 'Продуктивность' },
  { id: 'sys', label: 'Система и диагностика' },
  { id: 'media', label: 'Медиа и звук' }
];

export const ToolboxView: React.FC<ToolboxViewProps> = ({ onSendToChat }) => {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTool, setActiveTool] = useState<AIToolItem | null>(TOOLS_DATA[0]);
  const [toolInput, setToolInput] = useState('');
  const [toolOutput, setToolOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  // Filter tools
  const filteredTools = useMemo(() => {
    return TOOLS_DATA.filter((tool) => {
      const matchCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      const matchQuery = 
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  const handleSelectTool = (tool: AIToolItem) => {
    setActiveTool(tool);
    setToolInput(tool.placeholderInput || '');
    setToolOutput('');
  };

  const handleRunTool = async () => {
    if (!activeTool) return;
    setIsRunning(true);
    try {
      const res = await activeTool.defaultAction(toolInput);
      setToolOutput(res);
    } catch (err: any) {
      setToolOutput(`Ошибка выполнения: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    if (!toolOutput) return;
    navigator.clipboard.writeText(toolOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-slate-950 text-slate-100">
      {/* Left Sidebar: Tool Selector */}
      <div className="w-full md:w-80 border-r border-slate-800 flex flex-col bg-slate-900/50">
        {/* Search & Header */}
        <div className="p-3.5 border-b border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold tracking-wide">Библиотека утилит</h2>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono">
              {TOOLS_DATA.length}+ модулей
            </span>
          </div>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Поиск инструмента..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="px-3 py-2 border-b border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-[11px] whitespace-nowrap px-2.5 py-1 rounded-md transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-cyan-500 text-slate-950 font-medium'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Tools List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredTools.map((tool) => {
            const isSelected = activeTool?.id === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => handleSelectTool(tool)}
                className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-start gap-2.5 ${
                  isSelected
                    ? 'bg-cyan-950/40 border border-cyan-500/30 text-white'
                    : 'hover:bg-slate-800/50 text-slate-300 border border-transparent'
                }`}
              >
                <div className={`p-1.5 rounded-md mt-0.5 ${isSelected ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                  {tool.category === 'text' && <FileText className="w-3.5 h-3.5" />}
                  {tool.category === 'dev' && <Code className="w-3.5 h-3.5" />}
                  {tool.category === 'crypto' && <Binary className="w-3.5 h-3.5" />}
                  {tool.category === 'security' && <Shield className="w-3.5 h-3.5" />}
                  {tool.category === 'math' && <Calculator className="w-3.5 h-3.5" />}
                  {tool.category === 'productivity' && <Timer className="w-3.5 h-3.5" />}
                  {tool.category === 'sys' && <HardDrive className="w-3.5 h-3.5" />}
                  {!['text', 'dev', 'crypto', 'security', 'math', 'productivity', 'sys'].includes(tool.category) && (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-medium truncate">{tool.title}</span>
                    {tool.offlineSupport && (
                      <span className="flex items-center text-[10px] text-emerald-400/80 bg-emerald-500/10 px-1 py-0.2 rounded" title="Работает без интернета">
                        <WifiOff className="w-2.5 h-2.5 mr-0.5" /> 100%
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {tool.description}
                  </p>
                </div>
              </button>
            );
          })}
          {filteredTools.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-500">
              По вашему запросу ничего не найдено.
            </div>
          )}
        </div>
      </div>

      {/* Right Area: Active Tool Execution Sandbox */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
        {activeTool ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header of Active Tool */}
            <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/30">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-semibold text-white">{activeTool.title}</h1>
                  {activeTool.offlineSupport && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <WifiOff className="w-3 h-3" /> Офлайн-модуль
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">{activeTool.description}</p>
              </div>

              <button
                onClick={handleRunTool}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-medium text-xs rounded-lg shadow-lg shadow-cyan-500/10 transition-all active:scale-95 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {isRunning ? 'Выполнение...' : 'Запустить'}
              </button>
            </div>

            {/* Split Workspace: Input / Output */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden p-4 gap-4">
              {/* Input Area */}
              <div className="flex-1 flex flex-col min-h-0 bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-3.5 py-2 border-b border-slate-800/80 bg-slate-900 flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-slate-300">Входные данные</span>
                  {toolInput && (
                    <button
                      onClick={() => setToolInput('')}
                      className="text-[11px] text-slate-500 hover:text-slate-300"
                    >
                      Очистить
                    </button>
                  )}
                </div>
                <textarea
                  value={toolInput}
                  onChange={(e) => setToolInput(e.target.value)}
                  placeholder={activeTool.placeholderInput || 'Введите параметры или оставьте пустым для автозапуска...'}
                  className="flex-1 p-3.5 bg-transparent resize-none text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none font-mono leading-relaxed"
                />
              </div>

              {/* Output Area */}
              <div className="flex-1 flex flex-col min-h-0 bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-3.5 py-2 border-b border-slate-800/80 bg-slate-900 flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-slate-300">Результат обработки</span>
                  <div className="flex items-center gap-2">
                    {toolOutput && onSendToChat && (
                      <button
                        onClick={() => onSendToChat(`Результат ${activeTool.title}:\n\n${toolOutput}`)}
                        className="text-[11px] flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                        title="Отправить в чат ассистенту"
                      >
                        В чат <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                    {toolOutput && (
                      <button
                        onClick={handleCopy}
                        className="text-[11px] flex items-center gap-1 text-slate-400 hover:text-white"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copied ? 'Скопировано' : 'Копировать'}
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1 p-3.5 overflow-y-auto text-xs font-mono text-slate-200 whitespace-pre-wrap selection:bg-cyan-500/30">
                  {toolOutput ? (
                    toolOutput
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-600 text-center">
                      Нажмите кнопку «Запустить» для выполнения функции
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
            Выберите инструмент из списка слева
          </div>
        )}
      </div>
    </div>
  );
};
