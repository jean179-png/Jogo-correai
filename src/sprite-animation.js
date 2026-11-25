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
 * Seis personagens em spritesheets SVG com fundo transparente.
 */
export const CHARACTER_SPRITES = {
  A01: {
    src: './assets/personagens/spritesheet-A01.svg',
    frameWidth: 96,
    frameHeight: 96,
    scale: 1,
    animations: {
      run:   { frames: [0, 1, 2, 3, 4, 5], columns: 6, frameDuration: 5 },
      jump:  { frames: [6, 7, 8, 9], columns: 6, frameDuration: 7 },
      fall:  { frames: [10, 11], columns: 6, frameDuration: 7 },
      idle:  { frames: [12, 13], columns: 6, frameDuration: 12 },
      cheer: { frames: [14, 15], columns: 6, frameDuration: 9 }
    }
  }
};

for (const id of ['A02','A03','A04','A05','A06']) {
  CHARACTER_SPRITES[id] = { ...CHARACTER_SPRITES.A01, src: './assets/personagens/spritesheet-' + id + '.svg' };
}

export function createCharacterSprite(id = 'A01') {
  const config = CHARACTER_SPRITES[id];
  return config ? new SpriteAnimator(config) : null;
}
