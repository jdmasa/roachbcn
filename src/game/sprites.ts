// ------------------------------------------------------------------
// 8-bit sprite atlas — every graphic is a grid of palette characters
// '.' = transparent. Rendered with drawSprite() at any integer scale.
// ------------------------------------------------------------------

export const PAL: Record<string, string> = {
  k: "#14101f",
  K: "#000000",
  W: "#f6f3e7",
  L: "#cfd0d8",
  D: "#8b8fa0",
  d: "#565a6e",
  R: "#e8434f",
  r: "#9c2737",
  O: "#ff8f3f",
  o: "#c96322",
  Y: "#ffd23f",
  y: "#c99b23",
  G: "#5ac13c",
  g: "#2f8b2a",
  E: "#a8e85a",
  e: "#6db33f",
  T: "#3fd0c9",
  t: "#1f8f94",
  B: "#4169e0",
  b: "#27408f",
  C: "#54d8ff",
  c: "#2b96c9",
  S: "#f7c49c",
  s: "#d29a6b",
  N: "#96682f",
  n: "#5f3d17",
  P: "#ff7bac",
  p: "#c74e83",
  V: "#a05bd8",
  v: "#6b35a0",
  H: "#d8542f",
  h: "#93331a",
  M: "#c4e86e",
  m: "#8fb84a",
  F: "#ffe9b0",
  f: "#e0b060",
  X: "#2a1f45",
  Z: "#1b1440",
};

export type Sprite = string[];

export function drawSprite(
  ctx: CanvasRenderingContext2D,
  spr: Sprite,
  x: number,
  y: number,
  scale = 1,
  flip = false,
): void {
  const s = scale;
  for (let i = 0; i < spr.length; i++) {
    const row = spr[i];
    const w = row.length;
    for (let j = 0; j < w; j++) {
      const ch = row[j];
      if (ch === ".") continue;
      const col = PAL[ch];
      if (!col) continue;
      ctx.fillStyle = col;
      const px = flip ? x + (w - 1 - j) * s : x + j * s;
      ctx.fillRect(px, y + i * s, s, s);
    }
  }
}

// ============================ HEROES ===============================

// INDÍBIL — 6 años · gorra roja · camiseta a rayas · escoba justiciera
export const INDIBIL_IDLE: Sprite = [
  "....kRRRRRk.....",
  "...kRRRRRRRk....",
  "...kRRRRRRRRk...",
  "...RRRRRRRRRRk..",
  "...kkkkkkkkkk...",
  "...kSSSSSSSSk...",
  "...kSSkSSkSSk...",
  "...kSSSSSSSSk...",
  "....kSSSSSSk....",
  "....kWWWWWWk....",
  "...kSWWWWWWWSk..",
  "...kSWWOOWWWSk.Y",
  "...kSWWOOWWWSk.Y",
  "....kWWWWWWk.Y..",
  "....kBBBBBBk.Y..",
  "....kBBBBBBk.Y..",
  ".....kSSSSk..Y..",
  ".....kSk.kSk.Y..",
  "....kSSk.kSSkNn.",
  "....krrk.krrknNn",
  "....kRRk.kRRknNn",
  "............nnn.",
];

export const INDIBIL_WALK: Sprite = [
  "....kRRRRRk.....",
  "...kRRRRRRRk....",
  "...kRRRRRRRRk...",
  "...RRRRRRRRRRk..",
  "...kkkkkkkkkk...",
  "...kSSSSSSSSk...",
  "...kSSkSSkSSk...",
  "...kSSSSSSSSk...",
  "....kSSSSSSk....",
  "....kWWWWWWk....",
  "...kSWWWWWWWSk..",
  "...kSWWOOWWWSk.Y",
  "...kSWWOOWWWSk.Y",
  "....kWWWWWWk.Y..",
  "....kBBBBBBk.Y..",
  "....kBBBBBBk.Y..",
  ".....kSSSSk..Y..",
  "....kSSk.kSSk.Y.",
  "...kSSk...kSkNn.",
  "...krrk...kSSknN",
  "...kRRk...krrknn",
  "....kk....kRRkn.",
];

