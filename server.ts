import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { UniversalCommunicate } from 'edge-tts-universal';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy initialize Gemini client to avoid crashes if key is initially absent
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health & System Info
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'ok',
    hasKey,
    version: '1.0.0',
    capabilities: [
      'multimodal_chat',
      'screen_vision',
      'voice_interaction',
      'image_generation',
      'app_launcher',
      'context_menu',
      'crossplatform_pwa',
    ],
  });
});

// Chat endpoint (ChatGPT / Grok alternative with reasoning and optional search)
app.post('/api/chat', async (req, res) => {
  try {
    const {
      messages = [],
      systemInstruction = '',
      thinking = false,
      searchGrounding = false,
      language = 'ru',
    } = req.body;

    const ai = getAI();

    // Prepare contents formatted for Gemini SDK
    // Convert incoming chat history
    const contents = messages.map((m: { role: string; text: string; image?: string }) => {
      const parts: any[] = [];
      if (m.image) {
        // Strip data prefix if present
        const base64Data = m.image.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Data,
          },
        });
      }
      if (m.text) {
        parts.push({ text: m.text });
      }
      return {
        role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        parts,
      };
    });

    const defaultSystemInstruction = `Ты — OmniAI Workstation, универсальный интеллектуальный ассистент и рабочая среда (альтернатива ChatGPT, Grok, Claude).
Ты работаешь одновременно как персональный помощник на ПК и Android-смартфоне.
Текущий язык общения: ${language === 'ru' ? 'Русский' : language}.
Твои возможности:
1. Помогать в работе: писать, редактировать, переводить тексты, генерировать чистый код с объяснениями.
2. Анализировать экран пользователя в реальном времени, находить ошибки, давать советы по интерфейсам и задачам.
3. Помогать открывать нужные программы или формировать команды для быстрого запуска.
4. Отвечать глубоко, структурированно, используя Markdown, списки и блоки кода. Всегда будь вежлив, конкретен и практичен.`;

    const config: any = {
      systemInstruction: systemInstruction || defaultSystemInstruction,
    };

    if (searchGrounding) {
      config.tools = [{ googleSearch: {} }];
    }

    if (thinking) {
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config,
    });

    const responseText = response.text || '';
    
    // Check if grounding metadata exists
    let sources: any[] = [];
    const candidate = response.candidates?.[0];
    if (candidate?.groundingMetadata?.groundingChunks) {
      sources = candidate.groundingMetadata.groundingChunks.map((chunk: any) => ({
        title: chunk.web?.title || 'Источник',
        url: chunk.web?.uri || '',
      })).filter((s: any) => s.url);
    }

    res.json({
      text: responseText,
      sources,
      model: 'gemini-3.8-flash',
      thinkingEnabled: thinking,
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({
      error: error.message || 'Ошибка обработки запроса ИИ.',
    });
  }
});

// Screen Vision endpoint: analyzes desktop or mobile screen frame
app.post('/api/vision/analyze', async (req, res) => {
  try {
    const { image, query = 'Что отображено на экране? Помоги с текущей задачей и подскажи следующий шаг.', mode = 'general' } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Изображение экрана не передано.' });
    }

    const ai = getAI();
    const cleanBase64 = image.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

    let specializedPrompt = query;
    if (mode === 'code') {
      specializedPrompt = `${query}\n\nВнимание: на экране фрагмент кода или ошибка в терминале/IDE. Проанализируй строки, найди потенциальный баг, синтаксическую ошибку или проблему конфигурации и предложи точное исправление.`;
    } else if (mode === 'action') {
      specializedPrompt = `${query}\n\nВнимание: определи, какая программа или веб-страница открыта на экране, какую задачу сейчас решает пользователь, и порекомендуй 2-3 быстрых действия или шортката. Если уместно, укажи подходящую программу для открытия.`;
    }

    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: cleanBase64,
      },
    };

    const textPart = {
      text: specializedPrompt,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        systemInstruction: `Ты — модуль Screen Vision ассистента OmniAI. Ты в реальном времени видишь экран пользователя (ПК или Android). Твоя задача — внимательно изучать визуальный контекст: активные окна, код, таблицы, формы, ошибки, сообщения в чатах. Давай четкий, емкий и полезный ответ без воды. Если на экране ошибка — сразу давай решение.`,
      },
    });

    res.json({
      analysis: response.text || 'Не удалось распознать детали на экране.',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/vision/analyze:', error);
    res.status(500).json({
      error: error.message || 'Ошибка анализа экрана.',
    });
  }
});

