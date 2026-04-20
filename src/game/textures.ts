import * as Phaser from "phaser";

// Genera todas las texturas del juego programáticamente para garantizar
// coherencia visual y evitar dependencias de spritesheets externos.
export function generateTextures(scene: Phaser.Scene) {
  const tex = scene.textures;

  // ---- HERO frames (24 x 32) ----
  const drawHero = (key: string, mode: "idle" | "run1" | "run2" | "jump" | "shoot") => {
    const g = scene.add.graphics({ x: 0, y: 0 });
    g.setVisible(false);
    const W = 24, H = 32;
    // body cyan
    const body = 0x22d3ee;
    const dark = 0x0e7490;
    const accent = 0xf97316;
    const eye = 0xfde047;

    // legs vary per frame
    if (mode === "run1") {
      g.fillStyle(dark).fillRect(4, 26, 6, 6).fillRect(14, 26, 6, 6);
    } else if (mode === "run2") {
      g.fillStyle(dark).fillRect(2, 26, 6, 6).fillRect(16, 26, 6, 6);
    } else if (mode === "jump") {
      g.fillStyle(dark).fillRect(5, 24, 5, 5).fillRect(14, 24, 5, 5);
    } else {
      g.fillStyle(dark).fillRect(5, 26, 6, 6).fillRect(13, 26, 6, 6);
    }
    // torso
    g.fillStyle(body).fillRect(3, 12, 18, 14);
    g.fillStyle(accent).fillRect(9, 16, 6, 6); // chest core
    // head
    g.fillStyle(body).fillRect(5, 2, 14, 10);
    g.fillStyle(eye).fillRect(8, 5, 2, 3).fillRect(14, 5, 2, 3);
    // arm + gun (always pointing right side of sprite; flipX handles left)
    if (mode === "shoot") {
      g.fillStyle(body).fillRect(20, 14, 4, 3);
      g.fillStyle(0x111827).fillRect(22, 14, 6, 3);
      g.fillStyle(0xfde047).fillRect(28, 14, 2, 3);
    } else {
      g.fillStyle(body).fillRect(20, 14, 3, 6);
    }

    g.generateTexture(key, mode === "shoot" ? 30 : 24, H);
    g.destroy();
  };

  drawHero("hero_idle", "idle");
  drawHero("hero_run1", "run1");
  drawHero("hero_run2", "run2");
  drawHero("hero_jump", "jump");
  drawHero("hero_shoot", "shoot");

  // ---- Bullet (8x4) cyan plasma ----
  const gb = scene.add.graphics({ x: 0, y: 0 });
  gb.setVisible(false);
  gb.fillStyle(0xffffff).fillRect(0, 1, 8, 2);
  gb.fillStyle(0x22d3ee).fillRect(0, 0, 8, 4);
  gb.fillStyle(0xffffff).fillRect(2, 1, 4, 2);
  gb.generateTexture("bullet_tex", 8, 4);
  gb.destroy();

  // ---- Coin (12x12) ----
  const gc = scene.add.graphics({ x: 0, y: 0 });
  gc.setVisible(false);
  gc.fillStyle(0xfde047).fillCircle(6, 6, 6);
  gc.fillStyle(0xf59e0b).fillCircle(6, 6, 4);
  gc.fillStyle(0xfff7ae).fillRect(5, 3, 2, 6);
  gc.generateTexture("coin_tex", 12, 12);
  gc.destroy();

  // ---- Ground tile (32x32) ----
  if (!tex.exists("ground_tex")) {
    const gg = scene.add.graphics({ x: 0, y: 0 });
    gg.setVisible(false);
    gg.fillStyle(0x7c3aed).fillRect(0, 0, 32, 32);
    gg.fillStyle(0x4c1d95).fillRect(0, 6, 32, 26);
    gg.fillStyle(0xa78bfa).fillRect(0, 0, 32, 4);
    gg.fillStyle(0x312e81).fillRect(2, 18, 3, 3).fillRect(20, 24, 4, 3).fillRect(12, 12, 2, 2);
    gg.generateTexture("ground_tex", 32, 32);
    gg.destroy();
  }

  // ---- Sky gradient (256x256) ----
  if (!tex.exists("sky_tex")) {
    const cv = tex.createCanvas("sky_tex", 256, 256);
    if (cv) {
      const ctx = cv.getContext();
      const grad = ctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, "#1e1b4b");
      grad.addColorStop(0.6, "#7e22ce");
      grad.addColorStop(1, "#f97316");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);
      // stars
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      for (let i = 0; i < 40; i++) {
        ctx.fillRect(Math.random() * 256, Math.random() * 140, 2, 2);
      }
      cv.refresh();
    }
  }

  // ---- Goal flag (16x32) ----
  const gf = scene.add.graphics({ x: 0, y: 0 });
  gf.setVisible(false);
  gf.fillStyle(0xe5e7eb).fillRect(2, 0, 2, 32);
  gf.fillStyle(0xf43f5e).fillRect(4, 2, 12, 10);
  gf.generateTexture("flag_tex", 16, 32);
  gf.destroy();
}