export const INDIBIL_ATTACK: Sprite = [
  "....kRRRRRk.....",
  "...kRRRRRRRk....",
  "...kRRRRRRRRk...",
  "...RRRRRRRRRRk..",
  "...kkkkkkkkkk...",
  "...kSSSSSSSSk...",
  "...kSSkSSkSSk...",
  "...kSSSSSSSSk...",
  "....kSSSSSSk....",
  "....kWWWWWWk....",
  "...kSWWWWWWSYYn.",
  "...kSWWWWWWYYYYN",
  "....kWWWWWWSYYnN",
  "....kWWWWWWk.YnN",
  "....kBBBBBBk....",
  "....kBBBBBBk....",
  ".....kSSSSk.....",
  ".....kSk.kSk....",
  "....kSSk.kSSk...",
  "....krrk.krrk...",
  "....kRRk.kRRk...",
  "................",
];

// MÉRIDA — 10 años · coleta morada · tank top turquesa · patines turbo
export const MERIDA_IDLE: Sprite = [
  "....kVVVVVk.....",
  "...kVVVVVVVk....",
  "..kkVVVVVVVVk...",
  "...kVVVVVVVVk...",
  "...kVVSSSSSSk...",
  "...kSSkSSkSSk...",
  "...kSSSSSSSSk...",
  "....kSSSSSSk....",
  "....kTTTTTTk....",
  "...kSTTTTTTSk...",
  "...kSTTTTTTSkP..",
  "....kTTTTTTk....",
  "....kXXXXXXk....",
  "....kXXXXXXk....",
  ".....kSSSSk.....",
  ".....kSk.kSk....",
  "....kLLk.kLLk...",
  "....kSSk.kSSk...",
  "...kYYYk.kYYYk..",
  "...kYYYk.kYYYk..",
  "...kRkRk.kRkRk..",
  "..kkkkkk.kkkkk..",
];

export const MERIDA_WALK: Sprite = [
  "....kVVVVVk.....",
  "...kVVVVVVVk....",
  "..kkVVVVVVVVk...",
  "...kVVVVVVVVk...",
  "...kVVSSSSSSk...",
  "...kSSkSSkSSk...",
  "...kSSSSSSSSk...",
  "....kSSSSSSk....",
  "....kTTTTTTk....",
  "...kSTTTTTTSk...",
  "...kSTTTTTTSkP..",
  "....kTTTTTTk....",
  "....kXXXXXXk....",
  "....kXXXXXXk....",
  ".....kSSSSk.....",
  "...kSSk...kSSk..",
  "..kLLk.....kLLk.",
  "..kSSk.....kSSk.",
  ".kYYYk.....kYYYk",
  ".kYYYk.....kYYYk",
  ".kRkRk.....kRkRk",
  "kkkkkk.....kkkkk",
];

export const MERIDA_ATTACK: Sprite = [
  "....kVVVVVk.....",
  "...kVVVVVVVk....",
  "..kkVVVVVVVVk...",
  "...kVVVVVVVVk...",
  "...kVVSSSSSSk...",
  "...kSSkSSkSSk...",
  "...kSSSSSSSSk...",
  "....kSSSSSSk....",
  "....kTTTTTTk....",
  "...kSTTTTTTSk...",
  "...kSTTTTTTSkP..",
  "....kTTTTTTk....",
  "....kXXXXXXk....",
  "....kXXXXXXk....",
  ".....kSSSSk.....",
  "....kSSk.kSSk...",
  "....kLLk..kYYYk.",
  "....kSSk...kYYYC",
  "...kYYYk...kRkRC",
  "...kYYYk....kk..",
  "...kRkRk........",
  "..kkkkkk........",
];

// ============================ ENEMIES ==============================

// CUCARACHA — del tamaño de un niño, bípeda y malhumorada
export const CUCARACHA_A: Sprite = [
  "..k..........k..",
  "...k........k...",
  "....kNNNNNNk....",
  "...kNNNNNNNNk...",
  "...kNWkNNWkNNk..",
  "...kNNNNNNNNk...",
  "..kNNNNNNNNNNk..",
  "..kNNnNNNNnNNk..",
  ".kNNnFFFFFFnNNk.",
  ".kNNnFFFFFFnNNk.",
  ".kNNnFFFFFFnNNk.",
  "..kNNnFFFFnNNk..",
  "...kNNNNNNNNk...",
  "....kNNNNNNk....",
  "....kNk..kNk....",
  "...kNNk..kNNk...",
  "...kk.k..k.kk...",
  "..kk...kk...kk..",
];

