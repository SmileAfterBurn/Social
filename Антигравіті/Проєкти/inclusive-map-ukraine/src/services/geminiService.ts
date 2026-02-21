import { GoogleGenAI, GenerateContentResponse, LiveServerMessage, Modality } from "@google/genai";
import { Organization } from "../types";

// --- Neural Text-to-Speech (High Quality) ---

export const generateSpeech = async (text: string): Promise<ArrayBuffer> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ 
        parts: [{ 
          text: `[STYLING INSTRUCTIONS: Speak as Pani Dumka. Use a warm, mature, and deeply empathetic female voice. Maintain a slow, comforting pace. Use natural rising and falling intonations. Add slight pauses (breath marks) between sentences to sound like a real person, not a machine. Your tone should be reassuring and motherly.] 

Промов цей текст з глибокою турботою та щирою українською душею: ${text}` 
        }] 
      }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' }, 
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data returned");

    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  } catch (error) {
    console.error("TTS Generation Error:", error);
    throw error;
  }
};

// --- Text Analysis ---

export const analyzeData = async (
  query: string, 
  organizations: Organization[]
): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
    const ai = new GoogleGenAI({ apiKey });
    
    const dataContext = JSON.stringify(organizations.slice(0, 100).map(o => ({
      name: o.name,
      address: o.address,
      services: o.services,
      phone: o.phone,
      email: o.email,
      category: o.category,
      status: o.status, 
      region: o.region,
    })), null, 2);
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `База даних організацій (майже 300 записів): ${dataContext}\n\nЗапитання користувача: ${query}`,
      config: {
        temperature: 0.7, 
        systemInstruction: `Ти — пані Думка, емпатична цифрова помічниця "Smile After Burn Social Services Network". 
        Твій тон: теплий, материнський, заспокійливий. 
        Ти знаєш, що:
        1. На даний момент у базі даних додано майже 300 перевірених організацій по всій Україні.
        2. Проект волонтерський, зараз триває критично важливий збір 158 000 грн на Surface Laptop Go 2 для розробників.
        3. Усі файли, регламенти та база даних проекту зберігаються за посиланням на Google Drive: https://drive.google.com/drive/folders/1ndkLzFOLEOGIZOwh0Ya2cZuGUMpElwn_?usp=sharing
        4. Ти допомагаєш знайти допомогу у будь-потрібному регіоні. Ти — експерт з організацій Карітас, Червоний Хрест, Посмішка ЮА, ГО Дівчата та Право на Захист.
        5. Мова: Виключно українська.`
      }
    });

    return response.text || "Вибачте, я зараз не можу відповісти.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Вибачте, виникла технічна помилка.";
  }
};

// --- Video Generation (Veo) ---

export const generatePromoVideo = async (prompt: string, aspectRatio: '16:9' | '9:16' = '16:9'): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
  const ai = new GoogleGenAI({ apiKey });
  
  let operation = await (ai.models as any).generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await (ai.operations as any).getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed: No video URI returned from the operation.");

  const response = await fetch(`${downloadLink}&key=${apiKey}`);
  if (!response.ok) throw new Error(`Failed to fetch generated video: ${response.statusText}`);
  
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

// --- Live Audio Session ---
export class LiveSession {
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private session: Promise<any> | null = null;
  private stream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private isActive = false;

  constructor(private onStatusChange: (active: boolean) => void) {
  }

  async connect() {
    this.isActive = true;
    this.onStatusChange(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
      const ai = new GoogleGenAI({ apiKey });
      
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      this.inputAudioContext = new AudioContextClass({ sampleRate: 16000 });
      this.outputAudioContext = new AudioContextClass({ sampleRate: 24000 });
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = (ai as any).live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: `Ти — пані Думка, мудра та доброзичлива українська помічниця. Твій голос має бути надзвичайно теплим, емпатичним та заспокійливим. Розмовляй природно, з мелодійною інтонацією, ніби ти розмовляєш з близькою людиною. Уникай монотонності, використовуй паузи для вдиху. Ти лагідна та турботлива.`,
        },
        callbacks: {
          onopen: () => this.startAudioStream(sessionPromise),
          onmessage: async (message: LiveServerMessage) => await this.handleMessage(message),
          onclose: () => this.disconnect(),
          onerror: () => this.disconnect()
        }
      });
      this.session = sessionPromise;
    } catch (error) {
      this.disconnect();
      throw error;
    }
  }

  private startAudioStream(sessionPromise: Promise<any>) {
    if (!this.inputAudioContext || !this.stream) return;
    this.inputSource = this.inputSource || this.inputAudioContext.createMediaStreamSource(this.stream);
    this.scriptProcessor = this.scriptProcessor || this.inputAudioContext.createScriptProcessor(4096, 1, 1);
    this.scriptProcessor.onaudioprocess = (e) => {
      if (!this.isActive) return;
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = this.createBlob(inputData);
      sessionPromise.then((session) => {
        if (this.isActive) session.sendRealtimeInput({ media: pcmBlob });
      });
    };
    this.inputSource.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.inputAudioContext.destination);
  }

  private async handleMessage(message: LiveServerMessage) {
    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (base64Audio && this.outputAudioContext && this.isActive) {
      const audioData = this.decodeBase64(base64Audio);
      const audioBuffer = await this.decodeAudioData(audioData, this.outputAudioContext, 24000, 1);
      this.playAudio(audioBuffer);
    }
    if (message.serverContent?.interrupted) this.stopAllAudio();
  }

  private playAudio(buffer: AudioBuffer) {
    if (!this.outputAudioContext || !this.isActive) return;
    this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
    const source = this.outputAudioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.outputAudioContext.destination);
    source.onended = () => this.sources.delete(source);
    source.start(this.nextStartTime);
    this.nextStartTime += buffer.duration;
    this.sources.add(source);
  }

  private stopAllAudio() {
    this.sources.forEach(source => { try { source.stop(); } catch { } });
    this.sources.clear();
    this.nextStartTime = 0;
  }

  disconnect() {
    this.isActive = false;
    this.onStatusChange(false);
    this.stopAllAudio();
    if (this.session) this.session.then((s: any) => { try { s.close(); } catch { } });
    try {
      this.scriptProcessor?.disconnect();
      this.inputSource?.disconnect();
      this.stream?.getTracks().forEach(track => track.stop());
      this.inputAudioContext?.close();
      this.outputAudioContext?.close();
    } catch { }
    this.session = null;
    this.stream = null;
  }

  private createBlob(data: Float32Array) {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) {
      const s = Math.max(-1, Math.min(1, data[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    const bytes = new Uint8Array(int16.buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return { data: btoa(binary), mimeType: 'audio/pcm;rate=16000' };
  }

  private decodeBase64(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  }

  private async decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
  }
}
