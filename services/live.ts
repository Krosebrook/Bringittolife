
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI, Modality, Blob, LiveServerMessage } from "@google/genai";

function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export class LiveDesignService {
  private sessionPromise: Promise<any> | null = null;
  private audioCleanup: (() => void) | null = null;

  async connect(onTranscription: (text: string) => void, onError: (err: any) => void) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    this.sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: "You are a design assistant. Your ONLY job is to transcribe the user's verbal requests for UI changes. Output a concise summary of their request.",
        inputAudioTranscription: {},
      },
      callbacks: {
        onopen: () => console.debug("[Live] Stream Established"),
        onmessage: (msg: LiveServerMessage) => {
          if (msg.serverContent?.inputTranscription) {
            onTranscription(msg.serverContent.inputTranscription.text);
          }
        },
        onerror: (e) => {
          console.error("[Live] Stream Error:", e);
          onError(e);
        },
        onclose: () => {
          console.debug("[Live] Stream Closed");
          this.sessionPromise = null;
        }
      }
    });

    return this.sessionPromise;
  }

  async startListening() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmBlob = this.createBlob(inputData);
        
        // Use the promise to send data only when the session is ready
        if (this.sessionPromise) {
          this.sessionPromise.then((session) => {
            session.sendRealtimeInput({ media: pcmBlob });
          }).catch(err => console.error("[Live] Send Failed:", err));
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
      
      this.audioCleanup = () => {
        stream.getTracks().forEach(t => t.stop());
        if (audioContext.state !== 'closed') audioContext.close();
      };
    } catch (err) {
      console.error("[Live] Microphone Initialization Failed:", err);
      throw err;
    }
  }

  private createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      // Normalize Float32 to Int16 for PCM
      int16[i] = Math.max(-1, Math.min(1, data[i])) * 0x7FFF;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  close() {
    if (this.audioCleanup) {
      this.audioCleanup();
      this.audioCleanup = null;
    }
    if (this.sessionPromise) {
      this.sessionPromise.then(session => session.close()).catch(() => {});
      this.sessionPromise = null;
    }
  }
}

export const liveDesignService = new LiveDesignService();
