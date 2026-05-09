/**
 * AudioStreamer handles capturing audio from the microphone (16kHz PCM)
 * and playing back audio chunks received from Gemini (24kHz PCM).
 */

export class AudioStreamer {
  private inputContext: AudioContext | null = null;
  private outputContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private scheduledTime: number = 0;
  private isPlaying: boolean = false;

  constructor(private sampleRateInput: number = 16000, private sampleRateOutput: number = 24000) {}

  async startCapturing(onAudioData: (base64Data: string) => void) {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: this.sampleRateInput,
      });

      if (this.inputContext.state === 'suspended') {
        await this.inputContext.resume();
      }

      this.source = this.inputContext.createMediaStreamSource(this.stream);
      this.processor = this.inputContext.createScriptProcessor(4096, 1, 1);

      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16Data = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16Data[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        
        const uint8Data = new Uint8Array(pcm16Data.buffer);
        let binary = '';
        for (let i = 0; i < uint8Data.length; i++) {
          binary += String.fromCharCode(uint8Data[i]);
        }
        onAudioData(window.btoa(binary));
      };

      this.source.connect(this.processor);
      this.processor.connect(this.inputContext.destination);
    } catch (error) {
      console.error('Error starting audio capture:', error);
      throw error;
    }
  }

  stopCapturing() {
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.inputContext) {
      this.inputContext.close();
      this.inputContext = null;
    }
  }

  async playAudioChunk(base64Data: string) {
    if (!this.outputContext) {
      this.outputContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: this.sampleRateOutput,
      });
      this.scheduledTime = this.outputContext.currentTime;
    }

    if (this.outputContext.state === 'suspended') {
      await this.outputContext.resume();
    }

    const binary = window.atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const pcm16Data = new Int16Array(bytes.buffer);
    const float32Data = new Float32Array(pcm16Data.length);
    for (let i = 0; i < pcm16Data.length; i++) {
      float32Data[i] = pcm16Data[i] / 0x8000;
    }

    const audioBuffer = this.outputContext.createBuffer(1, float32Data.length, this.sampleRateOutput);
    audioBuffer.getChannelData(0).set(float32Data);

    const source = this.outputContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.outputContext.destination);

    const startTime = Math.max(this.scheduledTime, this.outputContext.currentTime);
    source.start(startTime);
    this.scheduledTime = startTime + audioBuffer.duration;
    this.isPlaying = true;
    
    source.onended = () => {
        if (this.outputContext && this.outputContext.currentTime >= this.scheduledTime) {
            this.isPlaying = false;
        }
    };
  }

  stopPlayback() {
    if (this.outputContext) {
      this.outputContext.close();
      this.outputContext = null;
      this.scheduledTime = 0;
      this.isPlaying = false;
    }
  }

  isCurrentlySpeaking() {
      return this.isPlaying;
  }
}
