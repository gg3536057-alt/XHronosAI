import { useState, useEffect, useRef, useCallback } from 'react';
import { LanguageCode, VoiceSettings, VoicePersona } from '../types';
import {
  VOICE_PERSONAS,
  loadVoiceSettings,
  saveVoiceSettings,
  findBestVoiceForPersona,
} from '../services/voiceCatalog';
import { audioFx } from '../services/audioFxEngine';

export function useSpeech(language: LanguageCode = 'ru') {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [hasSupport, setHasSupport] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(loadVoiceSettings);

  const recognitionRef = useRef<any>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioBlobUrlRef = useRef<string | null>(null);

  const langMap: Record<LanguageCode, string> = {
    ru: 'ru-RU',
    en: 'en-US',
    es: 'es-ES',
    de: 'de-DE',
    zh: 'zh-CN',
  };

  // Update voice settings and persist
  const updateVoiceSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    setVoiceSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveVoiceSettings(updated);
      return updated;
    });
  }, []);

  // Initialize Speech Recognition & Voices
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setHasSupport(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = langMap[language];

      recognition.onstart = () => {
        setIsListening(true);
        audioFx.playChime('activate');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        let final = '';
        let interim = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          setTranscript((prev) => (prev ? `${prev} ${final}` : final));
        }
        setInterimTranscript(interim);
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    }

    // Load TTS Voices
    if ('speechSynthesis' in window) {
      const updateVoices = () => {
        const available = window.speechSynthesis.getVoices();
        if (available.length > 0) {
          setVoices(available);
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;

      // Some browsers delay voice population; retry shortly
      const timer = setTimeout(updateVoices, 300);
      return () => clearTimeout(timer);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [language]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        setInterimTranscript('');
        recognitionRef.current.lang = langMap[language];
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Error starting speech recognition:', err);
      }
    }
  }, [isListening, language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  const currentPersona =
    VOICE_PERSONAS.find((p) => p.id === voiceSettings.personaId) || VOICE_PERSONAS[0];

  const stopSpeaking = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    if (audioBlobUrlRef.current) {
      URL.revokeObjectURL(audioBlobUrlRef.current);
      audioBlobUrlRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  /**
   * Fallback to OS Web Speech API if offline or neural server unreachable
   */
  const fallbackToSystemSpeech = useCallback(
    (
      cleanText: string,
      activeSettings: VoiceSettings,
      persona: VoicePersona,
      onEnd?: () => void
    ) => {
      if (!('speechSynthesis' in window)) {
        setIsSpeaking(false);
        onEnd?.();
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = langMap[language];
      utterance.rate = activeSettings.rate;
      utterance.pitch = activeSettings.pitch;
      utterance.volume = activeSettings.volume;

      let selectedVoice: SpeechSynthesisVoice | null = null;
      if (activeSettings.selectedVoiceURI) {
        selectedVoice =
          voices.find(
            (v) =>
              (v as any).voiceURI === activeSettings.selectedVoiceURI ||
              v.name === activeSettings.selectedVoiceURI
          ) || null;
      }

      if (!selectedVoice) {
        selectedVoice = findBestVoiceForPersona(voices, persona, langMap[language]);
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        onEnd?.();
      };

      utterance.onerror = (e) => {
        if (e.error !== 'canceled') {
          console.warn('System speech synthesis error:', e);
        }
        setIsSpeaking(false);
        onEnd?.();
      };

      currentUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [language, voices]
  );

  /**
   * Speak arbitrary text with chosen persona and fine-tuned settings
   * Defaults to high-quality Neural Voices (/api/tts) with instant distinct voices
   */
  const speak = useCallback(
    (
      text: string,
      onEnd?: () => void,
      overrideSettings?: Partial<VoiceSettings>
    ) => {
      stopSpeaking();

      // Clean markdown, code blocks and URLs for natural speech flow
      const cleanText = text
        .replace(/```[\s\S]*?```/g, ' Блок кода пропущен. ')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/https?:\/\/[^\s]+/g, 'веб ссылка')
        .replace(/[#*~_>]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleanText) {
        onEnd?.();
        return;
      }

      const activeSettings = { ...voiceSettings, ...overrideSettings };
      const persona =
        VOICE_PERSONAS.find((p) => p.id === activeSettings.personaId) || currentPersona;

      // Mode: Neural Studio (Real distinct voices) vs System OS voice
      if (activeSettings.engineMode !== 'system' && navigator.onLine) {
        setIsSpeaking(true);
        fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: cleanText,
            personaId: persona.id,
            language,
            pitch: activeSettings.pitch,
            rate: activeSettings.rate,
          }),
        })
          .then(async (res) => {
            if (!res.ok) throw new Error(`TTS server error: ${res.status}`);
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            audioBlobUrlRef.current = blobUrl;

            const audio = new Audio(blobUrl);
            audio.volume = activeSettings.volume ?? 1.0;
            currentAudioRef.current = audio;

            audio.onended = () => {
              setIsSpeaking(false);
              if (audioBlobUrlRef.current) {
                URL.revokeObjectURL(audioBlobUrlRef.current);
                audioBlobUrlRef.current = null;
              }
              currentAudioRef.current = null;
              onEnd?.();
            };

            audio.onerror = (err) => {
              console.warn('Audio playback error, falling back to local speech:', err);
              fallbackToSystemSpeech(cleanText, activeSettings, persona, onEnd);
            };

            await audio.play();
          })
          .catch((err) => {
            console.warn('Neural TTS failed, falling back to system speech:', err);
            fallbackToSystemSpeech(cleanText, activeSettings, persona, onEnd);
          });
      } else {
        fallbackToSystemSpeech(cleanText, activeSettings, persona, onEnd);
      }
    },
    [language, voiceSettings, currentPersona, fallbackToSystemSpeech, stopSpeaking]
  );

  const previewVoice = useCallback(
    (persona: VoicePersona, voiceURI?: string | null) => {
      speak(persona.previewSample, undefined, {
        personaId: persona.id,
        pitch: persona.defaultPitch,
        rate: persona.defaultRate,
        selectedVoiceURI: voiceURI !== undefined ? voiceURI : voiceSettings.selectedVoiceURI,
      });
    },
    [speak, voiceSettings.selectedVoiceURI]
  );

  return {
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    hasSupport,
    voices,
    voiceSettings,
    currentPersona,
    updateVoiceSettings,
    startListening,
    stopListening,
    resetTranscript,
    speak,
    stopSpeaking,
    previewVoice,
  };
}