export const CUCARACHA_B: Sprite = [
  "...k........k...",
  "..k..........k..",
  "....kNNNNNNk....",
  "...kNNNNNNNNk...",
  "...kNWkNNWkNNk..",
  "...kNNNNNNNNk...",
  "..kNNNNNNNNNNk..",
  "..kNNnNNNNnNNk..",
  ".kNNnFFFFFFnNNk.",
  ".kNNnFFFFFFnNNk.",
  ".kNNnFFFFFFnNNk.",
  "..kNNnFFFFnNNk..",
  "...kNNNNNNNNk...",
  "....kNNNNNNk....",
  "...kNk....kNk...",
  "...kNNk..kNNk...",
  "..kk..k..k..kk..",
  ".kk....kk....kk.",
];

// HORMIGA — pequeña, rápida, enjambre
export const HORMIGA_A: Sprite = [
  ".k.......k..",
  ".kk.kHHk.kk.",
  "...kHHHHk...",
  "...kHkHk....",
  "....kHHk....",
  "...kHHHHk...",
  "..kHHHHHHk..",
  ".kHkHHHHkHk.",
  ".kk.kHHk.kk.",
  "k...kHHk...k",
  ".k..kkkk..k.",
  "..k......k..",
];

export const HORMIGA_B: Sprite = [
  ".k.......k..",
  ".kk.kHHk.kk.",
  "...kHHHHk...",
  "...kHkHk....",
  "....kHHk....",
  "...kHHHHk...",
  "..kHHHHHHk..",
  ".kHkHHHHkHk.",
  ".kk.kHHk.kk.",
  "..k.kHHk.k..",
  ".k..kkkk..k.",
  ".k........k.",
];

// ESCARABAJO PELOTERO — tanque blindado
export const PELOTERO_A: Sprite = [
  "....kkkkkkk.....",
  "...kBBBBBBBk....",
  "..kBbBBBBBbBBk..",
  ".kBbBLLBBBBbBBk.",
  ".kBBbLLBBBbBBBk.",
  ".kBBBbBBBbBBBBk.",
  ".kBBBBBBBBBBBBk.",
  "..kkBBBBBBBBkk..",
  "...kBkBBBBkBk...",
  "..kBBkkBBkkBBk..",
  "..kk..kBBk..kk..",
  ".kk...k..k...kk.",
  ".k.k........k.k.",
  "kk..kk......kk..",
];

export const PELOTERO_B: Sprite = [
  "....kkkkkkk.....",
  "...kBBBBBBBk....",
  "..kBbBBBBBbBBk..",
  ".kBbBLLBBBBbBBk.",
  ".kBBbLLBBBbBBBk.",
  ".kBBBbBBBbBBBBk.",
  ".kBBBBBBBBBBBBk.",
  "..kkBBBBBBBBkk..",
  "...kBkBBBBkBk...",
  "..kBBkkBBkkBBk..",
  "..kk.kBBBBk.kk..",
  ".kk..kk..kk..kk.",
  "k.k..........k.k",
  "..kk........kk..",
];

// Bola de estiércol que lanza el pelotero
export const PELOTA: Sprite = [
  "..kNNNk.",
  ".kNnNNNk",
  "kNnNNnNNk".slice(0, 8),
  "kNNNNNNk",
  "kNNnNNNk",
  "kNnNNnNk",
  ".kNNNNk.",
  "..kkkk..",
];

// MANTIS — espadachina verde
export const MANTIS_A: Sprite = [
  "....kkkk......",
  "...kMMMMk.....",
  "...kMRMRk.....",
  "....kGGk......",
  ".kk.kGGk......",
  "kMMkkGGk......",
  ".kMkGGGGk.....",
  "..kkGGGGk.....",
  "....kGGGk.....",
  "....kGGGk.....",
  "....kGGGk.....",
  "...kGGGGGk....",
  "...kGGGGk.....",
  "..kGGk.kGk....",
  "..kGk...kGk...",
  ".kkk.....kkk..",
];

