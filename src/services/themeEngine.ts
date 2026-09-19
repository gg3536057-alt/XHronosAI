import { AppTheme } from '../types';

export const PRESET_THEMES: AppTheme[] = [
  {
    id: 'slate',
    name: 'Deep Slate',
    description: 'Флагманский темный кибер-стиль с неоновыми акцентами циан и индиго',
    author: 'OmniAI',
    colors: {
      bg: '#020617', // slate-950
      surface: '#0f172a', // slate-900
      surfaceSecondary: '#1e293b', // slate-800
      border: '#1e293b',
      borderHover: '#334155',
      accentPrimary: '#06b6d4', // cyan-500
      accentSecondary: '#6366f1', // indigo-500
      textPrimary: '#f8fafc',
      textMuted: '#94a3b8',
      glow: 'rgba(6, 182, 212, 0.25)',
    },
    fontFamily: 'sans',
    borderRadius: 'medium',
    backdropBlur: true,
    meshGlow: true,
  },
  {
    id: 'warm',
    name: 'Warm Amber',
    description: 'Уютный вечерний кофейно-янтарный тон без синего света для защиты глаз',
    author: 'OmniAI Ergonomics',
    colors: {
      bg: '#14110f',
      surface: '#1e1a17',
      surfaceSecondary: '#2b2520',
      border: '#383029',
      borderHover: '#52453a',
      accentPrimary: '#f59e0b', // amber-500
      accentSecondary: '#ea580c', // orange-600
      textPrimary: '#faf4ed',
      textMuted: '#bdae9e',
      glow: 'rgba(245, 158, 11, 0.25)',
    },
    fontFamily: 'sans',
    borderRadius: 'medium',
    backdropBlur: true,
    meshGlow: true,
  },
  {
    id: 'oled',
    name: 'OLED Pure Black',
    description: 'Истинный 100% черный цвет для экономии батареи и максимальной контрастности',
    author: 'OmniAI Extreme',
    colors: {
      bg: '#000000',
      surface: '#0a0a0a',
      surfaceSecondary: '#141414',
      border: '#262626',
      borderHover: '#404040',
      accentPrimary: '#38bdf8', // sky-400
      accentSecondary: '#e2e8f0', // slate-200
      textPrimary: '#ffffff',
      textMuted: '#a3a3a3',
      glow: 'rgba(255, 255, 255, 0.15)',
    },
    fontFamily: 'sans',
    borderRadius: 'medium',
    backdropBlur: false,
    meshGlow: false,
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'Неоновый футуризм: глубокий ультрамарин, неоновый фиолетовый и ярко-розовый',
    author: 'OmniAI Synth',
    colors: {
      bg: '#0b001a',
      surface: '#150030',
      surfaceSecondary: '#240046',
      border: '#3c096c',
      borderHover: '#5a189a',
      accentPrimary: '#f72585', // neon pink
      accentSecondary: '#7209b7', // purple
      textPrimary: '#ffffff',
      textMuted: '#c77dff',
      glow: 'rgba(247, 37, 133, 0.35)',
    },
    fontFamily: 'sans',
    borderRadius: 'rounded',
    backdropBlur: true,
    meshGlow: true,
  },
  {
    id: 'matrix',
    name: 'Emerald Matrix',
    description: 'Хакерский нефрит: глубокая изумрудная тень и люминесцентный зеленый',
    author: 'OmniAI Terminal',
    colors: {
      bg: '#02130c',
      surface: '#052317',
      surfaceSecondary: '#0a3524',
      border: '#114a33',
      borderHover: '#176646',
      accentPrimary: '#10b981', // emerald-500
      accentSecondary: '#22c55e', // green-500
      textPrimary: '#ecfdf5',
      textMuted: '#6ee7b7',
      glow: 'rgba(16, 185, 129, 0.3)',
    },
    fontFamily: 'mono',
    borderRadius: 'sharp',
    backdropBlur: true,
    meshGlow: true,
  },
  {
    id: 'sunset',
    name: 'Tokyo Sunset',
    description: 'Атмосфера заката в Токио: полуночный фиолетовый и мягкий коралловый закат',
    author: 'OmniAI Aesthetic',
    colors: {
      bg: '#0f0c20',
      surface: '#1a1435',
      surfaceSecondary: '#271f4e',
      border: '#3b2f6e',
      borderHover: '#54439c',
      accentPrimary: '#fb7185', // rose-400
      accentSecondary: '#f97316', // orange-500
      textPrimary: '#fff1f2',
      textMuted: '#fda4af',
      glow: 'rgba(251, 113, 133, 0.3)',
    },
    fontFamily: 'sans',
    borderRadius: 'rounded',
    backdropBlur: true,
    meshGlow: true,
  },
  {
    id: 'nordic',
    name: 'Arctic Nordic Frost',
    description: 'Ледниковый арктический минимализм: холодная сталь и кристальный лазурный лед',
    author: 'OmniAI Nordic',
    colors: {
      bg: '#060d17',
      surface: '#0d1829',
      surfaceSecondary: '#16243b',
      border: '#223654',
      borderHover: '#314b73',
      accentPrimary: '#0ea5e9', // sky-500
      accentSecondary: '#38bdf8', // light sky
      textPrimary: '#f0f9ff',
      textMuted: '#93c5fd',
      glow: 'rgba(14, 165, 233, 0.25)',
    },
    fontFamily: 'sans',
    borderRadius: 'medium',
    backdropBlur: true,
    meshGlow: true,
  },
  {
    id: 'luxury',
    name: 'Monokai Gold Luxury',
    description: 'Премиальный темный графит с благородным матовым золотом',
    author: 'OmniAI Titanium',
    colors: {
      bg: '#121214',
      surface: '#1a1a1e',
      surfaceSecondary: '#26262c',
      border: '#35353d',
      borderHover: '#4a4a54',
      accentPrimary: '#eab308', // gold yellow
      accentSecondary: '#f59e0b', // amber
      textPrimary: '#fefce8',
      textMuted: '#d4d4d8',
      glow: 'rgba(234, 179, 8, 0.25)',
    },
    fontFamily: 'sans',
    borderRadius: 'medium',
    backdropBlur: true,
    meshGlow: true,
  },
];

