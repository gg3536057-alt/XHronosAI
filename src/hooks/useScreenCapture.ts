import { useState, useRef, useCallback, useEffect } from 'react';

export function useScreenCapture() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [supportsDisplayMedia, setSupportsDisplayMedia] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setSupportsDisplayMedia(
      typeof navigator !== 'undefined' &&
        !!navigator.mediaDevices &&
        typeof navigator.mediaDevices.getDisplayMedia === 'function'
    );

    // Create a hidden video element for drawing video frames to canvas
    if (!videoRef.current) {
      const v = document.createElement('video');
      v.autoplay = true;
      v.playsInline = true;
      v.muted = true;
      videoRef.current = v;
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const takeSnapshot = useCallback((): string | null => {
    if (!videoRef.current || !isCapturing) return null;

    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return null;

    const canvas = document.createElement('canvas');
    // Scale down if huge 4K to optimize speed and API payload
    const maxDim = 1600;
    let w = video.videoWidth;
    let h = video.videoHeight;
    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      } else {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
    }

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setSnapshot(dataUrl);
    return dataUrl;
  }, [isCapturing]);

  const startScreenCapture = useCallback(async () => {
    setError(null);
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error('Функция захвата экрана не поддерживается этим браузером.');
      }

      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
          frameRate: { ideal: 10, max: 15 },
        },
        audio: false,
      });

      setStream(mediaStream);
      setIsCapturing(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      // Automatically capture first frame once video metadata is loaded
      mediaStream.getVideoTracks()[0].onended = () => {
        stopScreenCapture();
      };

      setTimeout(() => {
        takeSnapshot();
      }, 1000);

      return true;
    } catch (err: any) {
      console.warn('Screen capture error:', err);
      if (err.name !== 'NotAllowedError') {
        setError(err.message || 'Не удалось получить доступ к экрану.');
      }
      setIsCapturing(false);
      return false;
    }
  }, [takeSnapshot]);

  const stopScreenCapture = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  }, [stream]);

  const setManualImage = useCallback((base64: string) => {
    setSnapshot(base64);
  }, []);

  return {
    isCapturing,
    snapshot,
    error,
    supportsDisplayMedia,
    startScreenCapture,
    stopScreenCapture,
    takeSnapshot,
    setManualImage,
  };
}
