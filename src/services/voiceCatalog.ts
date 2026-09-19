import { VoicePersona, VoiceSettings, VoicePersonaId } from '../types';

export const VOICE_PERSONAS: VoicePersona[] = [
  {
    id: 'alisa',
    name: 'Алиса / Нео-Мила',
    gender: 'female',
    roleTitle: 'Живой и мягкий женский тембр',
    description: 'Теплый, эмоциональный, естественный голос для непринужденного общения и дружеской работы.',
    avatar: '🌸',
    color: 'from-pink-500 to-rose-400',
    defaultPitch: 1.16,
    defaultRate: 1.05,
    timbreEffect: 'natural',
    previewSample: 'Привет! Я твой обновленный голос ассистента — мягкий, выразительный и приятный на слух.',
  },
  {
    id: 'max',
    name: 'Макс / Ярослав',
    gender: 'male',
    roleTitle: 'Глубокий харизматичный баритон',
    description: 'Уверенный, низкий кинематографичный мужской голос для серьезных диалогов, новостей и рассуждений.',
    avatar: '⚡',
    color: 'from-sky-500 to-blue-600',
    defaultPitch: 0.84,
    defaultRate: 1.0,
    timbreEffect: 'studio',
    previewSample: 'Приветствую! Я Макс, глубокий мужской голос. Готов к сложным задачам и аналитике.',
  },
  {
    id: 'jarvis',
    name: 'Джарвис / Про-ИИ',
    gender: 'neural',
    roleTitle: 'Высокотехнологичный аналитик',
    description: 'Быстрый, собранный, точный голос в духе бортового компьютера и персонального ИИ-наставника.',
    avatar: '🤖',
    color: 'from-cyan-400 to-teal-500',
    defaultPitch: 0.78,
    defaultRate: 1.12,
    timbreEffect: 'cyber',
    previewSample: 'Все системы OmniAI инициализированы. Протокол готов к выполнению ваших инструкций.',
  },
  {
    id: 'elena',
    name: 'Елена / Эксперт',
    gender: 'female',
    roleTitle: 'Деловой дикторский стандарт',
    description: 'Идеальная артикуляция, уверенная подача и нейтральный академический тон.',
    avatar: '💎',
    color: 'from-violet-500 to-purple-600',
    defaultPitch: 1.02,
    defaultRate: 1.08,
    timbreEffect: 'studio',
    previewSample: 'Здравствуйте! Я Елена. Помогу подготовить отчет, структурировать информацию и проверить документы.',
  },
  {
    id: 'oracle',
    name: 'Оракул / Нео-Дзен',
    gender: 'neural',
    roleTitle: 'Спокойный медитативный тон',
    description: 'Размеренная, бархатная подача для концентрации, фокуса и глубоких размышлений.',
    avatar: '🌌',
    color: 'from-indigo-400 to-violet-500',
    defaultPitch: 0.92,
    defaultRate: 0.92,
    timbreEffect: 'warm',
    previewSample: 'Дышите спокойно. Никакой спешки — мы разберем каждый вопрос вдумчиво и качественно.',
  },
  {
    id: 'cyber',
    name: 'Кибер-Глитч / Нео',
    gender: 'neural',
    roleTitle: 'Синтезатор киберпанк-эпохи',
    description: 'Специфический футуристичный синтезированный голос для фанатов киберпанка и sci-fi интерфейсов.',
    avatar: '👾',
    color: 'from-emerald-400 to-cyan-500',
    defaultPitch: 0.72,
    defaultRate: 1.18,
    timbreEffect: 'cyber',
    previewSample: 'Нейронный поток стабилизирован. Пакетная обработка данных завершена успешно.',
  },
];

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  personaId: 'alisa',
  selectedVoiceURI: null,
  pitch: 1.16,
  rate: 1.05,
  volume: 1.0,
  timbreEffect: 'natural',
  autoSpeakReplies: false,
  engineMode: 'neural',
};

const STORAGE_KEY = 'omniai_voice_settings';

export function loadVoiceSettings(): VoiceSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_VOICE_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to parse voice settings from localStorage:', e);
  }
  return DEFAULT_VOICE_SETTINGS;
}

export function saveVoiceSettings(settings: VoiceSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save voice settings:', e);
  }
}

/**
 * Intelligent voice matching algorithm to find best real audio engine voice for a persona
 */
export function findBestVoiceForPersona(
  voices: SpeechSynthesisVoice[],
  persona: VoicePersona,
  targetLang: string = 'ru'
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const langPrefix = targetLang.split('-')[0].toLowerCase();
  const langVoices = voices.filter((v) => v.lang.toLowerCase().startsWith(langPrefix));
  const pool = langVoices.length > 0 ? langVoices : voices;

  // 1. Check for known high quality voices matching gender and role
  const nameScores = pool.map((v) => {
    let score = 0;
    const vName = (v.name + ' ' + (v as any).voiceURI).toLowerCase();

    // Prioritize natural / neural / google / edge voices
    if (vName.includes('natural') || vName.includes('neural')) score += 50;
    if (vName.includes('google')) score += 40;
    if (vName.includes('premium') || vName.includes('enhanced')) score += 35;
    if (vName.includes('microsoft')) score += 20;
    if (vName.includes('yandex')) score += 40;

    // Matching persona gender hints
    if (persona.gender === 'female') {
      if (/milena|irina|victoria|alisa|anna|svetlana|tatyana|olga|elena|daria|samantha|zira/i.test(vName)) {
        score += 60;
      }
    } else if (persona.gender === 'male') {
      if (/pavel|yuri|dmitry|aleksandr|alex|david|mark|george|stefan|boris/i.test(vName)) {
        score += 60;
      }
    } else {
      // Neural / sci-fi
      if (/robot|synthetic|compact|neural|jarvis|cyber/i.test(vName)) {
        score += 40;
      }
    }

    return { voice: v, score };
  });

  nameScores.sort((a, b) => b.score - a.score);
  return nameScores[0]?.voice || pool[0] || null;
}
