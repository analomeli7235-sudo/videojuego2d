import { useEffect, useRef } from "react";
import type Phaser from "phaser";

export function GameCanvas() {
  const ref = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    let cancelled = false;
    let game: Phaser.Game | null = null;

    (async () => {
      const { createGame } = await import("@/game/createGame");
      if (cancelled || !ref.current) return;
      game = createGame(ref.current);
      gameRef.current = game;
    })();

    return () => {
      cancelled = true;
      if (game) game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div
      ref={ref}
      className="w-full max-w-[900px] aspect-[5/3] rounded-xl overflow-hidden border border-primary/40"
      style={{ boxShadow: "var(--shadow-neon)" }}
    />
  );
}
