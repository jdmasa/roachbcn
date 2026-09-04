import {
  drawSprite,
  PAL,
  INDIBIL_IDLE,
  INDIBIL_WALK,
  INDIBIL_ATTACK,
  MERIDA_IDLE,
  MERIDA_WALK,
  MERIDA_ATTACK,
  CUCARACHA_A,
  CUCARACHA_B,
  HORMIGA_A,
  HORMIGA_B,
  PELOTERO_A,
  PELOTERO_B,
  PELOTA,
  MANTIS_A,
  MANTIS_B,
  CUCAREY_A,
  CUCAREY_B,
  MANTIS_BOSS_A,
  MANTIS_BOSS_B,
  REINA_A,
  REINA_B,
  BOCADILLO,
  ZUMO,
  INSECTICIDA,
  PISTOLA,
  CASCO,
  RODILLERAS,
  PAPELERA,
  PAPELERA_ROTA,
  GOTITA,
  NUBE,
  ACIDO,
} from "./sprites";
import type { Sprite } from "./sprites";
import { audio } from "./audio";

// ------------------------------------------------------------------
export const VIEW_W = 264;
export const VIEW_H = 232;
const HUD_H = 22;
const BELT_TOP = 140;
const BELT_BOT = 216;
const GRAV = 980;
const HI_KEY = "plaga-hiscore-v1";

const WHITE_PAL: Record<string, string> = {};
for (const k of Object.keys(PAL)) WHITE_PAL[k] = "#ffffff";

const loadHi = (): number => {
  try {
    return Number(localStorage.getItem(HI_KEY) ?? "0") || 0;
  } catch {
    return 0;
  }
};
const saveHiVal = (v: number): void => {
  try {
    localStorage.setItem(HI_KEY, String(v));
  } catch {
    /* sin almacenamiento */
  }
};

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const irnd = (n: number) => Math.floor(Math.random() * n);
const srnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ------------------------------------------------------------------
export type CharId = "indibil" | "merida";
export type EnemyType =
  | "cucaracha"
  | "hormiga"
  | "pelotero"
  | "mantis"
  | "cucarey"
  | "mantisboss"
  | "reina";
export type PickupKind =
  | "bocadillo"
  | "zumo"
  | "insecticida"
  | "pistola"
  | "casco"
  | "rodilleras";

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  a: boolean;
  b: boolean;
}

export interface EngineHooks {
  onGameOver: (score: number, hi: number) => void;
  onVictory: (stats: { score: number; kills: number; time: number }) => void;
  onPauseKey: () => void;
}

export interface CharDef {
  id: CharId;
  name: string;
  age: string;
  rol: string;
  weapon: string;
  desc: string;
  speed: number;
  maxHp: number;
  dmg: number;
  atkCd: number;
  range: number;
  jumpV: number;
  stats: { fuerza: number; velocidad: number; vida: number };
  idle: Sprite;
  walk: Sprite;
  attack: Sprite;
  color: string;
}

export const CHAR_DEFS: Record<CharId, CharDef> = {
  indibil: {
    id: "indibil",
    name: "INDÍBIL",
    age: "6 AÑOS",
    rol: "FUERZA BRUTA",
    weapon: "ESCOBA JUSTICIERA",
    desc: "Lento pero demoledor. Su escoba barre cucarachas de tres en tres.",
    speed: 66,
    maxHp: 130,
    dmg: 20,
    atkCd: 0.42,
    range: 40,
    jumpV: 250,
    stats: { fuerza: 5, velocidad: 2, vida: 5 },
    idle: INDIBIL_IDLE,
    walk: INDIBIL_WALK,
    attack: INDIBIL_ATTACK,
    color: "#e8434f",
  },
  merida: {
    id: "merida",
    name: "MÉRIDA",
    age: "10 AÑOS",
    rol: "VELOCIDAD TURBO",
    weapon: "PATINES TURBO",
    desc: "Rápida como el metro en hora punta. Combos de patinazo sin pausa.",
    speed: 104,
    maxHp: 95,
    dmg: 11,
    atkCd: 0.2,
    range: 30,
    jumpV: 280,
    stats: { fuerza: 2, velocidad: 5, vida: 3 },
    idle: MERIDA_IDLE,
    walk: MERIDA_WALK,
    attack: MERIDA_ATTACK,
    color: "#3fd0c9",
  },
};

// ------------------------------------------------------------------
interface EnemyDef {
  w: number;
  h: number;
  scale: number;
  a: Sprite;
  b: Sprite;
  hp: number;
  speed: number;
  dmg: number;
  score: number;
  range: number;
  atkCd: number;
  boss?: boolean;
}

const ENEMY_DEFS: Record<EnemyType, EnemyDef> = {
  cucaracha: { w: 16, h: 18, scale: 2, a: CUCARACHA_A, b: CUCARACHA_B, hp: 34, speed: 52, dmg: 9, score: 100, range: 24, atkCd: 1.1 },
  hormiga: { w: 12, h: 12, scale: 2, a: HORMIGA_A, b: HORMIGA_B, hp: 18, speed: 84, dmg: 6, score: 80, range: 20, atkCd: 0.9 },
  pelotero: { w: 16, h: 14, scale: 2, a: PELOTERO_A, b: PELOTERO_B, hp: 78, speed: 38, dmg: 14, score: 220, range: 26, atkCd: 1.4 },
  mantis: { w: 14, h: 16, scale: 2, a: MANTIS_A, b: MANTIS_B, hp: 56, speed: 74, dmg: 12, score: 260, range: 30, atkCd: 1.0 },
  cucarey: { w: 30, h: 26, scale: 2, a: CUCAREY_A, b: CUCAREY_B, hp: 420, speed: 40, dmg: 14, score: 2000, range: 40, atkCd: 1.6, boss: true },
  mantisboss: { w: 28, h: 24, scale: 2, a: MANTIS_BOSS_A, b: MANTIS_BOSS_B, hp: 520, speed: 62, dmg: 15, score: 3000, range: 44, atkCd: 1.3, boss: true },
  reina: { w: 33, h: 24, scale: 2, a: REINA_A, b: REINA_B, hp: 640, speed: 46, dmg: 16, score: 5000, range: 46, atkCd: 1.5, boss: true },
};

// ------------------------------------------------------------------
export interface StageDef {
  name: string;
  sub: string;
  skyTop: string;
  skyBot: string;
  stars: boolean;
  farCol: string;
  midCols: [string, string];
  winCol: string;
  roadCol: string;
  sideCol: string;
  accent: string;
  waves: { x: number; spawns: [EnemyType, number][] }[];
  length: number;
  boss: EnemyType;
  props: number[];
  music: "stage1" | "stage2" | "stage3";
}

export const STAGES: StageDef[] = [
  {
    name: "EL RAVAL",
    sub: "FASE 1",
    skyTop: "#241a4e",
    skyBot: "#c75b3f",
    stars: false,
    farCol: "#3b2b66",
    midCols: ["#5a3f7d", "#4c3468"],
    winCol: "#ffd23f",
    roadCol: "#453a56",
    sideCol: "#6b5a80",
    accent: "#ffd23f",
    waves: [
      { x: 60, spawns: [["cucaracha", 2], ["hormiga", 1]] },
      { x: 480, spawns: [["cucaracha", 2], ["hormiga", 2]] },
      { x: 900, spawns: [["pelotero", 1], ["cucaracha", 2]] },
      { x: 1320, spawns: [["cucaracha", 2], ["hormiga", 3]] },
    ],
    length: 1850,
    boss: "cucarey",
    props: [260, 700, 1150, 1550],
    music: "stage1",
  },
  {
    name: "PASSEIG DE GRÀCIA",
    sub: "FASE 2",
    skyTop: "#0b1030",
    skyBot: "#27408f",
    stars: true,
    farCol: "#232a5e",
    midCols: ["#3a4380", "#2f3768"],
    winCol: "#4dd6ff",
    roadCol: "#33304e",
    sideCol: "#55507a",
    accent: "#4dd6ff",
    waves: [
      { x: 60, spawns: [["cucaracha", 2], ["hormiga", 2]] },
      { x: 460, spawns: [["mantis", 1], ["cucaracha", 2]] },
      { x: 880, spawns: [["pelotero", 2], ["hormiga", 2]] },
      { x: 1300, spawns: [["mantis", 1], ["cucaracha", 3]] },
      { x: 1650, spawns: [["pelotero", 1], ["mantis", 1], ["hormiga", 2]] },
    ],
    length: 2100,
    boss: "mantisboss",
    props: [230, 640, 1050, 1450, 1850],
    music: "stage2",
  },
  {
    name: "SAGRADA FAMÍLIA",
    sub: "FASE FINAL",
    skyTop: "#1a0f2e",
    skyBot: "#9be04a",
    stars: true,
    farCol: "#2c1f4d",
    midCols: ["#45336b", "#382a56"],
    winCol: "#ffd23f",
    roadCol: "#3c3352",
    sideCol: "#5f537e",
    accent: "#a8e85a",
    waves: [
      { x: 60, spawns: [["cucaracha", 3], ["hormiga", 2]] },
      { x: 440, spawns: [["mantis", 2], ["hormiga", 2]] },
      { x: 860, spawns: [["pelotero", 2], ["cucaracha", 2]] },
      { x: 1280, spawns: [["mantis", 2], ["pelotero", 1]] },
      { x: 1650, spawns: [["cucaracha", 3], ["mantis", 1], ["hormiga", 3]] },
    ],
    length: 2150,
    boss: "reina",
    props: [220, 620, 1020, 1420, 1820],
    music: "stage3",
  },
];

