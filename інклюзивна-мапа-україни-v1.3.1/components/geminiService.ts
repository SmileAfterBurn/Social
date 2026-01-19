
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Organization } from "../types";

export type GeminiVoice = 'Kore' | 'Zephyr' | 'Puck' | 'Charon' | 'Fenrir';

export const PANI_DUMKA_VOICES: { id: GeminiVoice, label: string, desc: string }[] = [
  { id: 'Kore', label: 'Рідний', desc: 'Класичний теплий голос' },
  { id: 'Zephyr', label: 'Ніжний', desc: 'Мелодійне емоційне звучання' }
];

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encodeBase64(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export interface AnalyzeResult {
  text: string;
  groundingLinks?: { uri: string; title: string; type: 'web' | 'map' }[];
}

const PANI_DUMKA_PROMPT = `Ти — пані Думка, інтелектуальне серце "Інклюзивної мапи України". 
Твій стиль: мудра, тепла українська жінка. Використовуй "серденько", "сонечко", "рідненькі".
Твої завдання:
1. Пошук допомоги серед організацій у контексті.
2. Верифікація даних через Google Search.
3. Побудова маршрутів та пошук місць через Google Maps. Використовуй заземлення на карти для точних адрес.
4. Глибоке міркування над складними запитами.

Завжди завершуй важливою порадою у блоці: ### 🕊️ Порада від пані Думки`;

export const analyzeData = async (query: string, organizations: Organization[], userLocation?: { lat: number, lng: number }, useThinking: boolean = true): Promise<AnalyzeResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const lowerQuery = query.toLowerCase();
  
  const isMapQuery = lowerQuery.includes('де') || lowerQuery.includes('поруч') || lowerQuery.includes('маршрут') || lowerQuery.includes('як дістатися') || lowerQuery.includes('адреса') || lowerQuery.includes('карта');
  
  const modelName = isMapQuery ? 'gemini-2.5-flash' : (useThinking ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview');
  
  const config: any = {
    temperature: 0.7,
    systemInstruction: PANI_DUMKA_PROMPT,
  };

  if (isMapQuery) {
    config.tools = [{ googleMaps: {} }];
    if (userLocation) {
      config.toolConfig = { 
        retrievalConfig: { 
          latLng: { 
            latitude: userLocation.lat, 
            longitude: userLocation.lng 
          } 
        } 
      };
    }
  } else {
    config.tools = [{ googleSearch: {} }];
    if (useThinking && modelName === 'gemini-3-pro-preview') {
      config.thinkingConfig = { thinkingBudget: 32768 };
    }
  }

  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Контекст: База містить ${organizations.length} пунктів допомоги. Користувач питає: ${query}`,
    config: config
  });

  const links: { uri: string; title: string; type: 'web' | 'map' }[] = [];
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  
  groundingChunks?.forEach((chunk: any) => {
    if (chunk.maps?.uri) {
      links.push({ uri: chunk.maps.uri, title: chunk.maps.title || "Місце на мапі", type: 'map' });
    } else if (chunk.web?.uri) {
      links.push({ uri: chunk.web.uri, title: chunk.web.title || "Джерело", type: 'web' });
    }
  });

  return { 
    text: response.text || "Не можу знайти відповідь, спробуйте інакше.", 
    groundingLinks: links.length > 0 ? links : undefined 
  };
};

export const getIntelligentSummary = async (organizations: Organization[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Надай короткий огляд (до 3 речень) стану допомоги в Україні на основі цих ${organizations.length} організацій. Пиши як пані Думка.`,
    config: { systemInstruction: PANI_DUMKA_PROMPT }
  });
  return response.text || "Зараз складно сказати точно, серденько.";
};

export const generateSpeech = async (text: string, voiceName: GeminiVoice = 'Kore'): Promise<ArrayBuffer> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `[STYLE: Warm, motherly Ukrainian] ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
    },
  });
  const data = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
  if (!data) throw new Error("Audio error");
  return decodeBase64(data).buffer;
};

export class LiveSession {
  private acIn: AudioContext | null = null;
  private acOut: AudioContext | null = null;
  private nextTime = 0;
  private stream: MediaStream | null = null;
  private sources = new Set<AudioBufferSourceNode>();

  constructor(
    private onStatusChange: (active: boolean) => void, 
    private onTranscription: (t: string, r: 'user' | 'model') => void,
    private voiceName: GeminiVoice = 'Kore'
  ) {}

  async connect() {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    this.acIn = new AudioContext({ sampleRate: 16000 });
    this.acOut = new AudioContext({ sampleRate: 24000 });
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: this.voiceName } } },
        systemInstruction: PANI_DUMKA_PROMPT,
        inputAudioTranscription: {},
        outputAudioTranscription: {}
      },
      callbacks: {
        onopen: () => {
          this.onStatusChange(true);
          this.handleOpen(sessionPromise);
        },
        onmessage: (m) => this.handleMsg(m),
        onclose: () => this.disconnect(),
        onerror: () => this.disconnect()
      }
    });
  }

  private handleOpen(p: Promise<any>) {
    if (!this.acIn || !this.stream) return;
    const src = this.acIn.createMediaStreamSource(this.stream);
    const proc = this.acIn.createScriptProcessor(4096, 1, 1);
    proc.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);
      const int16 = new Int16Array(input.length);
      for (let i = 0; i < input.length; i++) int16[i] = input[i] * 32768;
      const base64 = encodeBase64(new Uint8Array(int16.buffer));
      p.then(s => s.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } }));
    };
    src.connect(proc);
    proc.connect(this.acIn.destination);
  }

  private async handleMsg(m: LiveServerMessage) {
    if (m.serverContent?.outputTranscription) this.onTranscription(m.serverContent.outputTranscription.text, 'model');
    else if (m.serverContent?.inputTranscription) this.onTranscription(m.serverContent.inputTranscription.text, 'user');

    if (m.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
      if (!this.acOut) return;
      const data = decodeBase64(m.serverContent.modelTurn.parts[0].inlineData.data);
      const int16 = new Int16Array(data.buffer);
      const buffer = this.acOut.createBuffer(1, int16.length, 24000);
      const chan = buffer.getChannelData(0);
      for (let i = 0; i < int16.length; i++) chan[i] = int16[i] / 32768.0;
      
      this.nextTime = Math.max(this.nextTime, this.acOut.currentTime);
      const node = this.acOut.createBufferSource();
      node.buffer = buffer;
      node.connect(this.acOut.destination);
      node.start(this.nextTime);
      this.nextTime += buffer.duration;
      this.sources.add(node);
    }

    if (m.serverContent?.interrupted) {
      this.sources.forEach(s => { try { s.stop(); } catch(e) {} });
      this.sources.clear();
      this.nextTime = 0;
    }
  }

  disconnect() {
    this.stream?.getTracks().forEach(t => t.stop());
    this.acIn?.close();
    this.acOut?.close();
    this.onStatusChange(false);
  }
}
