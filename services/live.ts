
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI, Modality, Blob } from "@google/genai";

/**
 * Encodes a Uint8Array to a Base64 string manually.
 * Adheres to Gemini API guidelines avoiding external library bloat.
 */
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * LiveDesignService: Real-time Multimodal Interaction
 * ---------------------------------------------------------
 * Manages low-latency WebSocket connections for voice-driven design commands.
 */
export class LiveDesignService {
  private sessionPromise: Promise<any> | null = null;

  /**
   * Establishes a connection to the Gemini Live API.
   * @param onMessage Callback for receiving transcribed design commands.
   * @param onError Callback for handling socket or model errors.
   */
  async connect(onMessage: (text: string) => void, onError: (err: any) => void) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // We use a promise-based approach to ensure the socket is open before sending data.
    this.sessionPromise = ai.live.connect({
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
             onMessage(msg.serverContent.inputTranscription.text);
          }
        },
        onerror: onError,
        onclose: () => {
          console.log("[Live] Design Link Closed");
          this.sessionPromise = null;
        }
      }
    });

    return this.sessionPromise;
  }

  /**
   * Initializes the microphone and begins streaming PCM audio to the model.
   */
  async startListening() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext({ sampleRate: 16000 });
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = this.createBlob(inputData);
      
      // CRITICAL: Prevent race conditions by ensuring session is resolved before sending.
      if (this.sessionPromise) {
        this.sessionPromise.then((session) => {
          session.sendRealtimeInput({ media: pcmBlob });
        }).catch(err => {
          console.error("[Live] Transmission Fault:", err);
        });
      }
    };

    source.connect(processor);
    processor.connect(audioContext.destination);
    
    return () => {
      stream.getTracks().forEach(t => t.stop());
      audioContext.close();
      this.close();
    };
  }

  /**
   * Converts raw Float32 data from the microphone into 16-bit PCM for the Gemini API.
   */
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

  /**
   * Gracefully shuts down the active session.
   */
  close() {
    if (this.sessionPromise) {
      this.sessionPromise.then(session => {
        try {
          session.close();
        } catch (e) {
          // Ignore close faults
        }
      });
      this.sessionPromise = null;
    }
  }
}

export const liveDesignService = new LiveDesignService();