const PICKUP_DEFS: Record<PickupKind, { spr: Sprite; label: string }> = {
  bocadillo: { spr: BOCADILLO, label: "BOCADILLO +35" },
  zumo: { spr: ZUMO, label: "ZUMO +18" },
  insecticida: { spr: INSECTICIDA, label: "INSECTICIDA" },
  pistola: { spr: PISTOLA, label: "PISTOLA LEJÍA" },
  casco: { spr: CASCO, label: "CASCO +3 GOLPES" },
  rodilleras: { spr: RODILLERAS, label: "RODILLERAS" },
};

// ------------------------------------------------------------------
interface Enemy {
  type: EnemyType;
  def: EnemyDef;
  x: number; y: number; z: number; vz: number;
  dir: 1 | -1;
  hp: number;
  state: "enter" | "chase" | "windup" | "strike" | "hurt" | "dead";
  t: number;
  anim: number;
  atkCd: number;
  flash: number;
  boss: boolean;
  pattern: number;
  summoned: number;
  shotCd: number;
  dashVx: number;
  deathT: number;
}

interface Shot {
  x: number; y: number; z: number;
  vx: number;
  vy: number;
  dmg: number;
  kind: "water" | "spray" | "pelota" | "acido";
  from: "player" | "enemy";
  life: number;
}

interface Pickup {
  x: number; y: number; z: number; vz: number;
  kind: PickupKind;
  t: number;
}

interface Particle {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  life: number; t: number;
  color: string;
  size: number;
}

interface Popup {
  x: number; y: number;
  text: string;
  t: number;
  color: string;
  big: boolean;
}

interface Prop { x: number; y: number; hp: number; broken: boolean }

interface PlayerState {
  x: number; y: number; z: number; vz: number;
  dir: 1 | -1;
  hp: number;
  atkCd: number;
  atkT: number;
  invuln: number;
  hurtT: number;
  shield: number;
  weapon: null | { kind: "spray" | "water"; ammo: number };
  anim: number;
  moving: boolean;
  dead: boolean;
  deathT: number;
  respawnT: number;
}

