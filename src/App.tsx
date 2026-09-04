import { useEffect, useState } from "react";
import GameScreen from "./components/GameScreen";
import { TitleScreen, StoryScreen, SelectScreen, GameOverScreen, VictoryScreen } from "./components/Screens";
import type { CharId } from "./game/engine";
import { audio } from "./game/audio";

type Screen = "title" | "story" | "select" | "game" | "over" | "win";
type Stats = { score: number; kills: number; time: number };

export default function App() {
  const [screen, setScreen] = useState<Screen>("title");
  const [charId, setCharId] = useState<CharId>("indibil");
  const [lastScore, setLastScore] = useState(0);
  const [hi, setHi] = useState(() => {
    try {
      return Number(localStorage.getItem("plaga-hiscore-v1") ?? "0") || 0;
    } catch {
      return 0;
    }
  });
  const [stats, setStats] = useState<Stats>({ score: 0, kills: 0, time: 0 });
  const [runKey, setRunKey] = useState(0);

  useEffect(() => {
    const unlock = () => audio.unlock();
    window.addEventListener("pointerdown", unlock);
    try {
      void document.fonts.load('8px "Press Start 2P"');
      void document.fonts.load('16px "VT323"');
    } catch {
      /* optional */
    }
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  const refreshHi = () => {
    try {
      setHi(Number(localStorage.getItem("plaga-hiscore-v1") ?? "0") || 0);
    } catch {
      /* sin almacenamiento */
    }
  };

  const startGame = (id?: CharId) => {
    if (id) setCharId(id);
    setRunKey((k) => k + 1);
    setScreen("game");
  };

  return (
    <div
      className="flex h-dvh w-full justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #1d1747 0%, #0b0818 62%), #0b0818",
      }}
    >
      {/* ambient desktop backdrop */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(155,224,74,0.05) 0 2px, transparent 2px 28px), repeating-linear-gradient(90deg, rgba(77,214,255,0.05) 0 2px, transparent 2px 28px)",
        }}
      />

      <div
        className="relative z-10 h-full w-full max-w-[540px] overflow-hidden border-x-4 border-black bg-night-900 shadow-[0_0_60px_rgba(155,224,74,0.12)]"
        onContextMenu={(e) => e.preventDefault()}
      >
        {screen === "title" && <TitleScreen hi={hi} onStart={() => setScreen("story")} />}
        {screen === "story" && <StoryScreen onDone={() => setScreen("select")} />}
        {screen === "select" && (
          <SelectScreen onBack={() => setScreen("title")} onPick={(id) => startGame(id)} />
        )}
        {screen === "game" && (
          <GameScreen
            key={`${charId}-${runKey}`}
            charId={charId}
            onQuit={() => {
              refreshHi();
              setScreen("title");
            }}
            onGameOver={(score, newHi) => {
              setLastScore(score);
              setHi(newHi);
              setScreen("over");
            }}
            onVictory={(st) => {
              setStats(st);
              refreshHi();
              setScreen("win");
            }}
          />
        )}
        {screen === "over" && (
          <GameOverScreen
            score={lastScore}
            hi={hi}
            onRetry={() => startGame()}
            onMenu={() => setScreen("title")}
          />
        )}
        {screen === "win" && (
          <VictoryScreen
            stats={stats}
            onRetry={() => startGame()}
            onMenu={() => setScreen("title")}
          />
        )}
      </div>
    </div>
  );
}
