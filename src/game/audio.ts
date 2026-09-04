// ---------------------------------------------------------------
// Chiptune audio: square/triangle blips + noise drums + bass loop
// ---------------------------------------------------------------

type Wave = OscillatorType;

const midiHz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

export class AudioSys {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  musicGain: GainNode | null = null;
  muted = false;
  private musicTimer: number | null = null;
  private nextNoteTime = 0;
  private step = 0;
  private pattern: number[] = [];
  private melody: number[] = [];
  private tempo = 0.21;

  unlock(): void {
    if (!this.ctx) {
      try {
        const AC =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.5;
        this.master.connect(this.ctx.destination);
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.16;
        this.musicGain.connect(this.master);
      } catch {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === "suspended") void this.ctx.resume();
  }

  setMuted(m: boolean): void {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 0.5;
  }

  private tone(
    freq: number,
    dur: number,
    type: Wave = "square",
    vol = 0.2,
    slideTo?: number,
    when = 0,
  ): void {
    if (!this.ctx || !this.master || this.muted) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  private noise(dur: number, vol = 0.2, when = 0, lowpass = 3000): void {
    if (!this.ctx || !this.master || this.muted) return;
    const t0 = this.ctx.currentTime + when;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const f = this.ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = lowpass;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(g).connect(this.master);
    src.start(t0);
  }

  // ------------------------- SFX -------------------------
  sfx = {
    jump: () => this.tone(240, 0.16, "square", 0.16, 620),
    land: () => this.noise(0.06, 0.1, 0, 900),
    swing: () => this.noise(0.09, 0.14, 0, 1600),
    hit: () => {
      this.tone(180, 0.09, "square", 0.22, 90);
      this.noise(0.07, 0.18, 0, 2200);
    },
    smash: () => {
      this.tone(120, 0.18, "sawtooth", 0.24, 50);
      this.noise(0.14, 0.22, 0, 1400);
    },
    shoot: () => this.tone(880, 0.1, "square", 0.14, 320),
    spray: () => this.noise(0.22, 0.16, 0, 4200),
    hurt: () => this.tone(300, 0.22, "sawtooth", 0.22, 70),
    shield: () => this.tone(660, 0.1, "triangle", 0.2, 990),
    enemyDie: () => {
      this.tone(420, 0.12, "square", 0.16, 60);
      this.noise(0.12, 0.14, 0, 1800);
    },
    boom: () => {
      this.tone(90, 0.5, "sawtooth", 0.3, 30);
      this.noise(0.45, 0.3, 0, 900);
    },
    pickup: () => {
      this.tone(660, 0.07, "square", 0.16);
      this.tone(990, 0.1, "square", 0.16, undefined, 0.07);
    },
    weapon: () => {
      this.tone(520, 0.07, "square", 0.16);
      this.tone(780, 0.07, "square", 0.16, undefined, 0.07);
      this.tone(1040, 0.12, "square", 0.16, undefined, 0.14);
    },
    oneUp: () => {
      [523, 659, 784, 1047].forEach((f, i) =>
        this.tone(f, 0.12, "square", 0.16, undefined, i * 0.09),
      );
    },
    alarm: () => {
      for (let i = 0; i < 4; i++)
        this.tone(i % 2 ? 392 : 523, 0.16, "square", 0.18, undefined, i * 0.18);
    },
    select: () => this.tone(880, 0.06, "square", 0.14),
    confirm: () => {
      this.tone(660, 0.08, "square", 0.16);
      this.tone(880, 0.12, "square", 0.16, undefined, 0.08);
    },
    gameover: () => {
      [392, 330, 262, 196].forEach((f, i) =>
        this.tone(f, 0.3, "triangle", 0.2, undefined, i * 0.28),
      );
    },
    victory: () => {
      [523, 659, 784, 1047, 784, 1047].forEach((f, i) =>
        this.tone(f, 0.16, "square", 0.16, undefined, i * 0.14),
      );
    },
  };

  // ------------------------- MUSIC -------------------------
  startMusic(kind: "stage1" | "stage2" | "stage3" | "boss"): void {
    if (!this.ctx) return;
    this.stopMusic();
    switch (kind) {
      case "stage1":
        this.pattern = [45, 0, 45, 48, 45, 0, 43, 0, 45, 0, 45, 48, 50, 0, 48, 43];
        this.melody = [69, 0, 72, 0, 74, 0, 72, 69, 0, 67, 0, 69, 0, 0, 64, 0];
        this.tempo = 0.21;
        break;
      case "stage2":
        this.pattern = [41, 0, 41, 44, 41, 0, 46, 0, 41, 0, 41, 44, 48, 0, 46, 44];
        this.melody = [65, 0, 68, 70, 0, 68, 0, 65, 63, 0, 65, 0, 68, 0, 0, 0];
        this.tempo = 0.19;
        break;
      case "stage3":
        this.pattern = [43, 0, 43, 47, 43, 0, 45, 0, 43, 0, 43, 47, 50, 48, 47, 45];
        this.melody = [67, 0, 70, 0, 72, 0, 70, 67, 0, 74, 0, 72, 0, 70, 67, 0];
        this.tempo = 0.17;
        break;
      case "boss":
        this.pattern = [40, 40, 0, 40, 43, 0, 40, 0, 38, 38, 0, 38, 41, 0, 43, 46];
        this.melody = [64, 0, 64, 0, 67, 0, 64, 0, 62, 0, 62, 0, 65, 67, 70, 0];
        this.tempo = 0.15;
        break;
    }
    this.step = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.06;
    this.musicTimer = window.setInterval(() => this.schedule(), 40);
  }

  private schedule(): void {
    if (!this.ctx || !this.musicGain || this.muted) return;
    while (this.nextNoteTime < this.ctx.currentTime + 0.14) {
      const s = this.step % 16;
      const bass = this.pattern[s];
      if (bass > 0)
        this.musicNote(midiHz(bass), this.tempo * 0.92, "triangle", 0.5, this.nextNoteTime);
      const mel = this.melody[s];
      if (mel > 0 && this.step % 32 >= 16)
        this.musicNote(midiHz(mel), this.tempo * 0.5, "square", 0.16, this.nextNoteTime);
      if (s % 4 === 0) this.musicNoise(0.09, 0.5, 700, this.nextNoteTime);
      if (s % 4 === 2) this.musicNoise(0.04, 0.16, 6000, this.nextNoteTime);
      this.nextNoteTime += this.tempo;
      this.step++;
    }
  }

  private musicNote(
    freq: number,
    dur: number,
    type: Wave,
    vol: number,
    when: number,
  ): void {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(vol, when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    osc.connect(g).connect(this.musicGain);
    osc.start(when);
    osc.stop(when + dur + 0.02);
  }

  private musicNoise(dur: number, vol: number, lp: number, when: number): void {
    if (!this.ctx || !this.musicGain) return;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const f = this.ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = lp;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    src.connect(f).connect(g).connect(this.musicGain);
    src.start(when);
  }

  stopMusic(): void {
    if (this.musicTimer !== null) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

export const audio = new AudioSys();