export const MANTIS_B: Sprite = [
  "....kkkk......",
  "...kMMMMk.....",
  "...kMRMRk.....",
  "....kGGk......",
  ".kk.kGGk.kk...",
  "kMMkkGGkkMMk..",
  ".kMkGGGGkMk...",
  "..kkGGGGkk....",
  "....kGGGk.....",
  "....kGGGk.....",
  "....kGGGk.....",
  "...kGGGGGk....",
  "...kGGGGk.....",
  "...kGk..kGk...",
  "..kGk....kGk..",
  ".kkk......kkk.",
];

// ============================ BOSSES ===============================

// CUCAREY — rey de las cucarachas (jefe Fase 1)
export const CUCAREY_A: Sprite = [
  "..........kYk...kYk...........",
  "..........kYk...kYk...........",
  "..........kYYYYYYYk...........",
  "..........kYyYYYyYk...........",
  ".........kkNNNNNNNkk..........",
  "...k....kNNNNNNNNNNNk....k....",
  "...kk..kNNNNNNNNNNNNNk..kk....",
  "....kNNNNNNNNNNNNNNNNNNk......",
  "....kNNkRRNNNNNNkRRNNNNk......",
  "....kNNkRRkNNNNkRRkNNNNk......",
  "...kNNNNNNNNkkNNNNNNNNNNk.....",
  "...kNNNNNNNkNNkNNNNNNNNNk.....",
  "..kNNnNNNNNNNNNNNNNNNnNNNk....",
  "..kNNnNFFFFFFFFFFFFFnNnNNNk...",
  ".kNNNnFFFFFFFFFFFFFFFnNNNNk...",
  ".kNNnFFFFFFFFFFFFFFFFFnNNNk...",
  ".kNNnFFFFFFFFFFFFFFFFFnNNNk...",
  ".kNNnFFFFFFFFFFFFFFFFFnNNNk...",
  "..kNNnNFFFFFFFFFFFFFnNNNNk....",
  "..kNNnNNNNFFFFFFFFNNNnNNNk....",
  "...kNNNNNNNNNNNNNNNNNNNNk.....",
  "....kNNNNNNNNNNNNNNNNNNk......",
  "....kNNNk..kNNNNk..kNNNk......",
  "...kNNNk...kNNNNk...kNNNk.....",
  "...kNNk....kNNNNk....kNNk.....",
  "..kkk.kk...kkkkkk...kk.kkk....",
];

export const CUCAREY_B: Sprite = [
  "..........kYk...kYk...........",
  "..........kYk...kYk...........",
  "..........kYYYYYYYk...........",
  "..........kYyYYYyYk...........",
  ".........kkNNNNNNNkk..........",
  "...k....kNNNNNNNNNNNk....k....",
  "...kk..kNNNNNNNNNNNNNk..kk....",
  "....kNNNNNNNNNNNNNNNNNNk......",
  "....kNNkRRNNNNNNkRRNNNNk......",
  "....kNNkRRkNNNNkRRkNNNNk......",
  "...kNNNNNNNNkkNNNNNNNNNNk.....",
  "...kNNNNNNNkNNkNNNNNNNNNk.....",
  "..kNNnNNNNNNNNNNNNNNNnNNNk....",
  "..kNNnNFFFFFFFFFFFFFnNnNNNk...",
  ".kNNNnFFFFFFFFFFFFFFFnNNNNk...",
  ".kNNnFFFFFFFFFFFFFFFFFnNNNk...",
  ".kNNnFFFFFFFFFFFFFFFFFnNNNk...",
  ".kNNnFFFFFFFFFFFFFFFFFnNNNk...",
  "..kNNnNFFFFFFFFFFFFFnNNNNk....",
  "..kNNnNNNNFFFFFFFFNNNnNNNk....",
  "...kNNNNNNNNNNNNNNNNNNNNk.....",
  "....kNNNNNNNNNNNNNNNNNNk......",
  "....kNNk...kNNNNk...kNNk......",
  "...kNNNk...kNNNNk...kNNNk.....",
  "..kNNk.....kNNNNk.....kNNk....",
  ".kk.kkk....kkkkkk....kkk.kk...",
];

