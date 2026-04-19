import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GameCanvas } from "@/components/GameCanvas";
import { loadSave, resetSave, type SaveData } from "@/game/storage";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Robo Runner — Juego 2D" },
      {
        name: "description",
        content:
          "Robo Runner: un juego 2D de plataformas con disparos, gravedad, monedas y dos niveles. Construido con Phaser.",
      },
    ],
  }),
});

function Index() {
  const [playing, setPlaying] = useState(false);
  const [save, setSave] = useState<SaveData | null>(null);

  useEffect(() => {
    setSave(loadSave());
  }, [playing]);

  const handleExit = () => {
    if (typeof window === "undefined") return;
    // En Electron cierra la ventana; en web intenta cerrar la pestaña.
    window.close();
    // fallback visual si el navegador bloquea window.close
    setTimeout(() => {
      alert(
        "Para cerrar la aplicación, simplemente cierra esta pestaña.\n(En la versión de escritorio Electron sí se cierra la ventana.)",
      );
    }, 100);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <h1 className="text-5xl md:text-6xl font-black tracking-widest neon-text mb-2">
        ROBO RUNNER
      </h1>
      <p className="text-sm text-muted-foreground mb-8 max-w-xl text-center">
        Plataformas 2D con física, disparos y dos niveles. Tu progreso se guarda
        automáticamente.
      </p>

      {!playing ? (
        <section className="w-full max-w-xl rounded-2xl border border-primary/40 bg-background/50 backdrop-blur p-8 flex flex-col items-center gap-6"
          style={{ boxShadow: "var(--shadow-neon)" }}
        >
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold neon-text">Menú principal</h2>
            <p className="text-xs text-muted-foreground">
              Controles: ← → moverse · ↑ / Espacio saltar · Z disparar · Esc volver al menú
            </p>
          </div>

          {save && (
            <div className="grid grid-cols-2 gap-3 w-full text-sm">
              {[1, 2].map((lvl) => {
                const l = save.levels[lvl];
                return (
                  <div
                    key={lvl}
                    className="rounded-lg border border-primary/30 p-3 text-center"
                  >
                    <div className="font-bold text-primary">Nivel {lvl}</div>
                    <div className="text-xs mt-1">
                      {l.completed
                        ? `✓ ${l.bestCoins}★ · ${l.bestTime.toFixed(1)}s`
                        : "Sin completar"}
                    </div>
                  </div>
                );
              })}
              <div className="col-span-2 text-center text-secondary font-bold">
                ★ Total monedas: {save.totalCoins}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <button className="neon-btn" onClick={() => setPlaying(true)}>
              ▶ Jugar
            </button>
            <button
              className="neon-btn"
              style={{
                background: "transparent",
                color: "var(--accent-glow)",
                border: "2px solid var(--accent-glow)",
                boxShadow: "none",
              }}
              onClick={() => {
                resetSave();
                setSave(loadSave());
              }}
            >
              ↺ Reiniciar progreso
            </button>
            <button
              className="neon-btn"
              style={{
                background: "transparent",
                color: "#fda4af",
                border: "2px solid #fda4af",
                boxShadow: "none",
              }}
              onClick={handleExit}
            >
              ✕ Salir
            </button>
          </div>
        </section>
      ) : (
        <div className="flex flex-col items-center gap-4 w-full">
          <GameCanvas />
          <button
            className="neon-btn"
            style={{
              background: "transparent",
              color: "var(--accent-glow)",
              border: "2px solid var(--accent-glow)",
              boxShadow: "none",
            }}
            onClick={() => setPlaying(false)}
          >
            ← Volver al menú principal
          </button>
        </div>
      )}

      <footer className="mt-10 text-xs text-muted-foreground">
        Construido con Phaser 3 · Tarea de Diseño de Juegos
      </footer>
    </main>
  );
}
