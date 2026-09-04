import { useCallback, useEffect, useRef, useState } from "react";
import { Engine, VIEW_W, VIEW_H } from "../game/engine";
import type { CharId, InputState } from "../game/engine";
import { audio } from "../game/audio";

type Stats = { score: number; kills: number; time: number };

const freshInput = (): InputState => ({
  left: false,
  right: false,
  up: false,
  down: false,
  a: false,
  b: false,
});

function useHold(key: keyof InputState, input: React.MutableRefObject<InputState>) {
  return {
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      audio.unlock();
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      input.current[key] = true;
    },
    onPointerUp: () => (input.current[key] = false),
    onPointerCancel: () => (input.current[key] = false),
    onLostPointerCapture: () => (input.current[key] = false),
  };
}

export default function GameScreen({
  charId,
  onGameOver,
  onVictory,
  onQuit,
}: {
  charId: CharId;
  onGameOver: (score: number, hi: number) => void;
  onVictory: (stats: Stats) => void;
  onQuit: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<InputState>(freshInput());
  const engineRef = useRef<Engine | null>(null);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(audio.muted);
  const [runId, setRunId] = useState(0);

  const togglePause = useCallback(() => {
    if (engineRef.current?.over) return;
    const np = !pausedRef.current;
    pausedRef.current = np;
    engineRef.current?.setPaused(np);
    setPaused(np);
    audio.sfx.select();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const eng = new Engine(canvas, charId, inputRef.current, {
      onGameOver: (s, hi) => onGameOver(s, hi),
      onVictory: (st) => onVictory(st),
      onPauseKey: () => togglePause(),
    });
    engineRef.current = eng;
    eng.start();
    return () => {
      eng.destroy();
      engineRef.current = null;
      inputRef.current = freshInput();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId, charId]);

  const restart = () => {
    pausedRef.current = false;
    setPaused(false);
    setRunId((r) => r + 1);
    audio.sfx.confirm();
  };

  const toggleMute = () => {
    const m = !audio.muted;
    audio.setMuted(m);
    setMuted(m);
    if (!m) audio.sfx.select();
  };

  const up = useHold("up", inputRef);
  const down = useHold("down", inputRef);
  const left = useHold("left", inputRef);
  const right = useHold("right", inputRef);
  const btnA = useHold("a", inputRef);
  const btnB = useHold("b", inputRef);

  return (
    <div className="flex h-full w-full flex-col bg-night-900">
      {/* ============ SCREEN AREA (top half) ============ */}
      <div className="crt-vignette relative min-h-0 flex-1 bg-black">
        <div className="absolute inset-0 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="pixelated"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
        <div className="scanlines pointer-events-none absolute inset-0" />

        <button
          className="absolute right-2 top-2 z-20 border-2 border-black bg-night-800/80 p-2 text-amber-px"
          style={{ boxShadow: "2px 2px 0 #000" }}
          onClick={toggleMute}
          aria-label="silenciar"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" shapeRendering="crispEdges" fill="currentColor">
            <rect x="1" y="6" width="3" height="4" />
            <rect x="4" y="4" width="3" height="8" />
            <rect x="7" y="2" width="3" height="12" />
            {muted ? (
              <>
                <rect x="11" y="5" width="2" height="2" />
                <rect x="13" y="7" width="2" height="2" />
                <rect x="11" y="9" width="2" height="2" />
              </>
            ) : (
              <>
                <rect x="11" y="4" width="2" height="2" />
                <rect x="13" y="6" width="2" height="4" />
                <rect x="11" y="10" width="2" height="2" />
              </>
            )}
          </svg>
        </button>
        <button
          className="absolute left-2 top-2 z-20 border-2 border-black bg-night-800/80 px-2 py-2 font-px text-[8px] text-amber-px"
          style={{ boxShadow: "2px 2px 0 #000" }}
          onClick={togglePause}
          aria-label="pausa"
        >
          ❚❚
        </button>

        <p className="font-crt pointer-events-none absolute bottom-1 left-0 z-10 w-full text-center text-[14px] leading-none text-[#7a7390]">
          FLECHAS mover · Z disparo · X salto · ENTER pausa
        </p>

        {paused && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-night-900/90">
            <p className="font-px text-[26px] text-amber-px" style={{ textShadow: "3px 3px 0 #000" }}>
              PAUSA
            </p>
            <p className="font-crt text-[20px] text-[#8b83ad]">Los bichos esperan...</p>
            <button className="btn-retro mt-2 bg-bug-500 px-6 py-3 text-[11px] text-night-900" onClick={togglePause}>
              REANUDAR ▶
            </button>
            <button className="btn-retro bg-night-700 px-6 py-3 text-[10px] text-[#cfc8e8]" onClick={restart}>
              REINICIAR
            </button>
            <button className="btn-retro bg-blood-px px-6 py-3 text-[10px] text-white" onClick={onQuit}>
              SALIR AL MENÚ
            </button>
          </div>
        )}
      </div>

      {/* ============ CONSOLE (bottom half) ============ */}
      <div
        className="gb-shell relative shrink-0 select-none"
        style={{ height: "min(46dvh, 400px)" }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="gb-groove mx-4 mt-2" />

        {/* top strip */}
        <div className="flex items-center justify-between px-5 pt-1.5">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${paused ? "bg-[#7d7763]" : "led-on"}`} />
            <span className="font-crt text-[14px] font-bold tracking-wider text-[#5c5648]">BATERÍA</span>
          </div>
          <p className="font-px text-[9px] italic text-night-800" style={{ textShadow: "1px 1px 0 rgba(255,255,255,0.5)" }}>
            PLAGA·BOY<span className="text-blood-px">™</span>
          </p>
        </div>

        {/* controls field */}
        <div className="absolute inset-x-0 bottom-2 top-9">
          {/* D-PAD */}
          <div className="absolute left-4 top-1/2 h-[138px] w-[138px] -translate-y-[58%]">
            <div {...up} className="dpad-arm absolute left-[46px] top-0 flex h-[46px] w-[46px] items-start justify-center rounded-t-md pt-1">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="#565a6e"><path d="M6 0L12 8H0z" /></svg>
            </div>
            <div {...down} className="dpad-arm absolute bottom-0 left-[46px] flex h-[46px] w-[46px] items-end justify-center rounded-b-md pb-1">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="#565a6e"><path d="M6 8L0 0h12z" /></svg>
            </div>
            <div {...left} className="dpad-arm absolute left-0 top-[46px] flex h-[46px] w-[46px] items-center justify-start rounded-l-md pl-1">
              <svg width="8" height="12" viewBox="0 0 8 12" fill="#565a6e"><path d="M0 6l8-6v12z" /></svg>
            </div>
            <div {...right} className="dpad-arm absolute right-0 top-[46px] flex h-[46px] w-[46px] items-center justify-end rounded-r-md pr-1">
              <svg width="8" height="12" viewBox="0 0 8 12" fill="#565a6e"><path d="M8 6L0 0v12z" /></svg>
            </div>
            <div className="absolute left-[46px] top-[46px] h-[46px] w-[46px] bg-[#23232e] shadow-[inset_0_3px_0_rgba(255,255,255,0.08),inset_0_-4px_0_rgba(0,0,0,0.5)]">
              <div className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1b1b24] shadow-[inset_0_2px_3px_rgba(0,0,0,0.8)]" />
            </div>
          </div>

          {/* A / B */}
          <div className="absolute right-4 top-[30%] h-[130px] w-[150px] -rotate-[10deg]">
            <div className="absolute bottom-0 left-0 flex flex-col items-center gap-1">
              <button {...btnB} className="ab-btn flex h-[58px] w-[58px] items-center justify-center rounded-full">
                <span className="font-px text-[15px] text-[#ffd9e6]" style={{ textShadow: "1px 2px 0 rgba(0,0,0,0.5)" }}>B</span>
              </button>
              <span className="font-crt text-[15px] font-bold leading-none text-[#5c5648]">DISPARO</span>
            </div>
            <div className="absolute right-0 top-0 flex flex-col items-center gap-1">
              <button {...btnA} className="ab-btn flex h-[58px] w-[58px] items-center justify-center rounded-full">
                <span className="font-px text-[15px] text-[#ffd9e6]" style={{ textShadow: "1px 2px 0 rgba(0,0,0,0.5)" }}>A</span>
              </button>
              <span className="font-crt text-[15px] font-bold leading-none text-[#5c5648]">SALTO</span>
            </div>
          </div>

          {/* SELECT / START */}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-[70%] -rotate-[18deg] items-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <button
                className="pill-btn h-[11px] w-[40px] rounded-full"
                onPointerDown={(e) => {
                  e.preventDefault();
                  toggleMute();
                }}
                aria-label="sonido"
              />
              <span className="font-crt text-[13px] font-bold leading-none text-[#5c5648]">SONIDO</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <button
                className="pill-btn h-[11px] w-[40px] rounded-full"
                onPointerDown={(e) => {
                  e.preventDefault();
                  audio.unlock();
                  togglePause();
                }}
                aria-label="pausa"
              />
              <span className="font-crt text-[13px] font-bold leading-none text-[#5c5648]">PAUSA</span>
            </div>
          </div>

          {/* speaker */}
          <div className="absolute bottom-2 right-4 flex -rotate-[22deg] gap-[7px]" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className="speaker-bar h-[38px] w-[5px] rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