// ------------------------------------------------------------------
export class Engine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  input: InputState;
  hooks: EngineHooks;
  char: CharDef;

  raf = 0;
  last = 0;
  time = 0;
  paused = false;
  destroyed = false;
  private musicKind: "stage1" | "stage2" | "stage3" | "boss" = "stage1";

  // world
  stageIdx = 0;
  stage: StageDef = STAGES[0];
  camX = 0;
  gateX = 0;
  gateActive = false;
  waveIdx = 0;
  bossActive = false;
  bossRef: Enemy | null = null;
  stageClearT = -1;
  over = false;

  player: PlayerState;
  enemies: Enemy[] = [];
  shots: Shot[] = [];
  pickups: Pickup[] = [];
  particles: Particle[] = [];
  popups: Popup[] = [];
  props: Prop[] = [];

  score = 0;
  hi = 0;
  lives = 3;
  kills = 0;
  combo = 0;
  comboT = 0;
  nextLifeAt = 10000;

  shake = 0;
  freeze = 0;
  flashT = 0;
  flashCol = "#ffffff";
  banner = { title: "", sub: "", t: 0 };
  prevA = false;
  prevB = false;

  private keyDown: (e: KeyboardEvent) => void;
  private keyUp: (e: KeyboardEvent) => void;

  constructor(canvas: HTMLCanvasElement, charId: CharId, input: InputState, hooks: EngineHooks) {
    this.canvas = canvas;
    canvas.width = VIEW_W;
    canvas.height = VIEW_H;
    this.ctx = canvas.getContext("2d")!;
    this.ctx.imageSmoothingEnabled = false;
    this.input = input;
    this.hooks = hooks;
    this.char = CHAR_DEFS[charId];
    this.player = this.freshPlayer();
    this.hi = loadHi();

    this.keyDown = (e) => this.onKey(e, true);
    this.keyUp = (e) => this.onKey(e, false);
    window.addEventListener("keydown", this.keyDown);
    window.addEventListener("keyup", this.keyUp);

    this.startStage(0);
  }

  private freshPlayer(): PlayerState {
    return {
      x: 36, y: (BELT_TOP + BELT_BOT) / 2, z: 0, vz: 0, dir: 1,
      hp: CHAR_DEFS[this.char.id].maxHp, atkCd: 0, atkT: 0, invuln: 1.2,
      hurtT: 0, shield: 0, weapon: null, anim: 0, moving: false,
      dead: false, deathT: 0, respawnT: 0,
    };
  }

  private onKey(e: KeyboardEvent, down: boolean): void {
    const k = e.key.toLowerCase();
    if (["arrowleft", "arrowright", "arrowup", "arrowdown", " "].includes(k)) e.preventDefault();
    if (k === "arrowleft" || k === "a") this.input.left = down;
    if (k === "arrowright" || k === "d") this.input.right = down;
    if (k === "arrowup" || k === "w") this.input.up = down;
    if (k === "arrowdown" || k === "s") this.input.down = down;
    if (k === " " || k === "x" || k === "k") this.input.a = down;
    if (k === "z" || k === "j") this.input.b = down;
    if (down && (k === "enter" || k === "p")) this.hooks.onPauseKey();
  }

  start(): void {
    this.last = performance.now();
    const loop = (t: number) => {
      if (this.destroyed) return;
      const dt = Math.min(0.033, (t - this.last) / 1000);
      this.last = t;
      if (!this.paused) this.update(dt);
      this.render();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  destroy(): void {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener("keydown", this.keyDown);
    window.removeEventListener("keyup", this.keyUp);
    audio.stopMusic();
  }

  setPaused(p: boolean): void {
    if (this.paused === p) return;
    this.paused = p;
    if (p) audio.stopMusic();
    else if (!this.over) audio.startMusic(this.musicKind);
  }

  // ------------------------- STAGES -------------------------
  private startStage(i: number): void {
    this.stageIdx = i;
    this.stage = STAGES[i];
    this.camX = 0;
    this.gateActive = false;
    this.waveIdx = 0;
    this.bossActive = false;
    this.bossRef = null;
    this.enemies = [];
    this.shots = [];
    this.pickups = [];
    this.popups = [];
    this.props = this.stage.props.map((x) => ({ x, y: BELT_TOP - 8 + srnd(x) * 10, hp: 2, broken: false }));
    const p = this.player;
    p.x = 36;
    p.y = (BELT_TOP + BELT_BOT) / 2;
    p.z = 0;
    p.invuln = 1.5;
    p.dead = false;
    p.weapon = null;
    p.hp = Math.min(CHAR_DEFS[this.char.id].maxHp, p.hp + 35);
    this.musicKind = this.stage.music;
    audio.startMusic(this.stage.music);
    this.banner = { title: this.stage.sub, sub: this.stage.name, t: 2.4 };
  }

  private spawnWave(idx: number): void {
    const w = this.stage.waves[idx];
    this.gateActive = true;
    this.gateX = this.camX;
    let side = 0;
    for (const [type, count] of w.spawns) {
      for (let i = 0; i < count; i++) {
        const fromLeft = side++ % 2 === 0 && Math.random() < 0.4;
        this.spawnEnemy(type, fromLeft ? this.camX - 20 : this.camX + VIEW_W + 20, rnd(BELT_TOP + 6, BELT_BOT - 6));
      }
    }
    this.popup(this.player.x, BELT_TOP - 6, "¡BICHOS!", "#ffd23f", false);
  }

  private spawnEnemy(type: EnemyType, x: number, y: number): Enemy {
    const def = ENEMY_DEFS[type];
    const e: Enemy = {
      type, def, x, y, z: 0, vz: 0, dir: x > this.player.x ? -1 : 1,
      hp: def.hp, state: def.boss ? "enter" : "enter", t: 0, anim: Math.random() * 10,
      atkCd: rnd(0.4, 1), flash: 0, boss: !!def.boss, pattern: 0, summoned: 0,
      shotCd: rnd(1, 2), dashVx: 0, deathT: 0,
    };
    this.enemies.push(e);
    if (def.boss) this.bossRef = e;
    return e;
  }

  private startBoss(): void {
    this.bossActive = true;
    this.gateActive = true;
    this.gateX = this.stage.length - VIEW_W;
    this.camX = this.stage.length - VIEW_W;
    const def = ENEMY_DEFS[this.stage.boss];
    this.popup(this.player.x, BELT_TOP - 10, "¡ALERTA!", "#ff4757", true);
    this.banner = { title: "JEFE FINAL", sub: this.bossName(this.stage.boss), t: 2.6 };
    audio.sfx.alarm();
    this.musicKind = "boss";
    audio.startMusic("boss");
    this.spawnEnemy(this.stage.boss, this.camX + VIEW_W + 30, (BELT_TOP + BELT_BOT) / 2);
    void def;
  }

  private bossName(t: EnemyType): string {
    if (t === "cucarey") return "CUCAREY I";
    if (t === "mantisboss") return "MANTIS-3000";
    return "REINA HORMIGA";
  }

  // ------------------------- UPDATE -------------------------
  private update(dt: number): void {
    if (this.freeze > 0) {
      this.freeze -= dt;
      return;
    }
    this.time += dt;
    this.shake = Math.max(0, this.shake - dt * 22);
    this.flashT = Math.max(0, this.flashT - dt);
    if (this.banner.t > 0) this.banner.t -= dt;

    const p = this.player;
    const def = this.char;

    // --- stage flow
    if (!this.over && !this.bossActive && this.stageClearT < 0) {
      if (this.waveIdx < this.stage.waves.length && p.x > this.stage.waves[this.waveIdx].x) {
        this.spawnWave(this.waveIdx);
        this.waveIdx++;
      }
      if (this.gateActive && this.enemies.length === 0) this.gateActive = false;
      if (this.waveIdx >= this.stage.waves.length && p.x > this.stage.length - 60) {
        this.startBoss();
      }
    }
    if (this.stageClearT >= 0) {
      this.stageClearT -= dt;
      if (this.stageClearT <= 0) {
        this.stageClearT = -1;
        this.startStage(this.stageIdx + 1);
      }
    }

    // --- combo timer
    if (this.comboT > 0) {
      this.comboT -= dt;
      if (this.comboT <= 0) this.combo = 0;
    }

    this.updatePlayer(dt);
    for (const e of this.enemies) this.updateEnemy(e, dt);
    this.separate();
    this.enemies = this.enemies.filter((e) => !(e.state === "dead" && e.deathT <= 0));
    this.updateShots(dt);
    this.updatePickups(dt);
    this.updateParticles(dt);
    this.popups = this.popups.filter((pp) => (pp.t -= dt) > 0);

    // --- camera
    const camMax = this.bossActive || this.gateActive
      ? this.gateX
      : this.stage.length - VIEW_W;
    const target = clamp(p.x - VIEW_W * 0.42, 0, Math.max(0, camMax));
    this.camX += (target - this.camX) * Math.min(1, dt * 8);
    if (this.bossActive) this.camX = this.stage.length - VIEW_W;
  }

  private updatePlayer(dt: number): void {
    const p = this.player;
    const def = this.char;
    const inp = this.input;
    p.anim += dt;
    p.atkCd = Math.max(0, p.atkCd - dt);
    p.atkT = Math.max(0, p.atkT - dt);
    p.invuln = Math.max(0, p.invuln - dt);
    p.hurtT = Math.max(0, p.hurtT - dt);

    if (p.dead) {
      p.deathT -= dt;
      if (this.over) return;
      if (p.deathT <= 0) {
        this.lives--;
        if (this.lives > 0) {
          p.dead = false;
          p.hp = def.maxHp;
          p.invuln = 2.2;
          p.x = this.camX + 40;
          p.y = (BELT_TOP + BELT_BOT) / 2;
          p.z = 0;
          p.weapon = null;
          this.shots = this.shots.filter((s) => s.from !== "enemy");
          this.banner = { title: "¡SIGUE!", sub: `VIDAS ${this.lives}`, t: 1.6 };
        } else {
          this.gameOver();
        }
      }
      return;
    }

    // movement
    let dx = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
    let dy = (inp.down ? 1 : 0) - (inp.up ? 1 : 0);
    const len = Math.hypot(dx, dy);
    if (len > 0) {
      dx /= len;
      dy /= len;
    }
    const slow = p.atkT > 0 ? 0.25 : 1;
    p.moving = len > 0;
    if (dx !== 0) p.dir = dx > 0 ? 1 : -1;
    p.x += dx * def.speed * slow * dt;
    p.y += dy * def.speed * 0.72 * slow * dt;

    // character trail: skates spark, boots puff
    if (p.moving && p.z === 0 && Math.random() < dt * 22) {
      if (def.id === "merida") {
        this.particles.push({
          x: p.x - p.dir * 8 + rnd(-3, 3), y: p.y + rnd(-2, 2), z: 2,
          vx: -p.dir * rnd(20, 60), vy: rnd(-8, 8), vz: rnd(20, 70),
          life: rnd(0.15, 0.3), t: 0, color: Math.random() < 0.5 ? "#54d8ff" : "#f6f3e7", size: 2,
        });
      } else {
        this.particles.push({
          x: p.x - p.dir * 6 + rnd(-3, 3), y: p.y + rnd(-2, 2), z: 1,
          vx: -p.dir * rnd(10, 40), vy: rnd(-6, 6), vz: rnd(8, 40),
          life: rnd(0.18, 0.32), t: 0, color: "#6b5a80", size: 2,
        });
      }
    }

    const camMin = this.camX + 12;
    const camMaxP = this.camX + VIEW_W - 12;
    p.x = clamp(p.x, camMin, camMaxP);
    p.y = clamp(p.y, BELT_TOP, BELT_BOT);

    // jump
    const aPressed = inp.a && !this.prevA;
    const bPressed = inp.b && !this.prevB;
    this.prevA = inp.a;
    this.prevB = inp.b;

    if (aPressed && p.z === 0) {
      p.vz = def.jumpV;
      audio.sfx.jump();
      this.dust(p.x, p.y, 4);
    }
    if (p.z > 0 || p.vz > 0) {
      p.z += p.vz * dt;
      p.vz -= GRAV * dt;
      if (p.z <= 0) {
        p.z = 0;
        p.vz = 0;
        this.dust(p.x, p.y, 3);
        audio.sfx.land();
      }
    }

    if (bPressed) this.doAttack();
  }

  private doAttack(): void {
    const p = this.player;
    const def = this.char;
    if (p.atkCd > 0) return;
    p.atkCd = def.atkCd;
    p.atkT = 0.16;

    if (p.weapon && p.weapon.ammo > 0) {
      p.weapon.ammo--;
      const w = p.weapon;
      if (w.kind === "water") {
        this.shots.push({ x: p.x + p.dir * 10, y: p.y, z: 18, vx: p.dir * 260, vy: 0, dmg: 9, kind: "water", from: "player", life: 1.2 });
        audio.sfx.shoot();
      } else {
        this.shots.push({ x: p.x + p.dir * 10, y: p.y, z: 16, vx: p.dir * 150, vy: 0, dmg: 15, kind: "spray", from: "player", life: 0.55 });
        audio.sfx.spray();
      }
      if (p.weapon.ammo <= 0) {
        p.weapon = null;
        this.popup(p.x, BELT_TOP - 4, "SIN MUNICIÓN", "#8b8fa0", false);
      }
      return;
    }

    // melee
    audio.sfx.swing();
    let hitAny = false;
    for (const e of this.enemies) {
      if (e.state === "dead") continue;
      const reach = def.range + (e.def.w * e.def.scale) / 2;
      const ex = e.x - p.x;
      const front = p.dir === 1 ? ex > -8 : ex < 8;
      if (front && Math.abs(ex) < reach && Math.abs(e.y - p.y) < 26 && e.z < 46) {
        this.damageEnemy(e, def.dmg, p.dir);
        hitAny = true;
      }
    }
    // props
    for (const pr of this.props) {
      if (pr.broken) continue;
      const ex = pr.x - p.x;
      const front = p.dir === 1 ? ex > -8 : ex < 8;
      if (front && Math.abs(ex) < def.range + 10 && Math.abs(pr.y - p.y) < 24) {
        pr.hp--;
        this.dust(pr.x, pr.y, 3);
        if (pr.hp <= 0) this.breakProp(pr);
      }
    }
    if (hitAny) {
      this.freeze = Math.max(this.freeze, 0.045);
      audio.sfx.hit();
      this.shake = Math.max(this.shake, 3);
    }
  }

  private breakProp(pr: Prop): void {
    pr.broken = true;
    audio.sfx.smash();
    this.dust(pr.x, pr.y, 8);
    const kinds: PickupKind[] = ["bocadillo", "zumo", "insecticida", "pistola", "casco", "rodilleras"];
    const weights = [0.26, 0.22, 0.16, 0.16, 0.11, 0.09];
    this.dropPickup(pr.x, pr.y - 6, this.weighted(kinds, weights));
  }

  private weighted<T>(items: T[], w: number[]): T {
    let r = Math.random();
    for (let i = 0; i < items.length; i++) {
      r -= w[i];
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  private dropPickup(x: number, y: number, kind: PickupKind): void {
    this.pickups.push({ x, y, z: 20, vz: 120, kind, t: 0 });
  }

  private damageEnemy(e: Enemy, dmg: number, dir: 1 | -1): void {
    if (e.state === "dead") return;
    e.hp -= dmg;
    e.flash = 0.1;
    e.x += dir * (e.boss ? 2 : 7);
    this.popup(e.x, e.y - e.def.h * e.def.scale - e.z - 4, `${dmg}`, "#ffffff", false);
    this.burst(e.x, e.y - 12, e.z, "#a8e85a", 5);
    if (e.hp <= 0) this.killEnemy(e);
    else if (!e.boss && e.state !== "windup") {
      e.state = "hurt";
      e.t = 0.22;
      e.dashVx = dir * 60;
    }
  }

  private killEnemy(e: Enemy): void {
    e.state = "dead";
    e.deathT = e.boss ? 1.3 : 0.32;
    this.kills++;
    this.combo = Math.min(5, this.combo + 1);
    this.comboT = 2.2;
    const pts = e.def.score * this.combo;
    this.score += pts;
    this.popup(e.x, e.y - e.def.h * e.def.scale - 10, `${pts}`, e.boss ? "#ffd23f" : "#a8e85a", e.boss);
    if (this.combo > 1) this.popup(e.x, e.y - e.def.h * e.def.scale - 22, `x${this.combo}`, "#4dd6ff", false);
    this.burst(e.x, e.y - 10, e.z, e.boss ? "#ffd23f" : "#e8434f", e.boss ? 26 : 12);
    audio.sfx.enemyDie();

    if (e.boss) this.onBossDown(e);
    else if (Math.random() < 0.2) {
      const kinds: PickupKind[] = ["bocadillo", "zumo", "insecticida", "pistola", "casco", "rodilleras"];
      this.dropPickup(e.x, e.y, kinds[irnd(kinds.length)]);
    }
    if (this.score >= this.nextLifeAt) {
      this.nextLifeAt += 10000;
      this.lives++;
      this.popup(this.player.x, BELT_TOP - 12, "¡1UP!", "#ffd23f", true);
      audio.sfx.oneUp();
    }
  }

  private onBossDown(e: Enemy): void {
    this.shots = this.shots.filter((s) => s.from !== "enemy");
    for (const other of this.enemies) {
      if (other !== e && other.state !== "dead") this.killEnemy(other);
    }
    this.shake = 10;
    this.flashT = 0.4;
    this.flashCol = "#ffffff";
    audio.sfx.boom();
    audio.stopMusic();
    const isFinal = this.stageIdx === STAGES.length - 1;
    if (isFinal) {
      this.over = true;
      this.saveHi();
      window.setTimeout(() => {
        audio.sfx.victory();
        this.hooks.onVictory({ score: this.score, kills: this.kills, time: Math.floor(this.time) });
      }, 1400);
    } else {
      this.banner = { title: "¡FASE COMPLETADA!", sub: `+1000 PTS`, t: 2.4 };
      this.score += 1000;
      this.stageClearT = 2.4;
    }
  }

  private damagePlayer(dmg: number, fromX: number): void {
    const p = this.player;
    if (p.invuln > 0 || p.dead || this.over) return;
    if (p.shield > 0) {
      p.shield--;
      p.invuln = 0.6;
      this.popup(p.x, p.y - 50, "¡BLOQUEADO!", "#4dd6ff", false);
      audio.sfx.shield();
      return;
    }
    p.hp -= dmg;
    p.hurtT = 0.3;
    p.invuln = 1.0;
    const dir: 1 | -1 = p.x < fromX ? -1 : 1;
    p.x = clamp(p.x + dir * 12, this.camX + 12, this.camX + VIEW_W - 12);
    this.shake = Math.max(this.shake, 5);
    this.flashT = 0.12;
    this.flashCol = "#e8434f";
    this.burst(p.x, p.y - 20, 0, "#e8434f", 8);
    this.popup(p.x, p.y - 54, `-${dmg}`, "#ff4757", false);
    audio.sfx.hurt();
    if (p.hp <= 0) {
      p.hp = 0;
      p.dead = true;
      p.deathT = 1.2;
      this.burst(p.x, p.y - 16, 0, "#ffd23f", 18);
      audio.sfx.boom();
    }
  }

  private gameOver(): void {
    this.over = true;
    this.saveHi();
    audio.stopMusic();
    audio.sfx.gameover();
    this.hooks.onGameOver(this.score, this.hi);
  }

  private saveHi(): void {
    if (this.score > this.hi) {
      this.hi = this.score;
      saveHiVal(this.hi);
    }
  }

  // ------------------------- ENEMIES -------------------------
  private updateEnemy(e: Enemy, dt: number): void {
    const p = this.player;
    e.anim += dt;
    e.flash = Math.max(0, e.flash - dt);
    e.atkCd = Math.max(0, e.atkCd - dt);
    e.shotCd = Math.max(0, e.shotCd - dt);
    e.t -= dt;

    if (e.z > 0 || e.vz > 0) {
      e.z += e.vz * dt;
      e.vz -= GRAV * dt;
      if (e.z <= 0) {
        e.z = 0;
        e.vz = 0;
        if (e.boss) this.landShock(e);
      }
    }

    if (e.state === "dead") {
      e.deathT -= dt;
      if (e.boss && e.deathT > 0 && Math.random() < 0.3) {
        this.burst(e.x + rnd(-20, 20), e.y - rnd(0, 30), e.z, Math.random() < 0.5 ? "#ffd23f" : "#ff8f3f", 8);
        if (Math.random() < 0.2) audio.sfx.boom();
        this.shake = Math.max(this.shake, 4);
      }
      return;
    }

    if (e.state === "hurt") {
      e.x += e.dashVx * dt;
      e.dashVx *= 0.86;
      if (e.t <= 0) e.state = "chase";
      return;
    }

    const dx = p.x - e.x;
    const dy = p.y - e.y;
    const dist = Math.hypot(dx, dy);
    e.dir = dx < 0 ? -1 : 1;

    if (e.boss) {
      this.updateBoss(e, dt, dx, dy, dist);
      return;
    }

    switch (e.state) {
      case "enter": {
        const inside = e.x > this.camX + 14 && e.x < this.camX + VIEW_W - 14;
        if (inside) e.state = "chase";
        else e.x += e.dir * e.def.speed * 1.4 * dt;
        break;
      }
      case "chase": {
        if (e.type === "pelotero" && Math.abs(dx) > 70 && e.shotCd <= 0 && Math.abs(dy) < 30) {
          e.shotCd = rnd(2.2, 3.2);
          const dir: 1 | -1 = dx > 0 ? 1 : -1;
          this.shots.push({ x: e.x + dir * 10, y: e.y, z: 10, vx: dir * 130, vy: 0, dmg: e.def.dmg, kind: "pelota", from: "enemy", life: 2.5 });
          audio.sfx.swing();
          break;
        }
        if (dist > e.def.range) {
          e.x += (dx / dist) * e.def.speed * dt;
          e.y += (dy / dist) * e.def.speed * 0.72 * dt;
        } else if (e.atkCd <= 0) {
          e.state = "windup";
          e.t = e.type === "mantis" ? 0.22 : 0.34;
        }
        e.y = clamp(e.y, BELT_TOP, BELT_BOT);
        break;
      }
      case "windup": {
        if (e.t <= 0) {
          e.state = "strike";
          e.t = 0.16;
          if (e.type === "mantis") e.dashVx = e.dir * 190;
          this.tryHitPlayer(e);
        }
        break;
      }
      case "strike": {
        if (e.type === "mantis") {
          e.x += e.dashVx * dt;
          this.tryHitPlayer(e);
        }
        if (e.t <= 0) {
          e.state = "chase";
          e.atkCd = e.def.atkCd * rnd(0.8, 1.3);
        }
        break;
      }
    }
  }

  private updateBoss(e: Enemy, dt: number, dx: number, dy: number, dist: number): void {
    const p = this.player;
    switch (e.state) {
      case "enter": {
        const targetX = this.camX + VIEW_W - 70;
        if (e.x > targetX) e.x -= e.def.speed * 1.2 * dt;
        else {
          e.state = "chase";
          e.t = rnd(1.0, 1.6);
        }
        break;
      }
      case "chase": {
        if (dist > e.def.range + 6) {
          e.x += (dx / dist) * e.def.speed * dt;
          e.y += (dy / dist) * e.def.speed * 0.72 * dt;
        }
        e.y = clamp(e.y, BELT_TOP, BELT_BOT);
        if (e.t <= 0) {
          const roll = Math.random();
          if (e.type !== "pelotero" && e.shotCd <= 0 && roll < 0.34) {
            e.state = "windup";
            e.t = 0.5;
            e.pattern = 1; // shoot
          } else if (e.summoned < 4 && e.type !== "cucarey" && roll < 0.55) {
            e.state = "windup";
            e.t = 0.5;
            e.pattern = 2; // summon
          } else if (e.type !== "mantisboss" && roll < 0.75 && e.z === 0) {
            e.state = "windup";
            e.t = 0.55;
            e.pattern = 3; // jump slam
          } else {
            e.state = "windup";
            e.t = 0.45;
            e.pattern = 0; // charge
          }
          this.popup(e.x, e.y - e.def.h * e.def.scale - 10, "¡!", "#ff4757", true);
        }
        break;
      }
      case "windup": {
        if (e.t <= 0) {
          if (e.pattern === 0) {
            e.state = "strike";
            e.t = 0.55;
            e.dashVx = (dx >= 0 ? 1 : -1) * 210;
          } else if (e.pattern === 1) {
            e.state = "strike";
            e.t = 0.3;
            this.bossShoot(e);
          } else if (e.pattern === 2) {
            e.state = "strike";
            e.t = 0.3;
            e.summoned++;
            const minion: EnemyType = e.type === "reina" ? "hormiga" : "cucaracha";
            const n = e.type === "reina" ? 3 : 2;
            for (let i = 0; i < n && this.enemies.length < 7; i++) {
              this.spawnEnemy(minion, e.x + rnd(-30, 30), clamp(e.y + rnd(-24, 24), BELT_TOP, BELT_BOT));
            }
            audio.sfx.alarm();
          } else {
            e.state = "strike";
            e.t = 0.8;
            e.vz = 300;
            e.z = 1;
            e.dashVx = (p.x - e.x) / 0.55;
          }
        }
        break;
      }
      case "strike": {
        if (e.pattern === 0) {
          e.x += e.dashVx * dt;
          e.x = clamp(e.x, this.camX + 20, this.camX + VIEW_W - 20);
          this.tryHitPlayer(e, 1.4);
          if (e.t <= 0) {
            e.state = "chase";
            e.t = rnd(1.2, 1.8);
            e.atkCd = 0.4;
          }
        } else if (e.pattern === 3) {
          e.x += e.dashVx * dt * 0.6;
          if (e.t <= 0) {
            e.state = "chase";
            e.t = rnd(1.4, 2.0);
          }
        } else {
          if (e.t <= 0) {
            e.state = "chase";
            e.t = rnd(1.2, 1.8);
          }
        }
        break;
      }
    }
  }

  private bossShoot(e: Enemy): void {
    const p = this.player;
    const base = Math.atan2((p.y - e.y) * 0.72, p.x - e.x);
    const n = e.type === "reina" ? 5 : 3;
    for (let i = 0; i < n; i++) {
      const a = base + (i - (n - 1) / 2) * 0.28;
      this.shots.push({
        x: e.x, y: e.y, z: 18,
        vx: Math.cos(a) * 148,
        vy: Math.sin(a) * 148 * 0.72,
        dmg: e.type === "reina" ? 12 : 13,
        kind: "acido", from: "enemy", life: 2.2,
      });
    }
    e.shotCd = rnd(2.4, 3.6);
    audio.sfx.spray();
  }

  private landShock(e: Enemy): void {
    this.shake = Math.max(this.shake, 7);
    audio.sfx.boom();
    this.dust(e.x, e.y, 14);
    const p = this.player;
    if (p.z < 14 && Math.hypot(p.x - e.x, (p.y - e.y) * 1.6) < 62) {
      this.damagePlayer(e.def.dmg + 4, e.x);
    }
  }

  private tryHitPlayer(e: Enemy, mult = 1): void {
    const p = this.player;
    if (p.dead) return;
    const w = (e.def.w * e.def.scale) / 2 + 8;
    if (Math.abs(p.x - e.x) < w && Math.abs(p.y - e.y) < 22 && p.z < 34) {
      this.damagePlayer(Math.round(e.def.dmg * mult), e.x);
    }
  }

  private separate(): void {
    const es = this.enemies.filter((e) => e.state !== "dead");
    for (let i = 0; i < es.length; i++) {
      for (let j = i + 1; j < es.length; j++) {
        const a = es[i], b = es[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        if (Math.abs(dx) < 18 && Math.abs(dy) < 12) {
          const push = dx >= 0 ? 1 : -1;
          if (!a.boss) a.x -= push * 0.7;
          if (!b.boss) b.x += push * 0.7;
        }
      }
    }
  }

  // ------------------------- SHOTS / PICKUPS -------------------------
  private updateShots(dt: number): void {
    const p = this.player;
    this.shots = this.shots.filter((s) => {
      s.x += s.vx * dt;
      s.y = clamp(s.y + s.vy * dt, BELT_TOP - 6, BELT_BOT + 6);
      s.life -= dt;
      if (s.life <= 0 || s.x < this.camX - 30 || s.x > this.camX + VIEW_W + 30) return false;
      if (s.from === "player") {
        for (const e of this.enemies) {
          if (e.state === "dead") continue;
          const w = (e.def.w * e.def.scale) / 2;
          if (Math.abs(s.x - e.x) < w + 4 && Math.abs(s.y - e.y) < 20 && Math.abs(s.z - (14 + e.z)) < 26) {
            this.damageEnemy(e, s.dmg, s.vx > 0 ? 1 : -1);
            this.burst(s.x, s.y - s.z, 0, s.kind === "water" ? "#54d8ff" : "#a8e85a", 6);
            audio.sfx.hit();
            if (s.kind === "water") return false;
            s.dmg = Math.max(4, s.dmg - 3);
          }
        }
        return true;
      }
      // enemy shot
      if (!p.dead && Math.abs(s.x - p.x) < 12 && Math.abs(s.y - p.y) < 16 && Math.abs(s.z - (12 + p.z)) < 22) {
        this.damagePlayer(s.dmg, s.x);
        this.burst(s.x, s.y - s.z, 0, "#a8e85a", 5);
        return false;
      }
      return true;
    });
  }

  private updatePickups(dt: number): void {
    const p = this.player;
    this.pickups = this.pickups.filter((pk) => {
      pk.t += dt;
      if (pk.z > 0 || pk.vz !== 0) {
        pk.z += pk.vz * dt;
        pk.vz -= 500 * dt;
        if (pk.z <= 0) {
          pk.z = 0;
          pk.vz = 0;
        }
      }
      if (pk.t > 14) return false;
      if (!p.dead && Math.abs(pk.x - p.x) < 16 && Math.abs(pk.y - p.y) < 16) {
        this.collect(pk.kind);
        return false;
      }
      return true;
    });
  }

  private collect(kind: PickupKind): void {
    const p = this.player;
    const def = this.char;
    const label = PICKUP_DEFS[kind].label;
    this.popup(p.x, p.y - 58, label, "#ffd23f", false);
    switch (kind) {
      case "bocadillo":
        p.hp = Math.min(def.maxHp, p.hp + 35);
        audio.sfx.pickup();
        break;
      case "zumo":
        p.hp = Math.min(def.maxHp, p.hp + 18);
        audio.sfx.pickup();
        break;
      case "insecticida":
        p.weapon = { kind: "spray", ammo: 10 };
        audio.sfx.weapon();
        break;
      case "pistola":
        p.weapon = { kind: "water", ammo: 18 };
        audio.sfx.weapon();
        break;
      case "casco":
        p.shield = 3;
        audio.sfx.weapon();
        break;
      case "rodilleras":
        p.shield = Math.max(p.shield, 2);
        p.hp = Math.min(def.maxHp, p.hp + 10);
        audio.sfx.weapon();
        break;
    }
    this.score += 50;
  }

  // ------------------------- FX -------------------------
  private burst(x: number, y: number, z: number, color: string, n: number): void {
    for (let i = 0; i < n; i++) {
      this.particles.push({
        x, y, z: z + rnd(0, 10),
        vx: rnd(-90, 90), vy: rnd(-40, 40), vz: rnd(40, 190),
        life: rnd(0.25, 0.55), t: 0, color, size: irnd(2) + 2,
      });
    }
  }

  private dust(x: number, y: number, n: number): void {
    for (let i = 0; i < n; i++) {
      this.particles.push({
        x: x + rnd(-6, 6), y, z: 0,
        vx: rnd(-40, 40), vy: rnd(-14, 14), vz: rnd(10, 60),
        life: rnd(0.2, 0.4), t: 0, color: "#8b8fa0", size: 2,
      });
    }
  }

  private updateParticles(dt: number): void {
    this.particles = this.particles.filter((pt) => {
      pt.t += dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.z += pt.vz * dt;
      pt.vz -= 500 * dt;
      if (pt.z < 0) pt.z = 0;
      return pt.t < pt.life;
    });
  }

  private popup(x: number, y: number, text: string, color: string, big: boolean): void {
    this.popups.push({ x, y, text, t: big ? 1.4 : 0.9, color, big });
  }

  // =========================== RENDER ===========================
  private render(): void {
    const ctx = this.ctx;
    const cam = Math.round(this.camX);
    ctx.save();
    if (this.shake > 0) {
      ctx.translate(Math.round(rnd(-this.shake, this.shake) * 0.5), Math.round(rnd(-this.shake, this.shake) * 0.5));
    }

    this.drawSky(cam);
    this.drawSkylineFar(cam);
    this.drawSkylineMid(cam);
    this.drawRoad(cam);

    // props
    for (const pr of this.props) {
      const sx = pr.x - cam;
      if (sx < -30 || sx > VIEW_W + 30) continue;
      this.shadow(sx, pr.y, 12);
      drawSprite(ctx, pr.broken ? PAPELERA_ROTA : PAPELERA, Math.round(sx - 12), Math.round(pr.y - (pr.broken ? 12 : 24)), 2);
    }

    // pickups
    for (const pk of this.pickups) {
      if (pk.t > 11 && Math.floor(pk.t * 6) % 2 === 0) continue; // blink before despawn
      const sx = pk.x - cam;
      const bob = pk.z === 0 ? Math.sin(pk.t * 5) * 2 : 0;
      this.shadow(sx, pk.y, 8);
      const spr = PICKUP_DEFS[pk.kind].spr;
      drawSprite(ctx, spr, Math.round(sx - spr[0].length), Math.round(pk.y - spr.length * 2 - pk.z - bob), 2);
    }

    // entities sorted by depth
    const ents: { y: number; draw: () => void }[] = [];
    for (const e of this.enemies) {
      ents.push({ y: e.y, draw: () => this.drawEnemy(e, cam) });
    }
    if (!this.player.dead || this.player.deathT > 0.6) {
      ents.push({ y: this.player.y, draw: () => this.drawPlayer(cam) });
    }
    ents.sort((a, b) => a.y - b.y);
    for (const en of ents) en.draw();

    this.drawShots(cam);
    this.drawParticles(cam);
    this.drawPopups(cam);
    this.drawOverlays();
    this.drawHUD();

    ctx.restore();

    if (this.flashT > 0) {
      ctx.globalAlpha = Math.min(0.75, this.flashT * 2.4);
      ctx.fillStyle = this.flashCol;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      ctx.globalAlpha = 1;
    }
  }

  private shadow(x: number, y: number, w: number): void {
    this.ctx.fillStyle = "rgba(10,6,20,0.35)";
    this.ctx.beginPath();
    this.ctx.ellipse(x, y + 2, w, w * 0.32, 0, 0, Math.PI * 2);
    this.ctx.fill();
  }

  // --- background
  private drawSky(cam: number): void {
    const ctx = this.ctx;
    const st = this.stage;
    const g = ctx.createLinearGradient(0, HUD_H, 0, BELT_TOP);
    g.addColorStop(0, st.skyTop);
    g.addColorStop(1, st.skyBot);
    ctx.fillStyle = g;
    ctx.fillRect(0, HUD_H, VIEW_W, BELT_TOP - HUD_H);

    if (st.stars) {
      for (let i = 0; i < 26; i++) {
        const x = (srnd(i) * VIEW_W * 1.4 - cam * 0.06) % VIEW_W;
        const xx = x < 0 ? x + VIEW_W : x;
        const y = HUD_H + 6 + srnd(i + 50) * 60;
        const tw = 0.5 + 0.5 * Math.sin(this.time * 2 + i);
        ctx.globalAlpha = 0.4 + tw * 0.5;
        ctx.fillStyle = "#ffe9b0";
        ctx.fillRect(Math.round(xx), Math.round(y), 1, 1);
      }
      ctx.globalAlpha = 1;
      // moon
      ctx.fillStyle = "#ffe9b0";
      const mx = ((210 - cam * 0.05) % (VIEW_W + 60)) ;
      ctx.fillRect(Math.round(mx), HUD_H + 14, 14, 14);
      ctx.fillStyle = st.skyTop;
      ctx.fillRect(Math.round(mx) + 4, HUD_H + 12, 12, 12);
    } else {
      // setting sun
      const sx = 190 - cam * 0.04;
      ctx.fillStyle = "#ffd23f";
      ctx.fillRect(Math.round(sx), HUD_H + 42, 22, 22);
      ctx.fillStyle = "#ff8f3f";
      ctx.fillRect(Math.round(sx) + 2, HUD_H + 52, 18, 12);
    }
  }

  private tileIndex(cam: number, par: number, period: number): number {
    return Math.floor((cam * par) / period);
  }

  private drawSkylineFar(cam: number): void {
    const ctx = this.ctx;
    const par = 0.2;
    const period = 300;
    const idx = this.tileIndex(cam, par, period);
    ctx.fillStyle = this.stage.farCol;
    for (let t = idx; t <= idx + 2; t++) {
      const baseX = Math.round(t * period - cam * par);
      if (baseX > VIEW_W || baseX + period < 0) continue;
      const kind = ((t % 4) + 4) % 4;
      const gy = BELT_TOP - 2;
      // generic blocks
      const heights = [34, 52, 40, 60, 30];
      for (let i = 0; i < 5; i++) {
        const h = heights[i] + srnd(t * 7 + i) * 14;
        ctx.fillRect(baseX + i * 60, gy - h, 44, h);
      }
      if (kind === 0) this.drawSagrada(baseX + 90, gy, this.stage.farCol);
      else if (kind === 1) this.drawGlories(baseX + 130, gy, this.stage.farCol);
      else if (kind === 2) this.drawTorreMapfre(baseX + 120, gy, this.stage.farCol);
      else this.drawSagrada(baseX + 200, gy, this.stage.farCol);
    }
  }

  private drawSagrada(x: number, gy: number, col: string): void {
    const ctx = this.ctx;
    ctx.fillStyle = col;
    const towers = [
      [0, 74, 10], [16, 92, 12], [34, 100, 14], [54, 92, 12], [70, 74, 10],
    ];
    for (const [dx, h, w] of towers) {
      const tx = x + dx;
      ctx.fillRect(tx, gy - h, w, h);
      // tapered tip (parabolic crown)
      for (let i = 0; i < 5; i++) {
        const tw = Math.max(2, w - i * 2);
        ctx.fillRect(tx + (w - tw) / 2, gy - h - 3 - i * 3, tw, 3);
      }
      ctx.fillRect(tx + w / 2 - 1, gy - h - 20, 2, 4);
    }
  }

  private drawGlories(x: number, gy: number, col: string): void {
    const ctx = this.ctx;
    ctx.fillStyle = col;
    for (let i = 0; i < 10; i++) {
      const w = 26 - Math.abs(i - 6) * 2.6;
      ctx.fillRect(x + (26 - w) / 2, gy - 8 - i * 9, w, 9);
    }
  }

  private drawTorreMapfre(x: number, gy: number, col: string): void {
    const ctx = this.ctx;
    ctx.fillStyle = col;
    ctx.fillRect(x, gy - 96, 20, 96);
    ctx.fillRect(x + 6, gy - 104, 8, 8);
    ctx.fillRect(x + 9, gy - 112, 2, 8);
  }

  private drawSkylineMid(cam: number): void {
    const ctx = this.ctx;
    const par = 0.5;
    const period = 220;
    const idx = this.tileIndex(cam, par, period);
    const gy = BELT_TOP - 1;
    for (let t = idx; t <= idx + 2; t++) {
      const baseX = Math.round(t * period - cam * par);
      if (baseX > VIEW_W || baseX + period < 0) continue;
      for (let i = 0; i < 3; i++) {
        const seed = t * 13 + i;
        const w = 52 + srnd(seed) * 18;
        const h = 40 + srnd(seed + 1) * 34;
        const bx = baseX + i * 74;
        ctx.fillStyle = this.stage.midCols[i % 2];
        ctx.fillRect(bx, gy - h, w, h);
        // roof edge
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(bx, gy - h, w, 3);
        // windows
        for (let wy = 0; wy < Math.floor((h - 12) / 11); wy++) {
          for (let wx = 0; wx < Math.floor((w - 10) / 12); wx++) {
            const on = srnd(seed * 31 + wy * 7 + wx) > 0.45;
            const flick = srnd(seed + wy + wx) > 0.92 && Math.floor(this.time * 2 + seed) % 2 === 0;
            ctx.fillStyle = on && !flick ? this.stage.winCol : "rgba(10,8,24,0.55)";
            ctx.globalAlpha = on ? 0.85 : 1;
            ctx.fillRect(bx + 6 + wx * 12, gy - h + 8 + wy * 11, 6, 7);
            ctx.globalAlpha = 1;
          }
        }
        // awning on ground floor
        if (srnd(seed + 2) > 0.5) {
          ctx.fillStyle = this.stage.accent;
          ctx.globalAlpha = 0.5;
          for (let s = 0; s < 4; s++) {
            ctx.fillRect(bx + 4 + s * 12, gy - 14, 8, 3 + (s % 2) * 2);
          }
          ctx.globalAlpha = 1;
        }
      }
    }
  }

  private drawRoad(cam: number): void {
    const ctx = this.ctx;
    // sidewalk band
    ctx.fillStyle = this.stage.sideCol;
    ctx.fillRect(0, BELT_TOP - 14, VIEW_W, 14);
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(0, BELT_TOP - 2, VIEW_W, 2);
    // asphalt
    ctx.fillStyle = this.stage.roadCol;
    ctx.fillRect(0, BELT_TOP, VIEW_W, VIEW_H - BELT_TOP);
    // depth stripes
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(0, BELT_TOP + 22, VIEW_W, 3);
    ctx.fillRect(0, BELT_TOP + 50, VIEW_W, 4);
    // lane dashes
    ctx.fillStyle = "rgba(255,255,255,0.14)";
    const off = -((cam) % 26);
    for (let x = off; x < VIEW_W; x += 26) {
      ctx.fillRect(x, BELT_TOP + 40, 12, 2);
    }
    // manholes
    const mhOff = -((cam) % 190);
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    for (let x = mhOff; x < VIEW_W; x += 190) {
      ctx.fillRect(x + 60, BELT_TOP + 58, 16, 5);
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(x + 62, BELT_TOP + 59, 12, 1);
      ctx.fillStyle = "rgba(0,0,0,0.28)";
    }
    // street lamps (world-fixed, parallax 1)
    const lampSpacing = 230;
    const first = Math.floor(cam / lampSpacing) - 1;
    for (let i = first; i < first + 3; i++) {
      const lx = i * lampSpacing + 40 - cam;
      if (lx < -20 || lx > VIEW_W + 20) continue;
      ctx.fillStyle = "#181822";
      ctx.fillRect(Math.round(lx), BELT_TOP - 64, 3, 64);
      ctx.fillRect(Math.round(lx) - 5, BELT_TOP - 66, 13, 4);
      ctx.fillStyle = this.stage.winCol;
      ctx.globalAlpha = 0.9;
      ctx.fillRect(Math.round(lx) - 3, BELT_TOP - 62, 9, 4);
      ctx.globalAlpha = 0.12;
      ctx.beginPath();
      ctx.moveTo(Math.round(lx) - 2, BELT_TOP - 58);
      ctx.lineTo(Math.round(lx) + 16, BELT_TOP);
      ctx.lineTo(Math.round(lx) - 18, BELT_TOP);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // --- entities
  private drawSpr(spr: Sprite, x: number, y: number, scale: number, flip: boolean, flash: boolean): void {
    const ctx = this.ctx;
    if (!flash) {
      drawSprite(ctx, spr, x, y, scale, flip);
      return;
    }
    const pal = WHITE_PAL;
    for (let i = 0; i < spr.length; i++) {
      const row = spr[i];
      for (let j = 0; j < row.length; j++) {
        if (row[j] === ".") continue;
        ctx.fillStyle = pal[row[j]] ?? "#fff";
        const px = flip ? x + (row.length - 1 - j) * scale : x + j * scale;
        ctx.fillRect(px, y + i * scale, scale, scale);
      }
    }
  }

  private drawPlayer(cam: number): void {
    const p = this.player;
    const def = this.char;
    if (p.invuln > 0 && !p.dead && Math.floor(p.invuln * 14) % 2 === 0 && p.atkT <= 0) return;
    const sprW = 16 * 2;
    const sprH = def.idle.length * 2;
    const sx = Math.round(p.x - cam - sprW / 2);
    const sy = Math.round(p.y - sprH - p.z);
    this.shadow(Math.round(p.x - cam), p.y, 13);

    let spr = def.idle;
    if (p.dead) spr = def.walk;
    else if (p.atkT > 0) spr = def.attack;
    else if (p.moving || p.z > 0) spr = Math.floor(p.anim * 7) % 2 === 0 ? def.walk : def.idle;
    this.drawSpr(spr, sx, sy, 2, p.dir === -1, p.hurtT > 0 && Math.floor(p.hurtT * 20) % 2 === 0);

    // melee swing arc
    if (p.atkT > 0 && (!p.weapon || p.weapon.ammo <= 0)) {
      const ctx = this.ctx;
      const prog = 1 - p.atkT / 0.16;
      ctx.strokeStyle = def.id === "merida" ? "#54d8ff" : "#ffe9b0";
      ctx.globalAlpha = 0.85 * (1 - prog);
      ctx.lineWidth = 2;
      const cx = Math.round(p.x - cam) + p.dir * 10;
      const cy = Math.round(p.y - 22 - p.z);
      ctx.beginPath();
      const a0 = p.dir === 1 ? -1.2 + prog * 1.6 : Math.PI - 0.4 - prog * 1.6;
      ctx.arc(cx, cy, def.range * 0.75, a0, a0 + p.dir * 1.1, p.dir === -1);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  private drawEnemy(e: Enemy, cam: number): void {
    const ctx = this.ctx;
    const sx = Math.round(e.x - cam);
    if (sx < -60 || sx > VIEW_W + 60) return;
    const sw = e.def.w * e.def.scale;
    const sh = e.def.h * e.def.scale;
    if (e.state === "dead" && !e.boss) {
      ctx.globalAlpha = Math.max(0, e.deathT / 0.32);
    }
    if (e.boss && e.state === "dead") {
      if (Math.floor(e.deathT * 12) % 2 === 0) ctx.globalAlpha = 0.5;
    }
    this.shadow(sx, e.y, sw * 0.42);
    const frame = Math.floor(e.anim * 5) % 2 === 0 ? e.def.a : e.def.b;
    let spr = frame;
    if (e.state === "windup" && Math.floor(e.t * 14) % 2 === 0) spr = e.def.b;
    this.drawSpr(spr, sx - sw / 2, Math.round(e.y - sh - e.z), e.def.scale, e.dir === 1, e.flash > 0);
    ctx.globalAlpha = 1;

    // mini hp bar for damaged non-bosses
    if (!e.boss && e.hp < e.def.hp && e.state !== "dead") {
      const w = sw;
      const pct = e.hp / e.def.hp;
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(sx - w / 2, Math.round(e.y - sh - e.z) - 5, w, 3);
      ctx.fillStyle = pct > 0.5 ? "#a8e85a" : "#ff4757";
      ctx.fillRect(sx - w / 2 + 1, Math.round(e.y - sh - e.z) - 4, Math.round((w - 2) * pct), 1);
    }
  }

  private drawShots(cam: number): void {
    const ctx = this.ctx;
    for (const s of this.shots) {
      const sx = Math.round(s.x - cam);
      const sy = Math.round(s.y - s.z);
      if (s.kind === "water") drawSprite(ctx, GOTITA, sx - 3, sy - 4, 1, s.vx < 0);
      else if (s.kind === "spray") {
        ctx.globalAlpha = Math.min(1, s.life * 2.4);
        drawSprite(ctx, NUBE, sx - 8, sy - 5, 2, s.vx < 0);
        ctx.globalAlpha = 1;
      } else if (s.kind === "pelota") {
        drawSprite(ctx, PELOTA, sx - 8, sy - 8, 2);
      } else {
        drawSprite(ctx, ACIDO, sx - 6, sy - 5, 2);
      }
    }
  }

  private drawParticles(cam: number): void {
    const ctx = this.ctx;
    for (const pt of this.particles) {
      const a = 1 - pt.t / pt.life;
      ctx.globalAlpha = a;
      ctx.fillStyle = pt.color;
      ctx.fillRect(Math.round(pt.x - cam), Math.round(pt.y - pt.z), pt.size, pt.size);
    }
    ctx.globalAlpha = 1;
  }

  private drawPopups(cam: number): void {
    const ctx = this.ctx;
    for (const pp of this.popups) {
      const age = pp.big ? 1.4 : 0.9;
      const a = Math.min(1, pp.t / (age * 0.5));
      const rise = (age - pp.t) * 16;
      const size = pp.big ? 12 : 8;
      ctx.font = `${size}px "Press Start 2P", monospace`;
      ctx.textAlign = "center";
      ctx.globalAlpha = a;
      const x = Math.round(clamp(pp.x - cam, 24, VIEW_W - 24));
      const y = Math.round(pp.y - rise);
      ctx.fillStyle = "#14101f";
      ctx.fillText(pp.text, x - 1, y);
      ctx.fillText(pp.text, x + 1, y);
      ctx.fillText(pp.text, x, y - 1);
      ctx.fillStyle = pp.color;
      ctx.fillText(pp.text, x, y);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = "left";
  }

  private drawOverlays(): void {
    const ctx = this.ctx;
    // AVANZA arrows
    const showArrow =
      !this.bossActive && !this.gateActive && !this.over && this.stageClearT < 0 &&
      this.enemies.length === 0 && this.waveIdx < this.stage.waves.length ||
      (!this.bossActive && !this.gateActive && !this.over && this.stageClearT < 0 &&
        this.enemies.length === 0 && this.waveIdx >= this.stage.waves.length &&
        this.player.x < this.stage.length - 90);
    if (showArrow && Math.floor(this.time * 4) % 2 === 0) {
      ctx.fillStyle = "#ffd23f";
      for (let i = 0; i < 2; i++) {
        const ax = VIEW_W - 20 - i * 10;
        const ay = (BELT_TOP + BELT_BOT) / 2;
        ctx.beginPath();
        ctx.moveTo(ax, ay - 9);
        ctx.lineTo(ax + 8, ay);
        ctx.lineTo(ax, ay + 9);
        ctx.closePath();
        ctx.fill();
      }
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.textAlign = "right";
      ctx.fillStyle = "#14101f";
      ctx.fillText("AVANZA", VIEW_W - 5, (BELT_TOP + BELT_BOT) / 2 - 15 + 1);
      ctx.fillStyle = "#ffd23f";
      ctx.fillText("AVANZA", VIEW_W - 6, (BELT_TOP + BELT_BOT) / 2 - 16);
      ctx.textAlign = "left";
    }

    // boss bar
    const b = this.bossRef;
    if (this.bossActive && b && b.state !== "dead") {
      const bw = 130;
      const bx = (VIEW_W - bw) / 2;
      ctx.fillStyle = "rgba(0,0,0,0.65)";
      ctx.fillRect(bx - 3, HUD_H + 4, bw + 6, 12);
      ctx.fillStyle = "#14101f";
      ctx.fillRect(bx, HUD_H + 7, bw, 6);
      const pct = Math.max(0, b.hp / b.def.hp);
      ctx.fillStyle = "#ff4757";
      ctx.fillRect(bx + 1, HUD_H + 8, Math.round((bw - 2) * pct), 4);
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffd23f";
      ctx.fillText(this.bossName(this.stage.boss), VIEW_W / 2, HUD_H + 3);
      ctx.textAlign = "left";
    }

    // banner
    if (this.banner.t > 0) {
      const t = this.banner.t;
      const inT = clamp((2.6 - t) / 0.25, 0, 1);
      const outT = clamp(t / 0.3, 0, 1);
      const a = Math.min(inT, outT);
      const off = (1 - inT) * 60;
      ctx.globalAlpha = a * 0.85;
      ctx.fillStyle = "#14101f";
      ctx.fillRect(0, 84, VIEW_W, 46);
      ctx.fillStyle = this.stage.accent;
      ctx.fillRect(0, 84, VIEW_W, 2);
      ctx.fillRect(0, 128, VIEW_W, 2);
      ctx.globalAlpha = a;
      ctx.font = '14px "Press Start 2P", monospace';
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(this.banner.title, VIEW_W / 2 + off, 104);
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillStyle = this.stage.accent;
      ctx.fillText(this.banner.sub, VIEW_W / 2 - off, 120);
      ctx.textAlign = "left";
      ctx.globalAlpha = 1;
    }

    // combo
    if (this.combo > 1 && this.comboT > 0) {
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textAlign = "right";
      ctx.fillStyle = "#14101f";
      ctx.fillText(`COMBO x${this.combo}`, VIEW_W - 5, VIEW_H - 6 + 1);
      ctx.fillStyle = Math.floor(this.time * 6) % 2 === 0 ? "#4dd6ff" : "#a8e85a";
      ctx.fillText(`COMBO x${this.combo}`, VIEW_W - 6, VIEW_H - 7);
      ctx.textAlign = "left";
    }
  }

  private drawHUD(): void {
    const ctx = this.ctx;
    const p = this.player;
    const def = this.char;
    ctx.fillStyle = "rgba(10,7,24,0.92)";
    ctx.fillRect(0, 0, VIEW_W, HUD_H);
    ctx.fillStyle = this.stage.accent;
    ctx.fillRect(0, HUD_H - 1, VIEW_W, 1);

    // portrait
    ctx.fillStyle = def.color;
    ctx.fillRect(2, 2, 20, 18);
    ctx.fillStyle = "#14101f";
    ctx.fillRect(4, 4, 16, 14);
    drawSprite(ctx, def.idle, 4, 1, 1, false);

    // hp bar
    const hpw = 56;
    const pct = clamp(p.hp / def.maxHp, 0, 1);
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillStyle = "#8b8fa0";
    ctx.fillText("VIDA", 26, 8);
    ctx.fillStyle = "#14101f";
    ctx.fillRect(26, 10, hpw + 2, 8);
    ctx.fillStyle = pct > 0.5 ? "#a8e85a" : pct > 0.25 ? "#ffd23f" : "#ff4757";
    ctx.fillRect(27, 11, Math.round(hpw * pct), 6);
    for (let i = 1; i < 8; i++) {
      ctx.fillStyle = "rgba(10,7,24,0.5)";
      ctx.fillRect(27 + (hpw / 8) * i, 11, 1, 6);
    }

    // shield pips
    if (p.shield > 0) {
      for (let i = 0; i < p.shield; i++) {
        ctx.fillStyle = "#4dd6ff";
        ctx.fillRect(26 + i * 6, 19, 4, 2);
      }
    }

    // weapon
    if (p.weapon) {
      const spr = p.weapon.kind === "water" ? PISTOLA : INSECTICIDA;
      drawSprite(ctx, spr, 90, 4, 1, false);
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.fillStyle = "#ffe9b0";
      ctx.fillText(`x${p.weapon.ammo}`, 102, 15);
    }

    // score
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.textAlign = "right";
    ctx.fillStyle = "#8b8fa0";
    ctx.fillText(`HI ${String(this.hi).padStart(6, "0")}`, VIEW_W - 4, 8);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`${String(this.score).padStart(6, "0")}`, VIEW_W - 4, 18);
    ctx.textAlign = "left";

    // lives + stage
    ctx.textAlign = "center";
    ctx.fillStyle = this.stage.accent;
    ctx.fillText(this.stage.sub, VIEW_W / 2 + 22, 8);
    for (let i = 0; i < Math.min(5, this.lives); i++) {
      const hx = VIEW_W / 2 + 6 + i * 9;
      ctx.fillStyle = "#ff4757";
      ctx.fillRect(hx, 11, 3, 2);
      ctx.fillRect(hx + 4, 11, 3, 2);
      ctx.fillRect(hx, 13, 7, 2);
      ctx.fillRect(hx + 1, 15, 5, 1);
      ctx.fillRect(hx + 2, 16, 3, 1);
    }
    ctx.textAlign = "left";
  }
}