// MANTIS-3000 — espadachina de élite (jefe Fase 2)
export const MANTIS_BOSS_A: Sprite = [
  "..........kkkkkk..........",
  ".........kMMMMMMk.........",
  ".........kMRRRRMk.........",
  ".........kMRkRkMk.........",
  "..........kGGGGk..........",
  "..........kgGGgk..........",
  "..kk......kgGGgk......kk..",
  ".kMMk.....kGGGGk.....kMMk.",
  ".kMMk....kGGGGGGk....kMMk.",
  "..kMk...kGGGGGGGGk...kMk..",
  "...kk...kGGGGGGGGk...kk...",
  "........kgGGGGGGgk........",
  "........kGGGGGGGGk........",
  "........kGGGGGGGGk........",
  "........kgGGGGGGgk........",
  ".......kGGGGGGGGGGk.......",
  ".......kGGGGGGGGGGk.......",
  ".......kgGGGGGGGGgk.......",
  "........kGGGGGGGGk........",
  "........kGGkkGGkkk........",
  ".......kGGk..kGGk.........",
  ".......kGk....kGk.........",
  "......kkk......kkk........",
  ".....kk..........kk.......",
];

export const MANTIS_BOSS_B: Sprite = [
  "..........kkkkkk..........",
  ".........kMMMMMMk.........",
  ".........kMRRRRMk.........",
  ".........kMRkRkMk.........",
  "..........kGGGGk..........",
  "..........kgGGgk..........",
  "..kk......kgGGgk......kk..",
  ".kMMkk....kGGGGk....kkMMk.",
  ".kMMMk...kGGGGGGk...kMMMk.",
  "..kMMk..kGGGGGGGGk..kMMk..",
  "...kk...kGGGGGGGGk...kk...",
  "........kgGGGGGGgk........",
  "........kGGGGGGGGk........",
  "........kGGGGGGGGk........",
  "........kgGGGGGGgk........",
  ".......kGGGGGGGGGGk.......",
  ".......kGGGGGGGGGGk.......",
  ".......kgGGGGGGGGgk.......",
  "........kGGGGGGGGk........",
  "........kGGkkGGkkk........",
  "........kGGk.kGGk.........",
  "........kGk...kGk.........",
  ".......kkk.....kkk........",
  "......kk........kk........",
];

// REINA HORMIGA — madre del enjambre (jefe final)
export const REINA_A: Sprite = [
  "............kYk.kYk...............",
  "............kYYYYYk...............",
  "............kYyYyYk...............",
  "...........kkHHHHHkk..............",
  "...kCk....kHHHHHHHHHk....kCk......",
  "..kCCk...kHHHHHHHHHHHk...kCCk.....",
  ".kCCCk..kHHkRRHHkRRHHk..kCCCk.....",
  ".kCCCk..kHHkRRHHkRRHHk..kCCCk.....",
  "..kCCk..kHHHHHHkkHHHHHk..kCCk.....",
  "...kCk..kHHHHHkHHkHHHHk...kCk.....",
  "........kHHHHHHHHHHHHHk...........",
  ".......kHHhHHHHHHHHhHHHk..........",
  "......kHHHHhHHHHHHhHHHHHk.........",
  "......kHHhHHHHHHHHHHhHHHk.........",
  "......kHHHHHHHHHHHHHHHHHk.........",
  "......kHHhHHHHHHHHHHhHHHk.........",
  "......kHHHHhHHHHHHhHHHHHk.........",
  ".......kHHHHhHHHHhHHHHHk..........",
  ".......kHHHHHHhhHHHHHHHk..........",
  "........kHHHHHHHHHHHHHk...........",
  "........kHHk..kHHk..kHHk..........",
  ".......kHHk...kHHk...kHHk.........",
  ".......kHk....kHHk....kHk.........",
  "......kkk..k..kkkk..k..kkk........",
];

