// Web Audio API synthesizer for anime effects and keyboard typing clicks

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playKeyClick() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

export function playBankaiSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // Sub-bass heavy impact
    const oscSub = ctx.createOscillator();
    const gainSub = ctx.createGain();
    oscSub.type = 'sine';
    oscSub.frequency.setValueAtTime(140, t);
    oscSub.frequency.exponentialRampToValueAtTime(32, t + 1.2);

    gainSub.gain.setValueAtTime(0.4, t);
    gainSub.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

    oscSub.connect(gainSub);
    gainSub.connect(ctx.destination);
    oscSub.start(t);
    oscSub.stop(t + 1.5);

    // Resonant spiritual pressure drone
    const oscSaw = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gainSaw = ctx.createGain();

    oscSaw.type = 'sawtooth';
    oscSaw.frequency.setValueAtTime(65, t);
    oscSaw.frequency.exponentialRampToValueAtTime(130, t + 0.8);
    oscSaw.frequency.exponentialRampToValueAtTime(45, t + 2.2);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.linearRampToValueAtTime(1800, t + 0.5);
    filter.frequency.exponentialRampToValueAtTime(150, t + 2.0);

    gainSaw.gain.setValueAtTime(0.001, t);
    gainSaw.gain.linearRampToValueAtTime(0.25, t + 0.2);
    gainSaw.gain.exponentialRampToValueAtTime(0.001, t + 2.2);

    oscSaw.connect(filter);
    filter.connect(gainSaw);
    gainSaw.connect(ctx.destination);

    oscSaw.start(t);
    oscSaw.stop(t + 2.2);
  } catch {
    // Ignore error
  }
}

export function playShadowCloneSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // Poof noise burst
    const bufferSize = ctx.sampleRate * 0.35;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(220, t + 0.3);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(t);

    // Multi-whistle clone swooshes
    for (let i = 0; i < 3; i++) {
      const delay = i * 0.06;
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600 + i * 200, t + delay);
      osc.frequency.exponentialRampToValueAtTime(180, t + delay + 0.2);

      oscGain.gain.setValueAtTime(0.12, t + delay);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.25);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      osc.start(t + delay);
      osc.stop(t + delay + 0.25);
    }
  } catch {
    // Ignore error
  }
}

export function playClearSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(260, t + 0.2);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.25);
  } catch {
    // Ignore
  }
}
