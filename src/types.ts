export type ActiveTab = 
  | 'chat' 
  | 'prompts'
  | 'themes'
  | 'transcribe'
  | 'voices'
  | 'vision' 
  | 'voice' 
  | 'images' 
  | 'launcher' 
  | 'tools'
  | 'offline'
  | 'context' 
  | 'guide';

export type LanguageCode = 'ru' | 'en' | 'es' | 'de' | 'zh';

export type AIProvider = 'cloud-gemini' | 'offline-local' | 'webllm' | 'auto';

export type VoicePersonaId = 'alisa' | 'max' | 'jarvis' | 'elena' | 'oracle' | 'cyber';

export type VoiceTimbreEffect = 'natural' | 'studio' | 'cyber' | 'warm' | 'radio';

export interface VoicePersona {
  id: VoicePersonaId;
  name: string;
  gender: 'female' | 'male' | 'neural';
  roleTitle: string;
  description: string;
  avatar: string;
  color: string;
  defaultPitch: number;
  defaultRate: number;
  timbreEffect: VoiceTimbreEffect;
  previewSample: string;
}

export type VoiceEngineMode = 'neural' | 'system';

export interface VoiceSettings {
  personaId: VoicePersonaId;
  selectedVoiceURI: string | null;
  pitch: number;
  rate: number;
  volume: number;
  timbreEffect: VoiceTimbreEffect;
  autoSpeakReplies: boolean;
  engineMode: VoiceEngineMode;
}

export interface UserComfortSettings {
  fontSize: 'sm' | 'md' | 'lg';
  compactMode: boolean;
  soundEffects: boolean;
}

export type AIReasoningMode = 'fast' | 'deep' | 'coder' | 'creative';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  image?: string;
  attachedFileName?: string;
  timestamp: string;
  thinking?: string;
  sources?: { title: string; url: string }[];
  isVoiceInput?: boolean;
  provider?: string;
  isPinned?: boolean;
}

export interface ScreenCaptureState {
  isActive: boolean;
  stream: MediaStream | null;
  lastSnapshot: string | null;
  lastAnalyzedAt: string | null;
  autoScanInterval: number; // in seconds, 0 = disabled
  isAnalyzing: boolean;
  latestAnalysis: string | null;
}

export interface AppShortcut {
  id: string;
  name: string;
  category: 'messenger' | 'dev' | 'media' | 'system' | 'browser' | 'office' | 'ai';
  icon: string;
  uriScheme?: string;
  webUrl?: string;
  cmdWindows?: string;
  cmdMacLinux?: string;
  cmdAndroid?: string;
  description: string;
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  aspectRatio: string;
  createdAt: string;
}

export interface ContextMenuAction {
  id: string;
  title: string;
  icon: string;
  promptTemplate: string;
}

export type ToolCategory = 
  | 'text'
  | 'dev'
  | 'math'
  | 'crypto'
  | 'media'
  | 'network'
  | 'sys'
  | 'security'
  | 'productivity';

export interface AIToolItem {
  id: string;
  title: string;
  category: ToolCategory;
  description: string;
  icon: string;
  offlineSupport: boolean;
  tags: string[];
  placeholderInput?: string;
  defaultAction: (input: string, context?: any) => Promise<string> | string;
}

export interface AppTheme {
  id: string;
  name: string;
  description: string;
  author?: string;
  isCustom?: boolean;
  colors: {
    bg: string;
    surface: string;
    surfaceSecondary: string;
    border: string;
    borderHover: string;
    accentPrimary: string;
    accentSecondary: string;
    textPrimary: string;
    textMuted: string;
    glow: string;
  };
  fontFamily: 'sans' | 'mono' | 'serif' | 'system';
  borderRadius: 'sharp' | 'medium' | 'rounded' | 'pill';
  backdropBlur: boolean;
  meshGlow: boolean;
}

export type PromptCategory = 
  | 'coding'
  | 'writing'
  | 'reasoning'
  | 'business'
  | 'study'
  | 'roles'
  | 'creative'
  | 'custom';

export interface PromptItem {
  id: string;
  title: string;
  category: PromptCategory;
  description: string;
  template: string;
  tags: string[];
  variables?: { name: string; label: string; placeholder: string; defaultValue?: string }[];
  isFavorite?: boolean;
  isCustom?: boolean;
}

export interface AudioMemo {
  id: string;
  title: string;
  transcript: string;
  summary?: string;
  actionItems?: string[];
  createdAt: string;
  durationSeconds: number;
  language: LanguageCode;
  tags: string[];
}