// Image generation endpoint
app.post('/api/image/generate', async (req, res) => {
  try {
    const { prompt, aspectRatio = '1:1' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Промпт для изображения не задан.' });
    }

    const ai = getAI();

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
        },
      },
    });

    let imageUrl: string | null = null;
    let description = '';

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      } else if (part.text) {
        description += part.text + '\n';
      }
    }

    if (!imageUrl) {
      // Return helpful fallback if model didn't return an image part
      return res.json({
        imageUrl: null,
        description: description || 'Модель вернула текстовое описание концепта.',
        prompt,
      });
    }

    res.json({
      imageUrl,
      description,
      prompt,
    });
  } catch (error: any) {
    console.error('Error in /api/image/generate:', error);
    res.status(500).json({
      error: error.message || 'Ошибка генерации изображения.',
    });
  }
});

// Helper for mapping personas to distinct neural voices with real frequency and pitch shifts
function resolveVoiceParams(
  personaId: string = 'alisa',
  lang: string = 'ru',
  userPitch: number = 1.0,
  userRate: number = 1.0
) {
  let voice = 'ru-RU-SvetlanaNeural';
  let basePitchHz = 0;
  let baseRatePercent = 0;

  const isRu = lang === 'ru';
  if (isRu) {
    switch (personaId) {
      case 'alisa':
        // Friendly, warm, youthful female voice
        voice = 'ru-RU-SvetlanaNeural';
        basePitchHz = 18;
        baseRatePercent = 4;
        break;
      case 'max':
        // Confident, energetic Russian male baritone
        voice = 'ru-RU-DmitryNeural';
        basePitchHz = 2;
        baseRatePercent = 2;
        break;
      case 'jarvis':
        // High-tech, deep synthetic AI baritone
        voice = 'ru-RU-DmitryNeural';
        basePitchHz = -24;
        baseRatePercent = 10;
        break;
      case 'elena':
        // Serious, poised presenter / academic standard
        voice = 'ru-RU-SvetlanaNeural';
        basePitchHz = -6;
        baseRatePercent = -2;
        break;
      case 'oracle':
        // Deep philosophical meditative male voice
        voice = 'ru-RU-DmitryNeural';
        basePitchHz = -35;
        baseRatePercent = -10;
        break;
      case 'cyber':
        // Cybernetic fast voice
        voice = 'ru-RU-SvetlanaNeural';
        basePitchHz = 42;
        baseRatePercent = 22;
        break;
      default:
        voice = 'ru-RU-SvetlanaNeural';
        basePitchHz = 15;
        baseRatePercent = 5;
    }
  } else if (lang === 'en') {
    switch (personaId) {
      case 'alisa':
        voice = 'en-US-JennyNeural';
        basePitchHz = 12;
        baseRatePercent = 4;
        break;
      case 'max':
        voice = 'en-US-GuyNeural';
        basePitchHz = 0;
        baseRatePercent = 0;
        break;
      case 'jarvis':
        voice = 'en-US-ChristopherNeural';
        basePitchHz = -20;
        baseRatePercent = 10;
        break;
      case 'elena':
        voice = 'en-US-AriaNeural';
        basePitchHz = -4;
        baseRatePercent = 0;
        break;
      case 'oracle':
        voice = 'en-US-GuyNeural';
        basePitchHz = -30;
        baseRatePercent = -10;
        break;
      case 'cyber':
        voice = 'en-US-JennyNeural';
        basePitchHz = 36;
        baseRatePercent = 18;
        break;
      default:
        voice = 'en-US-JennyNeural';
    }
  } else if (lang === 'de') {
    voice = ['max', 'jarvis', 'oracle'].includes(personaId) ? 'de-DE-ConradNeural' : 'de-DE-KatjaNeural';
  } else if (lang === 'es') {
    voice = ['max', 'jarvis', 'oracle'].includes(personaId) ? 'es-ES-AlvaroNeural' : 'es-ES-ElviraNeural';
  } else if (lang === 'zh') {
    voice = ['max', 'jarvis', 'oracle'].includes(personaId) ? 'zh-CN-YunxiNeural' : 'zh-CN-XiaoxiaoNeural';
  }

  // Compute dynamic user offsets
  const pitchOffset = Math.round(((userPitch || 1.0) - 1.0) * 50);
  const totalPitchHz = basePitchHz + pitchOffset;
  const pitchStr = (totalPitchHz >= 0 ? `+${totalPitchHz}` : `${totalPitchHz}`) + 'Hz';

  const rateOffset = Math.round(((userRate || 1.0) - 1.0) * 100);
  const totalRatePercent = baseRatePercent + rateOffset;
  const rateStr = (totalRatePercent >= 0 ? `+${totalRatePercent}` : `${totalRatePercent}`) + '%';

  return { voice, pitch: pitchStr, rate: rateStr };
}

