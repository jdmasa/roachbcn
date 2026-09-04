import { useEffect, useMemo, useRef, useState } from "react";
import { drawSprite, CUCARACHA_A, CUCARACHA_B, INSECTICIDA, CASCO, PISTOLA } from "../game/sprites";
import type { Sprite } from "../game/sprites";
import { CHAR_DEFS } from "../game/engine";
import type { CharId } from "../game/engine";
import { audio } from "../game/audio";

// ------------------------------------------------------------------
export function SpriteCanvas({
  sprite,
  sprite2,
  scale = 4,
  flip = false,
  animMs = 200,
  className = "",
}: {
  sprite: Sprite;
  sprite2?: Sprite;
  scale?: number;
  flip?: boolean;
  animMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!sprite2) return;
    const id = window.setInterval(() => setFrame((f) => (f + 1) % 2), animMs);
    return () => clearInterval(id);
  }, [sprite2, animMs]);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const spr = frame % 2 === 1 && sprite2 ? sprite2 : sprite;
    const w = Math.max(...spr.map((r) => r.length));
    c.width = w * scale;
    c.height = spr.length * scale;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    drawSprite(ctx, spr, 0, 0, scale, flip);
  }, [frame, sprite, sprite2, scale, flip]);

  return <canvas ref={ref} className={`pixelated ${className}`} />;
}

// ------------------------------------------------------------------
function Skyline({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 130"
      preserveAspectRatio="xMidYMax slice"
      shapeRendering="crispEdges"
      className={className}
      aria-hidden
    >
      {/* far silhouettes */}
      <g fill="#1d1747">
        <rect x="0" y="66" width="34" height="64" />
        <rect x="38" y="48" width="26" height="82" />
        <rect x="70" y="74" width="40" height="56" />
        {/* Sagrada Família */}
        <rect x="120" y="40" width="10" height="90" />
        <rect x="134" y="24" width="12" height="106" />
        <rect x="150" y="14" width="14" height="116" />
        <rect x="168" y="24" width="12" height="106" />
        <rect x="184" y="40" width="10" height="90" />
        <rect x="123" y="34" width="4" height="6" />
        <rect x="138" y="18" width="4" height="6" />
        <rect x="155" y="8" width="4" height="6" />
        <rect x="172" y="18" width="4" height="6" />
        <rect x="187" y="34" width="4" height="6" />
        <rect x="200" y="58" width="30" height="72" />
        {/* Torre Glòries */}
        <rect x="240" y="70" width="24" height="60" />
        <rect x="242" y="52" width="20" height="18" />
        <rect x="245" y="38" width="14" height="14" />
        <rect x="248" y="28" width="8" height="10" />
        <rect x="251" y="22" width="2" height="6" />
        <rect x="272" y="64" width="36" height="66" />
        <rect x="314" y="46" width="20" height="84" />
        <rect x="338" y="70" width="22" height="60" />
      </g>
      {/* lit windows */}
      <g fill="#ffd23f">
        <rect x="44" y="56" width="4" height="5" />
        <rect x="52" y="68" width="4" height="5" />
        <rect x="80" y="82" width="4" height="5" />
        <rect x="94" y="92" width="4" height="5" />
        <rect x="206" y="66" width="4" height="5" />
        <rect x="216" y="80" width="4" height="5" />
        <rect x="278" y="72" width="4" height="5" />
        <rect x="292" y="86" width="4" height="5" />
        <rect x="320" y="54" width="4" height="5" />
        <rect x="12" y="76" width="4" height="5" />
      </g>
      <g fill="#4dd6ff">
        <rect x="246" y="60" width="3" height="4" />
        <rect x="254" y="74" width="3" height="4" />
        <rect x="250" y="44" width="3" height="4" />
        <rect x="344" y="80" width="3" height="4" />
      </g>
    </svg>
  );
}

