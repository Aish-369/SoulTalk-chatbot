// Procedural Web Audio API Ambient Sound Generator & Speech Synthesizer

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private currentType: string | null = null;
  private nodes: (AudioNode | number)[] = [];
  private isRunning: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public play(type: 'rain' | 'ocean' | 'night' | 'forest' | 'clouds') {
    this.stop();
    this.initContext();
    if (!this.ctx) return;

    this.currentType = type;
    this.isRunning = true;

    try {
      if (type === 'rain') {
        this.playRain();
      } else if (type === 'ocean') {
        this.playOcean();
      } else if (type === 'night') {
        this.playNight();
      } else if (type === 'forest') {
        this.playForest();
      } else {
        this.playClouds();
      }
    } catch (e) {
      console.warn("Ambient audio init exception:", e);
    }
  }

  private playRain() {
    if (!this.ctx) return;
    // White/Pink noise through bandpass
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    whiteNoise.start();

    this.nodes.push(whiteNoise, filter, gain);
  }

  private playOcean() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 4;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(350, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    // LFO for wave swelling
    const osc = this.ctx.createOscillator();
    osc.frequency.setValueAtTime(0.12, this.ctx.currentTime); // ~8 sec wave period
    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    const mainGain = this.ctx.createGain();
    mainGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    osc.connect(oscGain.gain);
    whiteNoise.connect(filter);
    filter.connect(mainGain);
    mainGain.connect(this.ctx.destination);

    whiteNoise.start();
    osc.start();

    this.nodes.push(whiteNoise, filter, osc, oscGain, mainGain);
  }

  private playNight() {
    if (!this.ctx) return;
    // Ambient sine drone
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(220, this.ctx.currentTime); // A3

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(329.63, this.ctx.currentTime); // E4

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.03, this.ctx.currentTime);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();

    this.nodes.push(osc1, osc2, gain);
  }

  private playForest() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(174.61, this.ctx.currentTime); // F3

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();

    this.nodes.push(osc, filter, gain);
  }

  private playClouds() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(261.63, this.ctx.currentTime); // Middle C

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();

    this.nodes.push(osc, gain);
  }

  public stop() {
    this.isRunning = false;
    this.nodes.forEach(node => {
      try {
        if (typeof node === 'object' && node !== null) {
          if ('stop' in node && typeof (node as any).stop === 'function') {
            (node as any).stop();
          }
          if ('disconnect' in node && typeof (node as any).disconnect === 'function') {
            (node as any).disconnect();
          }
        } else if (typeof node === 'number') {
          clearInterval(node);
          clearTimeout(node);
        }
      } catch (e) {
        // Ignored
      }
    });
    this.nodes = [];
    this.currentType = null;
  }

  public getIsPlaying(): boolean {
    return this.isRunning;
  }
}

export const ambientSound = new AmbientSoundEngine();

// Text To Speech (TTS) Helper
export function speakText(
  text: string,
  options?: {
    pitch?: number;
    rate?: number;
    onStart?: () => void;
    onEnd?: () => void;
  }
) {
  if (!('speechSynthesis' in window)) {
    console.warn("Speech synthesis not supported on this browser.");
    return;
  }

  window.speechSynthesis.cancel(); // Stop any pending speech

  const cleanText = text.replace(/[*#_~`]/g, '').trim();
  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.pitch = options?.pitch ?? 1.1; // Slightly sweet, gentle companion pitch
  utterance.rate = options?.rate ?? 0.95;  // Calm, relaxed cadence

  // Pick a smooth voice if available
  const voices = window.speechSynthesis.getVoices();
  const gentleVoice = voices.find(v => 
    v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Karen'))
  );
  if (gentleVoice) {
    utterance.voice = gentleVoice;
  }

  if (options?.onStart) utterance.onstart = options.onStart;
  if (options?.onEnd) utterance.onend = options.onEnd;
  utterance.onerror = () => {
    if (options?.onEnd) options.onEnd();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