// Clean text for natural speech (strips code fences, raw URLs, excessive markdown symbols)
function cleanTextForSpeech(text: string): string {
  if (!text) return '';
  let cleaned = text
    // Replace markdown code blocks with brief note
    .replace(/```[\s\S]*?```/g, ' Блок кода пропущен. ')
    // Replace inline code with plain text
    .replace(/`([^`]+)`/g, '$1')
    // Remove markdown links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove raw URLs
    .replace(/https?:\/\/\S+/g, '')
    // Remove bold/italic markers
    .replace(/[*_~#]/g, '')
    // Collapse excess whitespace
    .replace(/\s+/g, ' ')
    .trim();

  // Limit synthesis length per request to prevent timeouts (first 1000 characters)
  if (cleaned.length > 1000) {
    cleaned = cleaned.slice(0, 1000) + '...';
  }
  return cleaned;
}

// Neural Multi-Voice Text-to-Speech Endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const {
      text,
      personaId = 'alisa',
      language = 'ru',
      pitch = 1.0,
      rate = 1.0,
    } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Текст для озвучки обязателен.' });
    }

    const cleanedText = cleanTextForSpeech(text);
    if (!cleanedText) {
      return res.status(400).json({ error: 'Нет текста для воспроизведения.' });
    }

    const { voice, pitch: pitchStr, rate: rateStr } = resolveVoiceParams(
      personaId,
      language,
      Number(pitch) || 1.0,
      Number(rate) || 1.0
    );

    const communicate = new UniversalCommunicate(cleanedText, {
      voice,
      pitch: pitchStr,
      rate: rateStr,
    });

    const audioChunks: Buffer[] = [];
    for await (const chunk of communicate.stream()) {
      if (chunk.type === 'audio' && chunk.data) {
        audioChunks.push(Buffer.from(chunk.data));
      }
    }

    if (audioChunks.length === 0) {
      return res.status(500).json({ error: 'Не удалось сгенерировать аудиопоток.' });
    }

    const audioBuffer = Buffer.concat(audioChunks);
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
      'Cache-Control': 'public, max-age=86400',
    });

    res.send(audioBuffer);
  } catch (error: any) {
    console.error('Error in /api/tts:', error);
    res.status(500).json({
      error: error.message || 'Ошибка синтеза речи.',
    });
  }
});

// Start server with Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OmniAI Workstation server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
