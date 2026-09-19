import React, { useState, useEffect } from 'react';
import {
  Palette,
  Sparkles,
  Check,
  Plus,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  Sliders,
  Type,
  Maximize2,
  Eye,
  Zap,
  Moon,
  Sun,
  Flame,
} from 'lucide-react';
import { AppTheme } from '../types';
import { themeManager, PRESET_THEMES } from '../services/themeEngine';
import { audioFx } from '../services/audioFxEngine';

interface ThemeStudioViewProps {
  currentTheme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
}

const COLOR_SWATCH_PRESETS = [
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#f43f5e', // Rose
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#22c55e', // Green
  '#38bdf8', // Sky
  '#e11d48', // Crimson
  '#ec4899', // Pink
  '#f97316', // Orange
  '#eab308', // Gold
];

export const ThemeStudioView: React.FC<ThemeStudioViewProps> = ({
  currentTheme,
  onThemeChange,
}) => {
  const [allThemes, setAllThemes] = useState<AppTheme[]>(() => themeManager.getAllThemes());
  const [activeTab, setActiveTab] = useState<'presets' | 'custom-builder'>('presets');

  // Custom Theme Builder state
  const [customName, setCustomName] = useState('Моя Неоновая Тема');
  const [customBg, setCustomBg] = useState(currentTheme.colors.bg);
  const [customSurface, setCustomSurface] = useState(currentTheme.colors.surface);
  const [customSurfaceSecondary, setCustomSurfaceSecondary] = useState(
    currentTheme.colors.surfaceSecondary
  );
  const [customBorder, setCustomBorder] = useState(currentTheme.colors.border);
  const [customAccentPrimary, setCustomAccentPrimary] = useState(
    currentTheme.colors.accentPrimary
  );
  const [customAccentSecondary, setCustomAccentSecondary] = useState(
    currentTheme.colors.accentSecondary
  );
  const [customTextPrimary, setCustomTextPrimary] = useState(currentTheme.colors.textPrimary);
  const [customTextMuted, setCustomTextMuted] = useState(currentTheme.colors.textMuted);
  const [customRadius, setCustomRadius] = useState<'sharp' | 'medium' | 'rounded' | 'pill'>(
    currentTheme.borderRadius
  );
  const [customFont, setCustomFont] = useState<'sans' | 'mono' | 'serif' | 'system'>(
    currentTheme.fontFamily
  );
  const [customMeshGlow, setCustomMeshGlow] = useState(currentTheme.meshGlow);

  const [importJsonText, setImportJsonText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Sync builder with current theme
  useEffect(() => {
    setAllThemes(themeManager.getAllThemes());
  }, [currentTheme]);

  const handleSelectTheme = (theme: AppTheme) => {
    audioFx.playChime('activate');
    themeManager.setActiveTheme(theme.id);
    onThemeChange(theme);
  };

  const handleSaveCustomTheme = () => {
    const newTheme: AppTheme = {
      id: `custom-theme-${Date.now()}`,
      name: customName.trim() || 'Пользовательская тема',
      description: 'Создана в Конструкторе Темы OmniAI',
      author: 'Вы',
      isCustom: true,
      colors: {
        bg: customBg,
        surface: customSurface,
        surfaceSecondary: customSurfaceSecondary,
        border: customBorder,
        borderHover: customAccentPrimary,
        accentPrimary: customAccentPrimary,
        accentSecondary: customAccentSecondary,
        textPrimary: customTextPrimary,
        textMuted: customTextMuted,
        glow: `${customAccentPrimary}40`,
      },
      fontFamily: customFont,
      borderRadius: customRadius,
      backdropBlur: true,
      meshGlow: customMeshGlow,
    };

    const saved = themeManager.saveNewCustomTheme(newTheme);
    setAllThemes(themeManager.getAllThemes());
    onThemeChange(saved);
    audioFx.playChime('success');
    setActiveTab('presets');
  };

  const handleDeleteCustom = (themeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    themeManager.deleteCustomTheme(themeId);
    setAllThemes(themeManager.getAllThemes());
    audioFx.playChime('bubble');
  };

  const handleExportTheme = (theme: AppTheme) => {
    const json = JSON.stringify(theme, null, 2);
    navigator.clipboard.writeText(json);
    setCopySuccess(true);
    audioFx.playChime('success');
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleImportTheme = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (!parsed.name || !parsed.colors) {
        throw new Error('Некорректный формат темы');
      }
      const imported: AppTheme = {
        ...parsed,
        id: `custom-theme-${Date.now()}`,
        isCustom: true,
      };
      const saved = themeManager.saveNewCustomTheme(imported);
      setAllThemes(themeManager.getAllThemes());
      onThemeChange(saved);
      setShowImportModal(false);
      setImportJsonText('');
      audioFx.playChime('success');
    } catch (err: any) {
      alert(`Ошибка импорта: ${err.message}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl w-full mx-auto space-y-6">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/30 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-3">
                <Palette className="w-3.5 h-3.5 text-pink-400" />
                <span>Глобальный Дизайн-Центр 3.0</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Темы оформления & Конструктор «Своя Тема»
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
                Персонализируйте рабочее пространство: выберите одну из премиальных готовых палитр или создайте собственную тему с уникальными акцентами, радиусом скругления и типографикой.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-semibold transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Импорт</span>
              </button>

              <button
                onClick={() => handleExportTheme(currentTheme)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-semibold transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{copySuccess ? 'Скопировано!' : 'Экспорт'}</span>
              </button>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center gap-2 mt-6 pt-5 border-t border-slate-800/80">
            <button
              onClick={() => setActiveTab('presets')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'presets'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Готовые стили ({allThemes.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('custom-builder')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'custom-builder'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Создать свою тему</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Presets & Custom Themes Grid */}
        {activeTab === 'presets' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allThemes.map((theme) => {
              const isSelected = currentTheme.id === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={() => handleSelectTheme(theme)}
                  className={`group relative flex flex-col justify-between p-5 rounded-3xl cursor-pointer transition-all duration-300 border ${
                    isSelected
                      ? 'border-cyan-400 shadow-2xl ring-2 ring-cyan-400/40'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderColor: isSelected ? theme.colors.accentPrimary : theme.colors.border,
                  }}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3
                            className="font-extrabold text-base leading-snug"
                            style={{ color: theme.colors.textPrimary }}
                          >
                            {theme.name}
                          </h3>
                          {isSelected && (
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                              style={{
                                backgroundColor: `${theme.colors.accentPrimary}33`,
                                color: theme.colors.accentPrimary,
                              }}
                            >
                              Активна
                            </span>
                          )}
                        </div>
                        <span
                          className="text-[11px] font-medium"
                          style={{ color: theme.colors.textMuted }}
                        >
                          {theme.author || 'OmniAI'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {theme.isCustom && (
                          <button
                            onClick={(e) => handleDeleteCustom(theme.id, e)}
                            className="p-1 text-rose-400 hover:text-rose-300 opacity-0 group-hover:opacity-100 transition rounded-lg hover:bg-rose-500/10"
                            title="Удалить тему"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {isSelected && (
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-slate-950 shadow"
                            style={{ backgroundColor: theme.colors.accentPrimary }}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </div>

                    <p
                      className="text-xs leading-relaxed mb-4"
                      style={{ color: theme.colors.textMuted }}
                    >
                      {theme.description}
                    </p>

                    {/* Color Swatch Preview */}
                    <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-black/30 border border-white/5 mb-3">
                      <div
                        className="w-5 h-5 rounded-lg border border-white/10 shadow-inner"
                        style={{ backgroundColor: theme.colors.bg }}
                        title="Фон"
                      />
                      <div
                        className="w-5 h-5 rounded-lg border border-white/10 shadow-inner"
                        style={{ backgroundColor: theme.colors.surface }}
                        title="Карточка"
                      />
                      <div
                        className="w-5 h-5 rounded-lg border border-white/10 shadow-inner"
                        style={{ backgroundColor: theme.colors.accentPrimary }}
                        title="Основной акцент"
                      />
                      <div
                        className="w-5 h-5 rounded-lg border border-white/10 shadow-inner"
                        style={{ backgroundColor: theme.colors.accentSecondary }}
                        title="Второй акцент"
                      />
                      <span className="text-[10px] ml-auto font-mono text-slate-400">
                        {theme.borderRadius} / {theme.fontFamily}
                      </span>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between mt-auto">
                    <span className="text-[10px] text-slate-500">
                      {theme.isCustom ? 'Пользовательская' : 'Официальная палитра'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectTheme(theme)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold transition"
                      style={{
                        backgroundColor: isSelected
                          ? theme.colors.accentPrimary
                          : 'rgba(255,255,255,0.08)',
                        color: isSelected ? '#000000' : theme.colors.textPrimary,
                      }}
                    >
                      {isSelected ? 'Применена' : 'Выбрать'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Custom Theme Creator Studio */}
        {activeTab === 'custom-builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-5 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-pink-400" />
                  <span>Параметры и палитра новой темы</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Настройте каждый оттенок, скругление и стиль шрифта по своему вкусу.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Название темы:
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Color Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Background */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs font-semibold text-slate-300 block mb-2">Цвет фона:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customBg}
                      onChange={(e) => setCustomBg(e.target.value)}
                      className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-slate-400">{customBg}</span>
                  </div>
                </div>

                {/* Surface */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs font-semibold text-slate-300 block mb-2">Цвет карточек:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customSurface}
                      onChange={(e) => setCustomSurface(e.target.value)}
                      className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-slate-400">{customSurface}</span>
                  </div>
                </div>

                {/* Accent Primary */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs font-semibold text-slate-300 block mb-2">
                    Главный акцент (кнопки, подсветка):
                  </span>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="color"
                      value={customAccentPrimary}
                      onChange={(e) => setCustomAccentPrimary(e.target.value)}
                      className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-slate-400">{customAccentPrimary}</span>
                  </div>
                  {/* Swatches */}
                  <div className="flex flex-wrap gap-1">
                    {COLOR_SWATCH_PRESETS.slice(0, 6).map((c) => (
                      <button
                        key={c}
                        onClick={() => setCustomAccentPrimary(c)}
                        className="w-4 h-4 rounded-full border border-white/20 hover:scale-110 transition"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {/* Accent Secondary */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs font-semibold text-slate-300 block mb-2">
                    Вторичный акцент:
                  </span>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="color"
                      value={customAccentSecondary}
                      onChange={(e) => setCustomAccentSecondary(e.target.value)}
                      className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-slate-400">{customAccentSecondary}</span>
                  </div>
                  {/* Swatches */}
                  <div className="flex flex-wrap gap-1">
                    {COLOR_SWATCH_PRESETS.slice(6, 12).map((c) => (
                      <button
                        key={c}
                        onClick={() => setCustomAccentSecondary(c)}
                        className="w-4 h-4 rounded-full border border-white/20 hover:scale-110 transition"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Radius & Font */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">
                    Скругление углов (Border Radius):
                  </label>
                  <div className="grid grid-cols-4 gap-1.5 text-[11px]">
                    {(['sharp', 'medium', 'rounded', 'pill'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setCustomRadius(r)}
                        className={`py-2 rounded-xl border text-center font-bold transition ${
                          customRadius === r
                            ? 'bg-pink-500/20 text-pink-300 border-pink-500/50'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {r === 'sharp' ? '4px' : r === 'medium' ? '16px' : r === 'rounded' ? '20px' : '28px'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">
                    Шрифт интерфейса:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    {(['sans', 'mono', 'serif', 'system'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setCustomFont(f)}
                        className={`py-2 rounded-xl border text-center font-bold transition ${
                          customFont === f
                            ? 'bg-pink-500/20 text-pink-300 border-pink-500/50'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {f === 'sans' ? 'Plus Jakarta' : f === 'mono' ? 'JetBrains Mono' : f === 'serif' ? 'Serif Book' : 'System Native'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ambient Glow */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">
                    Неоновое свечение (Mesh Ambient Glow)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Мягкий градиентный ореол на фоне карточек и шапки.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={customMeshGlow}
                  onChange={(e) => setCustomMeshGlow(e.target.checked)}
                  className="accent-pink-500 w-4 h-4 cursor-pointer"
                />
              </div>

              {/* Save Button */}
              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSaveCustomTheme}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-pink-500/25 hover:scale-[1.02] active:scale-[0.98] transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Сохранить и применить мою тему</span>
                </button>
              </div>
            </div>

            {/* Live Interactive Preview Card (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-pink-400" />
                  <span>Интерактивный живой предпросмотр:</span>
                </span>
                <span className="text-[10px] text-slate-500">Обновляется в реальном времени</span>
              </div>

              <div
                className="p-6 rounded-3xl border shadow-2xl transition-all duration-300 space-y-4"
                style={{
                  backgroundColor: customBg,
                  borderColor: customBorder,
                  color: customTextPrimary,
                  borderRadius:
                    customRadius === 'sharp'
                      ? '6px'
                      : customRadius === 'rounded'
                      ? '20px'
                      : customRadius === 'pill'
                      ? '28px'
                      : '16px',
                }}
              >
                {/* Mock Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-slate-950 text-xs shadow"
                      style={{ backgroundColor: customAccentPrimary }}
                    >
                      AI
                    </div>
                    <span className="font-extrabold text-xs">{customName}</span>
                  </div>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                    style={{
                      backgroundColor: `${customAccentPrimary}33`,
                      color: customAccentPrimary,
                    }}
                  >
                    PRO 3.0
                  </span>
                </div>

                {/* Mock Card */}
                <div
                  className="p-4 rounded-2xl border space-y-2"
                  style={{
                    backgroundColor: customSurface,
                    borderColor: customBorder,
                  }}
                >
                  <h4 className="font-bold text-xs">Пример сообщения ассистента</h4>
                  <p className="text-[11px] leading-relaxed" style={{ color: customTextMuted }}>
                    OmniAI успешно скомпилировал тему. Обратите внимание на контраст текста, скругление и подсветку активных компонентов.
                  </p>
                  <div className="flex gap-2 pt-2">
                    <button
                      className="px-3 py-1.5 text-xs font-bold text-slate-950 shadow transition"
                      style={{
                        backgroundColor: customAccentPrimary,
                        borderRadius:
                          customRadius === 'sharp'
                            ? '4px'
                            : customRadius === 'pill'
                            ? '20px'
                            : '12px',
                      }}
                    >
                      Активное действие
                    </button>
                    <button
                      className="px-3 py-1.5 text-xs font-semibold border transition"
                      style={{
                        backgroundColor: customSurfaceSecondary,
                        borderColor: customBorder,
                        color: customTextPrimary,
                        borderRadius:
                          customRadius === 'sharp'
                            ? '4px'
                            : customRadius === 'pill'
                            ? '20px'
                            : '12px',
                      }}
                    >
                      Вторичная кнопка
                    </button>
                  </div>
                </div>

                {/* Mock Input */}
                <div
                  className="p-3 rounded-xl border flex items-center justify-between"
                  style={{
                    backgroundColor: customSurfaceSecondary,
                    borderColor: customBorder,
                  }}
                >
                  <span className="text-xs" style={{ color: customTextMuted }}>
                    Введите ваш запрос к ИИ...
                  </span>
                  <div
                    className="w-5 h-5 rounded-lg flex items-center justify-center text-slate-950 font-bold text-[10px]"
                    style={{ backgroundColor: customAccentSecondary }}
                  >
                    ➤
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Import Theme */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>Импорт темы из JSON</span>
            </h3>
            <p className="text-xs text-slate-400">
              Вставьте JSON-код темы, скопированный у другого пользователя или экспортированный ранее:
            </p>
            <textarea
              rows={6}
              placeholder='{ "name": "Моя тема", "colors": { ... } }'
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Отмена
              </button>
              <button
                onClick={handleImportTheme}
                disabled={!importJsonText.trim()}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition shadow-md shadow-cyan-500/20"
              >
                Загрузить тему
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
