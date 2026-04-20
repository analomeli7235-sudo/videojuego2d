import * as Phaser from "phaser";
import { generateTextures } from "./textures";
import { saveLevelResult } from "./storage";

type LevelConfig = {
  level: number;
  worldWidth: number;
  platforms: Array<{ x: number; y: number; tiles: number }>;
  coins: Array<{ x: number; y: number }>;
  goalX: number;
};

const LEVELS: Record<number, LevelConfig> = {
  1: {
    level: 1,
    worldWidth: 2400,
    platforms: [
      { x: 0, y: 540, tiles: 25 }, // suelo principal
      { x: 320, y: 440, tiles: 4 },
      { x: 560, y: 360, tiles: 3 },
      { x: 820, y: 440, tiles: 4 },
      { x: 1120, y: 380, tiles: 3 },
      { x: 1380, y: 470, tiles: 5 },
      { x: 1720, y: 400, tiles: 4 },
      { x: 2000, y: 480, tiles: 6 },
    ],
    coins: [
      { x: 360, y: 400 }, { x: 392, y: 400 }, { x: 424, y: 400 },
      { x: 600, y: 320 }, { x: 632, y: 320 },
      { x: 860, y: 400 }, { x: 892, y: 400 },
      { x: 1160, y: 340 },
      { x: 1420, y: 430 }, { x: 1452, y: 430 },
      { x: 1760, y: 360 }, { x: 1792, y: 360 },
      { x: 2050, y: 440 }, { x: 2082, y: 440 }, { x: 2114, y: 440 },
    ],
    goalX: 2280,
  },
  2: {
    level: 2,
    worldWidth: 3200,
    platforms: [
      { x: 0, y: 540, tiles: 12 },
      { x: 460, y: 460, tiles: 3 },
      { x: 660, y: 380, tiles: 3 },
      { x: 880, y: 300, tiles: 3 },
      { x: 1140, y: 380, tiles: 4 },
      { x: 1440, y: 460, tiles: 3 },
      { x: 1680, y: 380, tiles: 3 },
      { x: 1920, y: 300, tiles: 4 },
      { x: 2240, y: 380, tiles: 3 },
      { x: 2480, y: 460, tiles: 4 },
      { x: 2780, y: 540, tiles: 14 },
    ],
    coins: [
      { x: 500, y: 420 }, { x: 700, y: 340 }, { x: 920, y: 260 },
      { x: 1180, y: 340 }, { x: 1212, y: 340 }, { x: 1244, y: 340 },
      { x: 1480, y: 420 }, { x: 1720, y: 340 },
      { x: 1960, y: 260 }, { x: 1992, y: 260 }, { x: 2024, y: 260 },
      { x: 2280, y: 340 }, { x: 2520, y: 420 },
      { x: 2820, y: 500 }, { x: 2852, y: 500 }, { x: 2884, y: 500 },
      { x: 2916, y: 500 }, { x: 2948, y: 500 },
    ],
    goalX: 3120,
  },
};

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keySpace!: Phaser.Input.Keyboard.Key;
  private keyZ!: Phaser.Input.Keyboard.Key;
  private keyEsc!: Phaser.Input.Keyboard.Key;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private coins!: Phaser.Physics.Arcade.Group;
  private bullets!: Phaser.Physics.Arcade.Group;
  private goal!: Phaser.Physics.Arcade.Sprite;
  private facing: 1 | -1 = 1;
  private lastShot = 0;
  private coinCount = 0;
  private startTime = 0;
  private hudText!: Phaser.GameObjects.Text;
  private levelConfig!: LevelConfig;
  private finished = false;
  private isShootingTimer = 0;

  constructor() {
    super("GameScene");
  }

  init(data: { level: number }) {
    this.levelConfig = LEVELS[data.level] ?? LEVELS[1];
    this.coinCount = 0;
    this.facing = 1;
    this.lastShot = 0;
    this.finished = false;
    this.isShootingTimer = 0;
  }

  create() {
    generateTextures(this);
    const cfg = this.levelConfig;
    const H = 600;

    // Fondo con parallax
    this.add
      .tileSprite(0, 0, cfg.worldWidth, H, "sky_tex")
      .setOrigin(0, 0)
      .setScrollFactor(0.3)
      .setDisplaySize(this.scale.width, H);

    this.physics.world.setBounds(0, 0, cfg.worldWidth, H);
    this.cameras.main.setBounds(0, 0, cfg.worldWidth, H);

    // Plataformas
    this.platforms = this.physics.add.staticGroup();
    cfg.platforms.forEach((p) => {
      for (let i = 0; i < p.tiles; i++) {
        const tile = this.platforms.create(
          p.x + i * 32 + 16,
          p.y + 16,
          "ground_tex",
        ) as Phaser.Physics.Arcade.Sprite;
        tile.setOrigin(0.5, 0.5).refreshBody();
      }
    });

    // Jugador
    this.player = this.physics.add.sprite(60, 480, "hero_idle");
    this.player.setCollideWorldBounds(true);
    this.player.setSize(18, 28).setOffset(3, 4);
    (this.player.body as Phaser.Physics.Arcade.Body).setMaxVelocity(220, 700);

    this.physics.add.collider(this.player, this.platforms);

    // Monedas
    this.coins = this.physics.add.group({ allowGravity: false, immovable: true });
    cfg.coins.forEach((c) => {
      const coin = this.coins.create(c.x, c.y, "coin_tex") as Phaser.Physics.Arcade.Sprite;
      this.tweens.add({
        targets: coin,
        y: c.y - 6,
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
        delay: Math.random() * 500,
      });
    });
    this.physics.add.overlap(this.player, this.coins, (_p, coin) => {
      (coin as Phaser.Physics.Arcade.Sprite).destroy();
      this.coinCount++;
      this.cameras.main.flash(80, 253, 224, 71);
      this.updateHud();
    });

    // Balas
    this.bullets = this.physics.add.group({ allowGravity: false });
    this.physics.add.collider(this.bullets, this.platforms, (b) => b.destroy());

    // Meta
    this.goal = this.physics.add.staticSprite(cfg.goalX, 508, "flag_tex");
    this.goal.setScale(1.2).refreshBody();
    this.tweens.add({ targets: this.goal, alpha: 0.6, duration: 600, yoyo: true, repeat: -1 });
    this.physics.add.overlap(this.player, this.goal, () => this.completeLevel());

    // Cámara
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.4);

    // Inputs
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keySpace = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyZ = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.keyEsc = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // HUD (fijo a cámara)
    this.hudText = this.add
      .text(12, 10, "", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#fde047",
        stroke: "#1e1b4b",
        strokeThickness: 3,
      })
      .setScrollFactor(0)
      .setDepth(1000);
    this.startTime = this.time.now;
    this.updateHud();

    this.add
      .text(12, 30, "← → mover  •  ↑/Espacio saltar  •  Z disparar  •  Esc menú", {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#a5f3fc",
      })
      .setScrollFactor(0)
      .setDepth(1000);

    // Caída al vacío
    this.physics.world.on("worldbounds", () => {});
  }

  update(time: number, delta: number) {
    if (this.finished) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down || body.touching.down;
    const left = this.cursors.left?.isDown;
    const right = this.cursors.right?.isDown;

    if (left) {
      this.player.setVelocityX(-200);
      this.facing = -1;
      this.player.setFlipX(true);
    } else if (right) {
      this.player.setVelocityX(200);
      this.facing = 1;
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
    }

    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.cursors.up!) ||
      Phaser.Input.Keyboard.JustDown(this.keySpace);
    if (jumpPressed && onGround) {
      this.player.setVelocityY(-420);
    }

    // Disparo
    if (Phaser.Input.Keyboard.JustDown(this.keyZ) && time - this.lastShot > 220) {
      this.shoot();
      this.lastShot = time;
      this.isShootingTimer = 180;
    }
    this.isShootingTimer = Math.max(0, this.isShootingTimer - delta);

    // Animación por estado (selección de textura)
    let key = "hero_idle";
    if (this.isShootingTimer > 0) key = "hero_shoot";
    else if (!onGround) key = "hero_jump";
    else if (left || right) {
      key = Math.floor(time / 110) % 2 === 0 ? "hero_run1" : "hero_run2";
    }
    if (this.player.texture.key !== key) this.player.setTexture(key);

    // Caída fuera del mundo
    if (this.player.y > 620) {
      this.player.setPosition(60, 480);
      this.player.setVelocity(0, 0);
      this.cameras.main.shake(150, 0.01);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyEsc)) {
      this.scene.start("MenuScene");
    }
  }

  private shoot() {
    const offsetX = this.facing === 1 ? 16 : -16;
    const bullet = this.bullets.create(
      this.player.x + offsetX,
      this.player.y - 2,
      "bullet_tex",
    ) as Phaser.Physics.Arcade.Sprite;
    bullet.setVelocityX(520 * this.facing);
    bullet.setFlipX(this.facing === -1);
    (bullet.body as Phaser.Physics.Arcade.Body).allowGravity = false;
    this.time.delayedCall(1400, () => bullet.destroy());
  }

  private updateHud() {
    const elapsed = ((this.time.now - this.startTime) / 1000).toFixed(1);
    this.hudText.setText(
      `NIVEL ${this.levelConfig.level}   ★ ${this.coinCount}/${this.levelConfig.coins.length}   ⏱ ${elapsed}s`,
    );
  }

  private completeLevel() {
    if (this.finished) return;
    this.finished = true;
    const seconds = (this.time.now - this.startTime) / 1000;
    saveLevelResult(this.levelConfig.level, {
      coins: this.coinCount,
      timeSeconds: seconds,
      completed: true,
    });
    this.cameras.main.fade(600, 0, 0, 0);
    this.time.delayedCall(650, () => {
      this.scene.start("MenuScene", {
        justFinished: this.levelConfig.level,
        coins: this.coinCount,
        seconds,
      });
    });
  }
}
