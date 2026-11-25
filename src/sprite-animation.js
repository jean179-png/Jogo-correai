/**
 * Onda de Aprendizes — Sistema de animação por sprites
 * Etapa 2: infraestrutura para personagens em spritesheets.
 *
 * Cada spritesheet usa células uniformes. A imagem só é desenhada depois
 * de carregar; enquanto isso, o jogo pode manter o desenho procedural atual.
 */
export class SpriteAnimator {
  constructor({ src, frameWidth, frameHeight, animations, scale = 1 }) {
    this.src = src;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.animations = animations || {};
    this.scale = scale;
    this.image = new Image();
    this.loaded = false;
    this.failed = false;
    this.image.onload = () => { this.loaded = true; };
    this.image.onerror = () => { this.failed = true; };
    this.image.src = src;
    this.animation = 'run';
    this.frame = 0;
    this.elapsed = 0;
  }

  setAnimation(name, reset = false) {
    if (!this.animations[name]) return;
    if (this.animation !== name || reset) {
      this.animation = name;
      this.frame = 0;
      this.elapsed = 0;
    }
  }

  update(delta = 1) {
    const animation = this.animations[this.animation];
    if (!animation || animation.frames.length < 2) return;
    this.elapsed += delta;
    const duration = Math.max(1, animation.frameDuration || 7);
    while (this.elapsed >= duration) {
      this.elapsed -= duration;
      this.frame = (this.frame + 1) % animation.frames.length;
    }
  }

  draw(ctx, x, y, options = {}) {
    if (!this.loaded || this.failed) return false;
    const animation = this.animations[this.animation];
    if (!animation) return false;
    const frameOffset = Math.abs(Math.floor(options.frameOffset || 0));
    const frameIndex = (this.frame + frameOffset) % animation.frames.length;
    const index = animation.frames[frameIndex] ?? animation.frames[0];
    const columns = Math.max(1, animation.columns || 1);
    const sx = (index % columns) * this.frameWidth;
    const sy = Math.floor(index / columns) * this.frameHeight;
    const scale = options.scale ?? this.scale;
    const width = this.frameWidth * scale;
    const height = this.frameHeight * scale;
    ctx.save();
    if (options.flipX) {
      ctx.translate(x + width, y);
      ctx.scale(-1, 1);
      ctx.drawImage(this.image, sx, sy, this.frameWidth, this.frameHeight, 0, 0, width, height);
    } else {
      ctx.drawImage(this.image, sx, sy, this.frameWidth, this.frameHeight, x, y, width, height);
    }
    ctx.restore();
    return true;
  }
}

/**
 * Dez personagens em PNG, cada um com faixa horizontal de 20 quadros
 * (72x84 px por quadro, 1440x84 px no total).
 * Os quadros 0-5 cobrem corrida, 6-8 salto, 9-11 repouso,
 * 12-13 comemoração, 16-18 reação/impacto e 19 queda.
 */
const characterFrames = {
  run:   { frames: [1, 2, 3, 4, 5], columns: 20, frameDuration: 4 },
  jump:  { frames: [6, 7, 8], columns: 20, frameDuration: 6 },
  fall:  { frames: [19], columns: 20, frameDuration: 8 },
  hit:   { frames: [16, 17, 18], columns: 20, frameDuration: 5 },
  idle:  { frames: [0, 9, 10, 11], columns: 20, frameDuration: 10 },
  cheer: { frames: [12, 13], columns: 20, frameDuration: 8 }
};

export const CHARACTER_SPRITES = {};
for (const id of ['A01','A02','A03','A04','A05','A06','A07','A08','A09','A10']) {
  CHARACTER_SPRITES[id] = {
    src: './assets/personagens/aprendiz-' + id + '.png',
    frameWidth: 72,
    frameHeight: 84,
    scale: 1,
    animations: characterFrames
  };
}

export function createCharacterSprite(id = 'A01') {
  const config = CHARACTER_SPRITES[id];
  return config ? new SpriteAnimator(config) : null;
}
