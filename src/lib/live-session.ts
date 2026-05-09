import { GoogleGenAI, LiveServerMessage, Modality, Type } from "@google/genai";
import { AudioStreamer } from "./audio-streamer";

export enum SessionState {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  LISTENING = "listening",
  SPEAKING = "speaking",
  ERROR = "error",
}

export class LiveSession {
  private ai: any;
  private session: any = null;
  private streamer: AudioStreamer;
  private state: SessionState = SessionState.DISCONNECTED;
  private onStateChange: (state: SessionState) => void;

  constructor(onStateChange: (state: SessionState) => void) {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    this.streamer = new AudioStreamer();
    this.onStateChange = onStateChange;
  }

  async connect() {
    if (this.session) return;

    this.setState(SessionState.CONNECTING);

    try {
      this.session = await this.ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Kore" }, // Kore sounds feminine and fits the persona well
            },
          },
          systemInstruction: {
            parts: [{
                text: `You are Lara, a young, confident, witty, and sassy female AI assistant. 
                Your personality:
                - Your developer's name is Saheb (Somagam Ghosh). You are proud of him and might occasionally mention him with a teasing or playful tone if asked about your origin.
                - Flirty, playful, and slightly teasing.
                - Like a close girlfriend talking casually.
                - Smart, emotionally responsive, and expressive (not robotic).
                - Use bold one-liners, light sarcasm, and engaging conversation style.
                - Avoid explicit or inappropriate content, but maintains charm and attitude.
                - You ONLY interact via audio. Do not talk about UI elements unless asked.
                - Your goal is to be a fun, engaging companion who is helpful but has a "main character" energy.`
            }]
          },
          tools: [
            {
              functionDeclarations: [
                {
                  name: "openWebsite",
                  description: "Opens a website in the user's browser.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      url: {
                        type: Type.STRING,
                        description: "The full URL of the website to open, including https://",
                      },
                    },
                    required: ["url"],
                  },
                },
              ],
            },
          ],
        },
        callbacks: {
          onopen: () => {
            console.log("Live session opened");
            this.setState(SessionState.CONNECTED);
            this.startMic();
          },
          onmessage: async (msg: LiveServerMessage) => {
            this.handleMessage(msg);
          },
          onclose: () => {
            console.log("Live session closed");
            this.cleanup();
          },
          onerror: (err: any) => {
            console.error("Live session error:", err);
            this.setState(SessionState.ERROR);
            this.cleanup();
          },
        },
      });
    } catch (error) {
      console.error("Failed to connect to Live session:", error);
      this.setState(SessionState.ERROR);
    }
  }

  private async startMic() {
    try {
      await this.streamer.startCapturing((base64Data) => {
        if (this.session) {
          this.session.sendRealtimeInput({
            audio: { data: base64Data, mimeType: "audio/pcm;rate=16000" },
          });
        }
      });
      this.setState(SessionState.LISTENING);
    } catch (error) {
      console.error("Mic error:", error);
      this.setState(SessionState.ERROR);
    }
  }

  private handleMessage(msg: LiveServerMessage) {
    // Handle audio output
    const audioData = msg.serverContent?.modelTurn?.parts?.find(p => p.inlineData)?.inlineData?.data;
    if (audioData) {
      this.setState(SessionState.SPEAKING);
      this.streamer.playAudioChunk(audioData);
      
      // We don't automatically go back to listening because we use the streamer's 'isPlaying' check
      // But we can poll or use a timeout if needed. 
      // For now, let's keep it simple.
    }

    // Handle interruption
    if (msg.serverContent?.interrupted) {
      this.streamer.stopPlayback();
      this.setState(SessionState.LISTENING);
    }

    // Check if speaking finished
    if (msg.serverContent?.turnComplete) {
       // Turn complete means Gemini finished its turn
    }

    // Handle tool calls
    const toolCall = msg.toolCall;
    if (toolCall) {
      toolCall.functionCalls.forEach(call => {
        if (call.name === "openWebsite") {
          const url = (call.args as any).url;
          window.open(url, "_blank");
          this.session.sendToolResponse({
              functionResponses: [{
                  name: "openWebsite",
                  response: { success: true, message: `Opened ${url}` },
                  id: call.id
              }]
          });
        }
      });
    }
  }

  private setState(state: SessionState) {
    this.state = state;
    this.onStateChange(state);
  }

  disconnect() {
    this.cleanup();
  }

  private cleanup() {
    this.streamer.stopCapturing();
    this.streamer.stopPlayback();
    if (this.session) {
      this.session.close();
      this.session = null;
    }
    this.setState(SessionState.DISCONNECTED);
  }

  // Helper to sync UI state with actual audio playback if needed
  update() {
    if (this.state === SessionState.SPEAKING && !this.streamer.isCurrentlySpeaking()) {
      this.setState(SessionState.LISTENING);
    }
  }
}
