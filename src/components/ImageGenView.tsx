import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { GeneratedImage } from '../types';

interface ImageGenViewProps {
  onSendToChat?: (text: string, image?: string) => void;
}

export const ImageGenView: React.FC<ImageGenViewProps> = ({ onSendToChat }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');
  const [selectedStyle, setSelectedStyle] = useState<string>('Фотореализм');
  const [isLoading, setIsLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const stylePresets = [
    { label: 'Фотореализм', promptSuffix: ', photorealistic, ultra detailed 8k, cinematic lighting, realistic texture' },
    { label: 'Киберпанк', promptSuffix: ', cyberpunk aesthetic, neon lights, night city, futuristic, volumetric fog' },
    { label: '3D Рендер', promptSuffix: ', 3D render, octane render, smooth clay, cute vibrant colors, raytracing' },
    { label: 'Аниме / Макото', promptSuffix: ', studio ghibli anime style, vibrant skies, detailed scenery, hand drawn aesthetic' },
    { label: 'Минимализм UI', promptSuffix: ', clean flat vector design, modern minimalism, balanced geometry, pastel palette' },
  ];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    const styleObj = stylePresets.find((s) => s.label === selectedStyle);
    const fullPrompt = styleObj ? `${prompt.trim()}${styleObj.promptSuffix}` : prompt.trim();

    try {
      const res = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          aspectRatio,
        }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        const newImg: GeneratedImage = {
          id: Date.now().toString(),
          prompt: prompt.trim(),
          imageUrl: data.imageUrl,
          aspectRatio,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setCurrentImage(newImg);
        setHistory((prev) => [newImg, ...prev]);
      } else {
        setError(data.description || data.error || 'Не удалось сгенерировать изображение.');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка сети при генерации.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (img: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = img.imageUrl;
    link.download = `omni-ai-${Date.now()}.png`;
    link.click();
  };

  const promptIdeas = [
    'Робот-ассистент будущего за голографическим рабочим местом с экранами',
    'Уютная комната программиста с неоновой подсветкой, дождливый вечер за окном',
    'Изометрический милый 3D город с летающими машинами и зелеными крышами',
    'Логотип искусственного интеллекта в стиле светящегося кристалла',
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-950 p-4 space-y-4">
      {/* Top Generator Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white">AI Image Studio</h2>
            <p className="text-xs text-slate-400">Генерация арта, иллюстраций и концепт-дизайна по вашим словам</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-3">
          <div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Опишите что нарисовать (например: Космический корабль на орбите Марса в лучах солнца)..."
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-pink-500 resize-none"
            />
          </div>

          {/* Controls: Styles + Aspect Ratio */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Style Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 mr-1 text-[11px]">Стиль:</span>
              {stylePresets.map((s) => (
                <button
                  type="button"
                  key={s.label}
                  onClick={() => setSelectedStyle(s.label)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                    selectedStyle === s.label
                      ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Aspect Ratio */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px]">Формат:</span>
              {(['1:1', '16:9', '9:16'] as const).map((ratio) => (
                <button
                  type="button"
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition ${
                    aspectRatio === ratio
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[11px] text-slate-500">Идеи:</span>
              {promptIdeas.slice(0, 2).map((idea, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setPrompt(idea)}
                  className="text-[10px] text-slate-400 hover:text-sky-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 truncate max-w-xs transition"
                >
                  {idea}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-2 transition shadow-md shadow-pink-500/20"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Создание арта...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Сгенерировать</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-300">
          {error}
        </div>
      )}

      {/* Current Result Showcase */}
      {currentImage && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-200">Результат генерации</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload(currentImage)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Скачать PNG</span>
              </button>
              {onSendToChat && (
                <button
                  onClick={() => onSendToChat(`Посмотри на это изображение, которое мы сгенерировали по промпту «${currentImage.prompt}»`, currentImage.imageUrl)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Обсудить в чате</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="rounded-xl overflow-hidden border border-slate-800 bg-black max-w-md w-full shadow-2xl">
              <img
                src={currentImage.imageUrl}
                alt={currentImage.prompt}
                className="w-full h-auto object-contain"
              />
            </div>
            <div className="flex-1 text-xs space-y-2">
              <div className="text-slate-400">
                <strong className="text-slate-200">Промпт:</strong> {currentImage.prompt}
              </div>
              <div className="text-[11px] text-slate-500">
                Формат: {currentImage.aspectRatio} • Время: {currentImage.createdAt}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History gallery */}
      {history.length > 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <h3 className="text-xs font-semibold text-slate-300 mb-3">История недавних генераций</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {history.slice(1).map((item) => (
              <div
                key={item.id}
                onClick={() => setCurrentImage(item)}
                className="group relative rounded-xl overflow-hidden border border-slate-800 bg-black cursor-pointer aspect-square"
              >
                <img
                  src={item.imageUrl}
                  alt={item.prompt}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition p-2 flex flex-col justify-end">
                  <p className="text-[10px] text-white line-clamp-2">{item.prompt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
