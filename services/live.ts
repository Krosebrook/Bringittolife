
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI, Modality, Blob } from "@google/genai";

function encode(bytes: Uint8Array) {
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

  async connect(onMessage: (text: string) => void, onError: (err: any) => void) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    this.sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: "You are a design assistant. Transcribe the user's verbal requests for UI changes into short, descriptive summaries. Only output the summarized requirement.",
        inputAudioTranscription: {},
      },
      callbacks: {
        onopen: () => console.log("[Live] Session Opened"),
        onmessage: (msg) => {
          if (msg.serverContent?.inputTranscription) {
             onMessage(msg.serverContent.inputTranscription.text);
          }
        },
        onerror: onError,
        onclose: () => {
          console.log("[Live] Session Closed");
          this.sessionPromise = null;
        }
      }
    });

    return this.sessionPromise;
  }

  async startListening() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext({ sampleRate: 16000 });
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmBlob = this.createBlob(inputData);
        
        if (this.sessionPromise) {
          this.sessionPromise.then((session) => {
            session.sendRealtimeInput({ media: pcmBlob });
          }).catch(console.error);
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
      
      this.audioCleanup = () => {
        stream.getTracks().forEach(t => t.stop());
        audioContext.close();
      };
    } catch (err) {
      console.error("[Live] Mic error:", err);
      throw err;
    }
  }

  private createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
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