// ------------------------------------------------------------------
export function TitleScreen({ onStart, hi }: { onStart: () => void; hi: number }) {
  return (
    <div
      className="relative h-full w-full overflow-hidden cursor-pointer select-none"
      style={{ background: "linear-gradient(180deg,#0b0818 0%,#141031 55%,#3b2b66 88%,#c75b3f 100%)" }}
      onClick={() => {
        audio.unlock();
        audio.sfx.confirm();
        onStart();
      }}
    >
      <div className="absolute inset-0 starfield opacity-90" />
      <Skyline className="absolute bottom-0 left-0 w-full h-[34%]" />
      <div className="absolute inset-x-0 bottom-0 h-[10%] bg-[#0b0818]" />

      {/* floating loot */}
      <div className="absolute left-[8%] top-[24%] float-slow opacity-90">
        <SpriteCanvas sprite={INSECTICIDA} scale={3} />
      </div>
      <div className="absolute right-[10%] top-[30%] float-slow opacity-90" style={{ animationDelay: "-1.4s" }}>
        <SpriteCanvas sprite={PISTOLA} scale={3} />
      </div>
      <div className="absolute left-[14%] top-[40%] float-slow opacity-80" style={{ animationDelay: "-0.7s" }}>
        <SpriteCanvas sprite={CASCO} scale={3} />
      </div>

      {/* scurrying roach */}
      <div className="absolute bottom-[3%] bug-run">
        <SpriteCanvas sprite={CUCARACHA_A} sprite2={CUCARACHA_B} scale={3} animMs={120} />
      </div>

      <div className="relative z-10 flex h-full flex-col items-center px-6 pt-[12%]">
        <p className="font-px text-[9px] tracking-widest text-aqua-px">UN BEAT 'EM UP DE BOLSILLO</p>
        <h1
          className="jitter font-px mt-4 -rotate-2 text-[52px] leading-none text-amber-px sm:text-[64px]"
          style={{ textShadow: "4px 4px 0 #9c2737, 8px 8px 0 #14101f" }}
        >
          ¡PLAGA!
        </h1>
        <div
          className="mt-5 border-4 border-black bg-amber-px px-4 py-2 font-px text-[11px] text-night-900"
          style={{ boxShadow: "4px 4px 0 #000" }}
        >
          PÁNICO EN BARCELONA
        </div>

        <p className="font-crt mt-6 max-w-[300px] text-center text-[22px] leading-tight text-[#cfc8e8]">
          Los insectos del Parc de la Ciutadella han mutado.
          Dos hermanos. Una escoba. Unos patines. <span className="text-bug-400">Cero miedo.</span>
        </p>

        <p className="blink font-px mt-8 text-[12px] text-white">TOCA PARA EMPEZAR</p>

        <div className="font-px mt-auto mb-3 flex flex-col items-center gap-2 pb-[8%] text-[9px]">
          <span className="text-amber-px">HI-SCORE {String(hi).padStart(6, "0")}</span>
          <span className="font-crt text-[17px] text-[#8b83ad]">
            2 HERMANOS · 3 FASES · 3 JEFES · © 1988 HERMANOS BIT
          </span>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
const STORY_LINES = [
  "BARCELONA, AÑO 20XX.",
  "UNA PLAGA DE INSECTOS MUTANTES SALE DE LAS ALCANTARILLAS.",
  "CUCARACHAS DEL TAMAÑO DE UN NIÑO CAMINAN SOBRE DOS PATAS.",
  "MANTIS ESPADACHINAS. ESCARABAJOS BLINDADOS. HORMIGAS EN EJÉRCITO.",
  "LOS ADULTOS HAN HUIDO. SOLO QUEDAN DOS VALIENTES:",
  "INDÍBIL, 6 AÑOS, Y SU ESCOBA JUSTICIERA.",
  "MÉRIDA, 10 AÑOS, Y SUS PATINES TURBO.",
  "LIMPIA LA CIUDAD. FASE A FASE. BICHO A BICHO.",
];

export function StoryScreen({ onDone }: { onDone: () => void }) {
  const [line, setLine] = useState(0);
  const [chars, setChars] = useState(0);
  const done = line >= STORY_LINES.length;

  useEffect(() => {
    if (done) return;
    const full = STORY_LINES[line].length;
    if (chars >= full) return;
    const id = window.setTimeout(() => setChars((c) => c + 1), 22);
    return () => clearTimeout(id);
  }, [chars, line, done]);

  const tap = () => {
    audio.sfx.select();
    if (done) return onDone();
    if (chars < STORY_LINES[line].length) setChars(STORY_LINES[line].length);
    else {
      setLine((l) => l + 1);
      setChars(0);
    }
  };

  return (
    <div
      className="relative flex h-full w-full cursor-pointer flex-col bg-night-900 px-6 py-8 select-none"
      onClick={tap}
    >
      <p className="font-px text-[9px] text-blood-px">◉ TRANSMISIÓN DE EMERGENCIA</p>
      <div className="font-crt mt-6 flex-1 space-y-3 text-[24px] leading-snug text-[#e8e4f0]">
        {STORY_LINES.slice(0, line).map((l, i) => (
          <p key={i} className={i >= 5 ? "text-bug-400" : undefined}>
            {l}
          </p>
        ))}
        {!done && (
          <p className={line >= 5 ? "text-bug-400" : undefined}>
            {STORY_LINES[line].slice(0, chars)}
            <span className="blink text-amber-px">▌</span>
          </p>
        )}
      </div>
      <p className="blink font-px self-center text-[10px] text-[#8b83ad]">
        {done ? "TOCA PARA ELEGIR HÉROE" : "TOCA PARA SEGUIR"}
      </p>
    </div>
  );
}

// ------------------------------------------------------------------
function StatRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="font-crt text-[17px] leading-none text-[#cfc8e8]">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className="stat-pip h-3 w-3"
            style={{ background: i <= value ? color : "#241d3f" }}
          />
        ))}
      </div>
    </div>
  );
}