export const REINA_B: Sprite = [
  "............kYk.kYk...............",
  "............kYYYYYk...............",
  "............kYyYyYk...............",
  "...........kkHHHHHkk..............",
  "...kCk....kHHHHHHHHHk....kCk......",
  "..kCCk...kHHHHHHHHHHHk...kCCk.....",
  ".kCCCk..kHHkRRHHkRRHHk..kCCCk.....",
  ".kCCCk..kHHkRRHHkRRHHk..kCCCk.....",
  "..kCCk..kHHHHHHkkHHHHHk..kCCk.....",
  "...kCk..kHHHHHkHHkHHHHk...kCk.....",
  "........kHHHHHHHHHHHHHk...........",
  ".......kHHhHHHHHHHHhHHHk..........",
  "......kHHHHhHHHHHHhHHHHHk.........",
  "......kHHhHHHHHHHHHHhHHHk.........",
  "......kHHHHHHHHHHHHHHHHHk.........",
  "......kHHhHHHHHHHHHHhHHHk.........",
  "......kHHHHhHHHHHHhHHHHHk.........",
  ".......kHHHHhHHHHhHHHHHk..........",
  ".......kHHHHHHhhHHHHHHHk..........",
  "........kHHHHHHHHHHHHHk...........",
  "........kHk...kHHk...kHk..........",
  ".......kHHk...kHHk...kHHk.........",
  ".......kHHk...kHHk...kHHk.........",
  "......kk.kk...kkkk...kk.kk........",
];

// ============================ ITEMS ================================

export const BOCADILLO: Sprite = [
  "..kkkkkk..",
  ".kYYYYYYk.",
  "kYYfFFfYYk",
  "kGGRRGGRRk",
  ".kFFFFFFk.",
  "kYYYYYYYYk",
  "kYfYYYYfYk",
  ".kkkkkkkk.",
];

export const ZUMO: Sprite = [
  "...kk.....",
  "..kLk.....",
  ".kkkkkkkk.",
  "kOOOOOOOk.",
  "kOOkkOOOk.",
  "kOOWWOOOk.",
  "kOOWWOOOk.",
  "kOOOOOOOk.",
  ".kkkkkkkk.",
];

export const INSECTICIDA: Sprite = [
  "...kkkk...",
  "..kDDk....",
  "..kkkkkkk.",
  ".kGGGGGGk.",
  "kGWWWWWWGk",
  "kGWkWWkWGk",
  "kGWWWWWWGk",
  "kGGGGGGGGk",
  ".kkkkkkkk.",
];

export const PISTOLA: Sprite = [
  "..........",
  "..kkkkkkk.",
  ".kCCCBBBBk",
  "kCCCBBBBBk",
  ".kBBkBBBBk",
  "..kBBkkkk.",
  "..kBBk....",
  "..kBBk....",
  "..kkkk....",
];

export const CASCO: Sprite = [
  "..kkkkkk..",
  ".kRRRRRRk.",
  "kRRWRRRRRk",
  "kRRRRRRRRk",
  "kkkkkkkkkk",
  ".kDk..kDk.",
  ".kk....kk.",
];

export const RODILLERAS: Sprite = [
  "..kkk.kkk.",
  ".kLLLkLLLk",
  "kLWWLkLWWL",
  "kLLLLkLLLk",
  ".kkkk.kkk.",
  ".kDk...kDk",
];

export const PAPELERA: Sprite = [
  "..kkkkkkkk..",
  ".kDDDDDDDDk.",
  "kkkkkkkkkkkk",
  ".kLLLLLLLLk.",
  ".kLdLLLLdLk.",
  ".kLLLLLLLLk.",
  ".kLdLLLLdLk.",
  ".kLLLLLLLLk.",
  ".kLdLLLLdLk.",
  ".kLLLLLLLLk.",
  ".kkkkkkkkkk.",
  ".kkkkkkkkkk.",
];

export const PAPELERA_ROTA: Sprite = [
  "............",
  "............",
  "............",
  "............",
  "............",
  "............",
  "...kk.......",
  "..kDk.kkkkkk",
  ".kLLLLLLLLk.",
  ".kLdLLkLdLk.",
  ".kLLLLkLLLk.",
  ".kkkkkkkkkk.",
];

// ========================= PROJECTILES =============================

export const GOTITA: Sprite = ["..CC..", ".kCCk.", "kCCCCk", ".kkkk."];

export const NUBE: Sprite = [
  "..EE....",
  ".EEEE.E.",
  "EEEEEEEE",
  ".EEEEE..",
  "..EEE...",
];

export const ACIDO: Sprite = [".kEEk.", "kEEEEk", "kEeEEk", "kEEEEk", ".kkkk."];
