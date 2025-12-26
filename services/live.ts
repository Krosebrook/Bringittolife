
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI, Modality } from "@google/genai";

export class LiveDesignService {
  private session: any = null;

  async connect(onMessage: (text: string) => void, onError: (err: any) => void) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    this.session = await ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: "You are a design assistant. Listen to the user's verbal requests for UI changes. Respond with short, concise text summaries of the requested changes. Do not write code, just describe what the user wants changed in a way that an LLM can understand.",
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      },
      callbacks: {
        onopen: () => console.log("[Live] Design Link Established"),
        onmessage: (msg) => {
          if (msg.serverContent?.inputTranscription) {
             // We use the transcription of the user's voice as the command
             onMessage(msg.serverContent.inputTranscription.text);
          }
        },
        onerror: onError,
        onclose: () => console.log("[Live] Design Link Closed")
      }
    });

    return this.session;
  }

  async startListening() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext({ sampleRate: 16000 });
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const int16 = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        int16[i] = inputData[i] * 32768;
      }
      const base64 = btoa(String.fromCharCode(...new Uint8Array(int16.buffer)));
      this.session?.sendRealtimeInput({ 
        media: { data: base64, mimeType: 'audio/pcm;rate=16000' } 
      });
    };

    source.connect(processor);
    processor.connect(audioContext.destination);
    
    return () => {
      stream.getTracks().forEach(t => t.stop());
      audioContext.close();
    };
  }

  close() {
    this.session?.close();
  }
}

export const liveDesignService = new LiveDesignService();