export function SelectScreen({
  onPick,
  onBack,
}: {
  onPick: (id: CharId) => void;
  onBack: () => void;
}) {
  const [sel, setSel] = useState<CharId>("indibil");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setSel("indibil");
      if (e.key === "ArrowRight") setSel("merida");
      if (e.key === "Enter") onPick(sel);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel, onPick]);

  const Card = ({ id }: { id: CharId }) => {
    const c = CHAR_DEFS[id];
    const active = sel === id;
    return (
      <button
        className={`pixel-panel relative flex flex-col items-center px-3 pb-4 pt-3 text-left transition-transform duration-100 ${
          active ? "-translate-y-1 bg-night-700" : "bg-night-800 opacity-80"
        }`}
        style={active ? { outline: `3px solid ${c.color}`, outlineOffset: 2 } : undefined}
        onClick={() => {
          audio.unlock();
          audio.sfx.select();
          setSel(id);
        }}
      >
        {active && (
          <span className="font-px absolute -left-1 top-1/2 -translate-y-1/2 text-[14px]" style={{ color: c.color }}>
            ▶
          </span>
        )}
        <div className="flex h-[92px] items-end">
          <SpriteCanvas sprite={c.idle} sprite2={c.walk} scale={4} animMs={220} />
        </div>
        <p className="font-px mt-2 text-[13px]" style={{ color: c.color }}>
          {c.name}
        </p>
        <p className="font-crt text-[17px] text-[#8b83ad]">{c.age} · {c.rol}</p>
        <div className="mt-2 w-full space-y-1.5">
          <StatRow label="FUERZA" value={c.stats.fuerza} color="#e8434f" />
          <StatRow label="VELOCIDAD" value={c.stats.velocidad} color="#4dd6ff" />
          <StatRow label="VIDA" value={c.stats.vida} color="#a8e85a" />
        </div>
        <p className="font-crt mt-2 text-center text-[16px] leading-tight text-[#cfc8e8]">
          <span className="text-amber-px">{c.weapon}</span>
          <br />
          {c.desc}
        </p>
      </button>
    );
  };

  return (
    <div className="flex h-full w-full flex-col bg-night-900 px-4 py-4 select-none" style={{ background: "linear-gradient(180deg,#0b0818,#1d1747)" }}>
      <p className="font-px text-center text-[10px] text-aqua-px">¿QUIÉN LIMPIA LA CIUDAD?</p>
      <h2
        className="font-px mt-2 text-center text-[22px] text-white"
        style={{ textShadow: "3px 3px 0 #14101f" }}
      >
        ELIGE HÉROE
      </h2>
      <div className="mt-4 grid flex-1 grid-cols-2 gap-3 overflow-hidden">
        <Card id="indibil" />
        <Card id="merida" />
      </div>
      <div className="mt-4 flex items-center justify-center gap-3 pb-1">
        <button className="btn-retro bg-night-700 px-3 py-3 text-[9px] text-[#cfc8e8]" onClick={() => { audio.sfx.select(); onBack(); }}>
          ◀ VOLVER
        </button>
        <button
          className="btn-retro bg-bug-500 px-6 py-3 text-[12px] text-night-900"
          onClick={() => {
            audio.sfx.confirm();
            onPick(sel);
          }}
        >
          ¡A LUCHAR! ▶
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
export function GameOverScreen({
  score,
  hi,
  onRetry,
  onMenu,
}: {
  score: number;
  hi: number;
  onRetry: () => void;
  onMenu: () => void;
}) {
  const record = score > 0 && score >= hi;
  return (
    <div className="relative flex h-full w-full flex-col items-center overflow-hidden bg-night-900 select-none" style={{ background: "radial-gradient(ellipse at 50% 30%, #3a1020, #0b0818 70%)" }}>
      <div className="absolute inset-0 starfield opacity-40" />
      <div className="relative z-10 mt-[16%] flex flex-col items-center">
        <h2 className="font-px text-[38px] text-blood-px" style={{ textShadow: "4px 4px 0 #14101f" }}>
          GAME
        </h2>
        <h2 className="font-px -mt-1 text-[38px] text-blood-px" style={{ textShadow: "4px 4px 0 #14101f" }}>
          OVER
        </h2>
        <div className="mt-6 flex gap-6">
          <SpriteCanvas sprite={CUCARACHA_A} sprite2={CUCARACHA_B} scale={4} animMs={160} />
          <SpriteCanvas sprite={CUCARACHA_A} sprite2={CUCARACHA_B} scale={3} flip animMs={200} />
          <SpriteCanvas sprite={CUCARACHA_A} sprite2={CUCARACHA_B} scale={4} animMs={140} />
        </div>
        <p className="font-crt mt-4 text-[24px] text-[#cfc8e8]">Las cucarachas celebran la victoria...</p>
        {record && <p className="blink font-px mt-3 text-[12px] text-amber-px">★ ¡NUEVO RÉCORD! ★</p>}
        <div className="font-px mt-4 space-y-2 text-center text-[11px]">
          <p className="text-white">PTS {String(score).padStart(6, "0")}</p>
          <p className="text-[#8b83ad]">HI {String(hi).padStart(6, "0")}</p>
        </div>
      </div>
      <div className="relative z-10 mt-auto flex gap-3 pb-[10%]">
        <button className="btn-retro bg-amber-px px-5 py-3 text-[11px] text-night-900" onClick={() => { audio.sfx.confirm(); onRetry(); }}>
          REINTENTAR
        </button>
        <button className="btn-retro bg-night-700 px-5 py-3 text-[11px] text-[#cfc8e8]" onClick={() => { audio.sfx.select(); onMenu(); }}>
          MENÚ
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
const CONFETTI_COLORS = ["#ffd23f", "#a8e85a", "#4dd6ff", "#ff7bac", "#e8434f", "#f6f3e7"];

export function VictoryScreen({
  stats,
  onRetry,
  onMenu,
}: {
  stats: { score: number; kills: number; time: number };
  onRetry: () => void;
  onMenu: () => void;
}) {
  const bits = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: (i * 37) % 100,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: -((i * 0.53) % 4),
        dur: 3.2 + ((i * 0.31) % 2.4),
        size: i % 3 === 0 ? 10 : 7,
      })),
    [],
  );
  const mm = String(Math.floor(stats.time / 60)).padStart(2, "0");
  const ss = String(stats.time % 60).padStart(2, "0");
  return (
    <div className="relative flex h-full w-full flex-col items-center overflow-hidden select-none" style={{ background: "linear-gradient(180deg,#141031,#2f8b2a 130%)" }}>
      {bits.map((b, i) => (
        <span
          key={i}
          className="confetti-bit"
          style={{
            left: `${b.left}%`,
            background: b.color,
            width: b.size,
            height: b.size,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.dur}s`,
          }}
        />
      ))}
      <div className="relative z-10 mt-[12%] flex flex-col items-center px-6">
        <p className="font-px text-[10px] text-aqua-px">LA REINA HA CAÍDO</p>
        <h2 className="font-px mt-3 text-center text-[26px] leading-tight text-amber-px" style={{ textShadow: "4px 4px 0 #14101f" }}>
          ¡BARCELONA
          <br />
          LIMPIA!
        </h2>
        <div className="mt-5 flex items-end gap-4">
          <SpriteCanvas sprite={CHAR_DEFS.indibil.idle} sprite2={CHAR_DEFS.indibil.walk} scale={4} animMs={240} />
          <SpriteCanvas sprite={CHAR_DEFS.merida.idle} sprite2={CHAR_DEFS.merida.walk} scale={4} animMs={200} />
        </div>
        <p className="font-crt mt-4 text-center text-[23px] leading-snug text-[#e8e4f0]">
          Indíbil y Mérida barren la última cucaracha.
          <br />
          La ciudad les debe <span className="text-amber-px">un bocadillo gigante</span>.
        </p>
        <div className="pixel-panel mt-5 w-full max-w-[280px] bg-night-800 px-4 py-3">
          {[
            ["PUNTUACIÓN", String(stats.score).padStart(6, "0")],
            ["BICHOS ZURRADOS", String(stats.kills)],
            ["TIEMPO", `${mm}:${ss}`],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-1">
              <span className="font-crt text-[19px] text-[#8b83ad]">{k}</span>
              <span className="font-px text-[11px] text-bug-400">{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="relative z-10 mt-auto flex gap-3 pb-[9%]">
        <button className="btn-retro bg-bug-500 px-5 py-3 text-[11px] text-night-900" onClick={() => { audio.sfx.confirm(); onRetry(); }}>
          OTRA VEZ
        </button>
        <button className="btn-retro bg-night-700 px-5 py-3 text-[11px] text-[#cfc8e8]" onClick={() => { audio.sfx.select(); onMenu(); }}>
          MENÚ
        </button>
      </div>
    </div>
  );
}
