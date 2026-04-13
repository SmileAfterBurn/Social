import { useCallback, useRef, useState } from "react";
import { Platform } from "react-native";
import * as Speech from "expo-speech";
import { API_BASE } from "../api/jesse";

const isWeb = Platform.OS === "web";

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef(null);

  const speak = useCallback(async (text) => {
    if (!text?.trim()) return;
    setSpeaking(true);

    if (isWeb) {
      // Web: server-side TTS через backend
      try {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        const url = `${API_BASE}/speak?text=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.onended = () => { setSpeaking(false); URL.revokeObjectURL(audioUrl); };
        audio.onerror = () => setSpeaking(false);
        await audio.play();
      } catch (e) {
        console.warn("TTS помилка:", e.message);
        setSpeaking(false);
      }
    } else {
      // Native: expo-speech (працює на iOS/Android без серверу)
      Speech.speak(text, {
        language: "uk-UA",
        onDone: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });
    }
  }, []);

  const stop = useCallback(() => {
    if (isWeb) {
      audioRef.current?.pause();
      audioRef.current = null;
    } else {
      Speech.stop();
    }
    setSpeaking(false);
  }, []);

  return { speak, stop, speaking };
}