const THEME_STORAGE_KEY = 'omniai_active_theme_id';
const CUSTOM_THEMES_STORAGE_KEY = 'omniai_custom_themes_list';

export const themeManager = {
  getCustomThemes(): AppTheme[] {
    try {
      const data = localStorage.getItem(CUSTOM_THEMES_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load custom themes:', e);
    }
    return [];
  },

  saveCustomThemes(themes: AppTheme[]) {
    try {
      localStorage.setItem(CUSTOM_THEMES_STORAGE_KEY, JSON.stringify(themes));
    } catch (e) {
      console.warn('Failed to save custom themes:', e);
    }
  },

  getAllThemes(): AppTheme[] {
    const custom = this.getCustomThemes();
    return [...PRESET_THEMES, ...custom];
  },

  getActiveThemeId(): string {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) || 'slate';
    } catch {
      return 'slate';
    }
  },

  getActiveTheme(): AppTheme {
    const activeId = this.getActiveThemeId();
    const all = this.getAllThemes();
    return all.find((t) => t.id === activeId) || PRESET_THEMES[0];
  },

  setActiveTheme(themeId: string) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
    } catch {}
    const theme = this.getAllThemes().find((t) => t.id === themeId) || PRESET_THEMES[0];
    this.applyThemeToDOM(theme);
  },

  saveNewCustomTheme(newTheme: AppTheme): AppTheme {
    const customs = this.getCustomThemes();
    const existingIndex = customs.findIndex((t) => t.id === newTheme.id);
    let updated: AppTheme[];
    if (existingIndex >= 0) {
      updated = [...customs];
      updated[existingIndex] = newTheme;
    } else {
      updated = [...customs, newTheme];
    }
    this.saveCustomThemes(updated);
    this.setActiveTheme(newTheme.id);
    return newTheme;
  },

  deleteCustomTheme(themeId: string) {
    const customs = this.getCustomThemes().filter((t) => t.id !== themeId);
    this.saveCustomThemes(customs);
    if (this.getActiveThemeId() === themeId) {
      this.setActiveTheme('slate');
    }
  },

  init() {
    const active = this.getActiveTheme();
    this.applyThemeToDOM(active);
    return active;
  },

  applyThemeToDOM(theme: AppTheme) {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    root.style.setProperty('--app-bg', theme.colors.bg);
    root.style.setProperty('--app-surface', theme.colors.surface);
    root.style.setProperty('--app-surface-secondary', theme.colors.surfaceSecondary);
    root.style.setProperty('--app-border', theme.colors.border);
    root.style.setProperty('--app-border-hover', theme.colors.borderHover);
    root.style.setProperty('--app-accent', theme.colors.accentPrimary);
    root.style.setProperty('--app-accent-2', theme.colors.accentSecondary);
    root.style.setProperty('--app-text', theme.colors.textPrimary);
    root.style.setProperty('--app-text-muted', theme.colors.textMuted);
    root.style.setProperty('--app-glow', theme.colors.glow);

    // Border radius
    let radius = '1rem'; // 16px
    if (theme.borderRadius === 'sharp') radius = '0.375rem'; // 6px
    else if (theme.borderRadius === 'rounded') radius = '1.25rem'; // 20px
    else if (theme.borderRadius === 'pill') radius = '1.75rem'; // 28px
    root.style.setProperty('--app-radius', radius);

    // Font Family
    let font = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";
    if (theme.fontFamily === 'mono') {
      font = "'JetBrains Mono', 'Fira Code', monospace";
    } else if (theme.fontFamily === 'serif') {
      font = "Georgia, Cambria, 'Times New Roman', serif";
    } else if (theme.fontFamily === 'system') {
      font = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    }
    root.style.setProperty('--app-font', font);
    document.body.style.fontFamily = font;
  },
};
