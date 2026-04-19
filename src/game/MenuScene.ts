import Phaser from "phaser";
import { generateTextures } from "./textures";
import { loadSave } from "./storage";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  init() {
    // no-op (datos llegan via create data desde scene.start)
  }

  create(data: { justFinished?: number; coins?: number; seconds?: number }) {
    generateTextures(this);
    const { width, height } = this.scale;

    this.add
      .tileSprite(0, 0, width, height, "sky_tex")
      .setOrigin(0, 0)
      .setDisplaySize(width, height);

    this.add
      .text(width / 2, 70, "ROBO RUNNER", {
        fontFamily: "monospace",
        fontSize: "44px",
        color: "#22d3ee",
        stroke: "#1e1b4b",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 115, "Selecciona un nivel", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#fde047",
      })
      .setOrigin(0.5);

    const save = loadSave();

    const makeButton = (x: number, y: number, label: string, onClick: () => void) => {
      const bg = this.add
        .rectangle(x, y, 240, 64, 0x22d3ee, 0.15)
        .setStrokeStyle(2, 0x22d3ee)
        .setInteractive({ useHandCursor: true });
      const txt = this.add
        .text(x, y, label, {
          fontFamily: "monospace",
          fontSize: "16px",
          color: "#e0f2fe",
          align: "center",
        })
        .setOrigin(0.5);
      bg.on("pointerover", () => bg.setFillStyle(0x22d3ee, 0.3));
      bg.on("pointerout", () => bg.setFillStyle(0x22d3ee, 0.15));
      bg.on("pointerdown", onClick);
      return { bg, txt };
    };

    const l1 = save.levels[1];
    const l2 = save.levels[2];

    makeButton(
      width / 2,
      180,
      `NIVEL 1\n${l1.completed ? `✓ ${l1.bestCoins}★ · ${l1.bestTime.toFixed(1)}s` : "Sin completar"}`,
      () => this.scene.start("GameScene", { level: 1 }),
    );
    makeButton(
      width / 2,
      270,
      `NIVEL 2\n${l2.completed ? `✓ ${l2.bestCoins}★ · ${l2.bestTime.toFixed(1)}s` : "Sin completar"}`,
      () => this.scene.start("GameScene", { level: 2 }),
    );

    this.add
      .text(
        width / 2,
        360,
        `★ Total monedas guardadas: ${save.totalCoins}`,
        {
          fontFamily: "monospace",
          fontSize: "16px",
          color: "#fde047",
        },
      )
      .setOrigin(0.5);

    if (data?.justFinished) {
      this.add
        .text(
          width / 2,
          height - 50,
          `¡Nivel ${data.justFinished} completado!  ★ ${data.coins} · ${data.seconds?.toFixed(1)}s`,
          {
            fontFamily: "monospace",
            fontSize: "14px",
            color: "#86efac",
          },
        )
        .setOrigin(0.5);
    }
  }
}
