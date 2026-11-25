/* Onda de Aprendizes — pacote clássico compatível com navegadores móveis */
(()=>{
/**
 * Onda de Aprendizes — Sistema de animação por sprites
 * Etapa 2: infraestrutura para personagens em spritesheets.
 *
 * Cada spritesheet usa células uniformes. A imagem só é desenhada depois
 * de carregar; enquanto isso, o jogo pode manter o desenho procedural atual.
 */
class SpriteAnimator {
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
const CHARACTER_SPRITES = {
  A01: {
    src: './assets/personagens/spritesheet-A01.svg',
    frameWidth: 96,
    frameHeight: 96,
    scale: 1,
    animations: {
      run:   { frames: [0, 1, 2, 3, 4, 5], columns: 6, frameDuration: 5 },
      jump:  { frames: [6, 7, 8, 9], columns: 6, frameDuration: 7 },
      fall:  { frames: [10, 11], columns: 6, frameDuration: 7 },
      hit:   { frames: [10, 11], columns: 6, frameDuration: 4 },
      idle:  { frames: [12, 13], columns: 6, frameDuration: 12 },
      cheer: { frames: [14, 15], columns: 6, frameDuration: 9 }
    }
  }
};

for (const id of ['A02','A03','A04','A05','A06']) {
  CHARACTER_SPRITES[id] = { ...CHARACTER_SPRITES.A01, src: './assets/personagens/spritesheet-' + id + '.svg' };
}

function createCharacterSprite(id = 'A01') {
  const config = CHARACTER_SPRITES[id];
  return config ? new SpriteAnimator(config) : null;
}

window.createCharacterSprite = createCharacterSprite;
})();
(()=>{
const createCharacterSprite = window.createCharacterSprite;
class Game {
  constructor(canvas, callbacks = {}) {
    this.canvas = canvas;
    this.leaderSprite = createCharacterSprite('A01');
    this.characterSprites = Object.fromEntries(['A02','A03','A04','A05','A06'].map(id => [id, createCharacterSprite(id)]));
    this.ctx = canvas.getContext('2d');
    this.callbacks = callbacks;
    this.width = 1280; this.height = 720; this.ground = 555;
    this.running = false; this.paused = false;
    this.distance = 0; this.score = 0; this.crowd = 1;
    this.playerY = this.ground; this.velocityY = 0; this.isJumping = false;
    this.frame = 0; this.speed = 6; this.obstacles = []; this.recruits = []; this.coins = []; this.gates = []; this.routeForks = []; this.nextForkDistance = 300; this.powerups = []; this.effects = { shield: 0, magnet: 0, turbo: 0, multiplier: 0 }; this.powerTimer = 360; this.coinCombo = 0; this.coinComboTimer = 0; this.particles = []; this.spawnTimer = 65; this.recruitTimer = 110; this.coinTimer = 75; this.gateTimer = 430; this.combo = 0; this.milestones = new Set(); this.nextBossDistance = 650; this.bossCount = 0; this.difficultyLevel = 0;
    this.lastTime = 0; this.cameraShake = 0; this.cameraX = 0; this.landingPulse = 0; this.crowdReaction = 0; this.obstacleAwareness = 0; this.hitAnimationTimer = 0; this.cheerAnimationTimer = 0;
    this.loop = this.loop.bind(this);
    this.draw();
  }
  start(startEnvironment = 0) {
    this.distance = Math.max(0, Number(startEnvironment) || 0) * 220; this.score = 0; this.crowd = 1;
    this.playerY = this.ground; this.velocityY = 0; this.isJumping = false;
    this.frame = 0; this.speed = 6; this.obstacles = []; this.recruits = []; this.coins = []; this.gates = []; this.routeForks = []; this.nextForkDistance = this.distance + 300; this.powerups = []; this.effects = { shield: 0, magnet: 0, turbo: 0, multiplier: 0 }; this.powerTimer = 260; this.coinCombo = 0; this.coinComboTimer = 0; this.particles = []; this.spawnTimer = 65; this.recruitTimer = 95; this.coinTimer = 55; this.gateTimer = 430; this.combo = 0; this.milestones = new Set(); this.nextBossDistance = this.distance + 650; this.bossCount = 0; this.difficultyLevel = 0;
    this.running = true; this.paused = false; this.lastTime = 0; this.cameraShake = 0;
    this.lastEnvironmentIndex = this.environmentIndex(); this.environmentTransition = 0; this.environmentTransitionName = ''; this.cameraX = 0; this.landingPulse = 0; this.crowdReaction = 0; this.obstacleAwareness = 0; this.hitAnimationTimer = 0; this.cheerAnimationTimer = 0;
    requestAnimationFrame(this.loop);
  }
  jump() {
    if (!this.running || this.paused || this.isJumping) return;
    this.velocityY = -19; this.isJumping = true; this.callbacks.onSound?.("jump");
  }
  togglePause() {
    if (!this.running) return;
    this.paused = !this.paused;
    if (!this.paused) { this.lastTime = 0; requestAnimationFrame(this.loop); }
    else this.draw();
  }
  loop(time) {
    if (!this.running || this.paused) return;
    const dt = this.lastTime ? Math.min((time - this.lastTime) / 16.67, 2) : 1;
    this.lastTime = time;
    try {
      this.update(dt);
      this.draw();
      requestAnimationFrame(this.loop);
    } catch (error) {
      this.running = false;
      console.error('Erro durante a execução do jogo:', error);
      this.callbacks.onError?.(error);
    }
  }
  update(dt) {
    this.frame += dt;
    this.hitAnimationTimer = Math.max(0, this.hitAnimationTimer - dt);
    this.cheerAnimationTimer = Math.max(0, this.cheerAnimationTimer - dt);
    const spriteState = this.hitAnimationTimer > 0 ? 'hit' : this.cheerAnimationTimer > 0 ? 'cheer' : this.isJumping ? (this.velocityY < 0 ? 'jump' : 'fall') : 'run';
    this.leaderSprite?.update(dt);
    this.leaderSprite?.setAnimation(spriteState);
    for (const sprite of Object.values(this.characterSprites || {})) { sprite?.update(dt); sprite?.setAnimation(spriteState); }
    this.cameraShake = Math.max(0, this.cameraShake - 0.85 * dt);
    this.cameraX += ((this.speed - 6) * 0.7 - this.cameraX) * 0.035 * dt;
    this.landingPulse = Math.max(0, this.landingPulse - dt);
    this.crowdReaction = Math.max(0, this.crowdReaction - dt);
    // A horda percebe obstáculos próximos e ajusta a postura visualmente.
    const threat = this.obstacles.reduce((best, o) => {
      const d = o.x - 190;
      if (d < 0 || d > 390) return best;
      return Math.max(best, 1 - d / 390);
    }, 0);
    this.obstacleAwareness += (threat - this.obstacleAwareness) * 0.12 * dt;
    for (const key of Object.keys(this.effects)) this.effects[key] = Math.max(0, this.effects[key] - dt);
    const turboOn = this.effects.turbo > 0;
    const baseSpeed = Math.min(9, 6 + this.distance / 700);
    this.speed = Math.min(12, baseSpeed * (turboOn ? 1.55 : 1));
    this.distance += this.speed * .045 * dt;
    const activeEnvironment = this.environmentIndex();
    if (activeEnvironment !== this.lastEnvironmentIndex) {
      const names = ['PÁTIO DO SENAI', 'ADMINISTRAÇÃO', 'ELETRÔNICA', 'INFORMÁTICA', 'TI E REDES', 'HARDWARE', 'LABORATÓRIO'];
      this.lastEnvironmentIndex = activeEnvironment;
      this.environmentTransitionName = names[activeEnvironment];
      this.environmentTransition = 100;
      this.burst(640, 260, '#7de0ff', 22);
    }
    this.environmentTransition = Math.max(0, this.environmentTransition - dt);
    const nextDifficulty = Math.min(5, Math.floor(this.distance / 500));
    if (nextDifficulty !== this.difficultyLevel) {
      this.difficultyLevel = nextDifficulty;
      this.callbacks.onDifficulty?.(this.difficultyLevel, this.distance);
    }
    if (this.distance >= this.nextForkDistance) {
      this.routeForks.push({ x: 1320, chosen: false, pulse: 0 });
      this.nextForkDistance += 420 + Math.random() * 100;
    }
    if (this.frame % 2 < dt) this.score += Math.max(1, Math.round((this.effects.multiplier > 0 ? 2 : 1) * dt));
    if (--this.powerTimer <= 0) {
      const types = ['shield','magnet','turbo','multiplier'];
      const type = types[Math.floor(Math.random() * types.length)];
      this.powerups.push({ x: 1320, y: this.ground - (90 + Math.random()*65), type, spin: 0 });
      this.powerTimer = 420 + Math.random() * 300;
    }
    // Chefe de setor: surge periodicamente como desafio especial.
    if (this.distance >= this.nextBossDistance && !this.obstacles.some(o => o.type === 'boss')) {
      this.bossCount++;
      const bossDamage = Math.min(7, 5 + Math.floor((this.bossCount - 1) / 3));
      this.obstacles.push({ x: 1320, type: 'boss', damage: bossDamage, w: 150, passed: false, boss: this.bossCount });
      this.nextBossDistance += Math.max(500, 650 - this.difficultyLevel * 25);
      this.callbacks.onBoss?.(this.bossCount);
    }
    if (--this.spawnTimer <= 0) {
      // Rodízio de obstáculos: mistura cenários e evita repetir sempre cone/caixa.
      const common = ['pit','crate','barrier','cone','chair','gate','toolbox','tire','sign','cable','monitor','pallet','printer','books','wetfloor','usb','keyboard','headphones'];
      // Obstáculos especiais acompanham o tema/ambiente atual da fase.
      const themed = [
        ['car','server','drone','robotarm'], // Tecnologia
        ['cabinet','officebox','chair','books'], // Administração
        ['battery','circuit','coil','ups'], // Eletrônica
        ['hacker','computer','cable','printer'], // Informática
        ['router','antenna','hacker','ups'], // TI e Redes
        ['pc_case','motherboard','fan','robotarm'], // Hardware
        ['labcart','microscope','cabinet','wetfloor'] // Laboratório
      ][this.environmentIndex()];
      // Evita buracos em sequência: mantém distância segura entre saltos.
      const pitReady = this.distance - (this.lastPitDistance ?? -9999) > 520;
      const availableCommon = pitReady ? common : common.filter(t => t !== 'pit');
      const types = [...availableCommon, ...themed];
      const last = this.lastObstacleType;
      let pool = types.filter(t => t !== last);
      const type = pool[Math.floor(Math.random() * pool.length)];
      this.lastObstacleType = type;
      if (type === 'pit') this.lastPitDistance = this.distance;
      const widths = {pit:112,crate:58,barrier:88,cone:48,chair:62,gate:92,toolbox:68,tire:58,sign:54,cable:104,monitor:66,pallet:82,car:145,server:82,drone:66,cabinet:76,officebox:62,battery:60,circuit:78,coil:62,hacker:74,computer:82,router:66,antenna:72,pc_case:76,motherboard:82,fan:62,labcart:94,microscope:68,printer:72,books:66,wetfloor:58,robotarm:92,ups:74,usb:46,keyboard:82,headphones:66};
      const damage = type === 'pit' || type === 'gate' || type === 'barrier' || type === 'car' ? 2 : 1;
      this.obstacles.push({ x: 1320, type, damage, w: widths[type], passed: false });
      const spawnReduction = this.difficultyLevel * 6;
      this.spawnTimer = Math.max(72, 105 - spawnReduction) + Math.random() * Math.max(24, 70 - spawnReduction);
    }
    if (--this.recruitTimer <= 0) {
      // Pequenos grupos de aprendizes surgem juntos, no estilo de horda do runner.
      const batch = 2 + Math.floor(Math.random() * 3);
      for (let n=0;n<batch;n++) {
        this.recruits.push({ x: 1320 + n*34, y: this.ground - 2, baseY: this.ground - 2, phase: Math.random() * 6, joining: false, joinT: 0 });
      }
      this.recruitTimer = 150 + Math.random() * 105;
    }
    if (--this.gateTimer <= 0) { this.gates.push({x:1320, triggered:false}); this.gateTimer = 520 + Math.random()*150; }
    if (--this.coinTimer <= 0) {
      const baseY = this.ground - (Math.random() < .55 ? 105 : 48);
      for (let n=0;n<5;n++) this.coins.push({x:1320+n*42,y:baseY-Math.sin(n/4*Math.PI)*28,spin:Math.random()*6,got:false});
      this.coinTimer = 145 + Math.random()*90;
    }
    if (this.isJumping) {
      this.velocityY += .9 * dt; this.playerY += this.velocityY * dt;
      if (this.playerY >= this.ground) {
        this.playerY = this.ground; this.velocityY = 0; this.isJumping = false; this.landingPulse = 12; this.burst(190, this.ground-3, '#dce8ef', 12, 'dust');
      }
    }
    for (const r of this.recruits) r.x -= this.speed * dt;
    this.coinComboTimer = Math.max(0, this.coinComboTimer - dt);
    if (this.coinComboTimer === 0) this.coinCombo = 0;
    for (const coin of this.coins) {
      coin.x -= this.speed*dt; coin.spin += .18*dt;
      if (this.effects.magnet > 0 && coin.x < 620) {
        coin.y += (this.playerY - 105 - coin.y) * .075 * dt;
        coin.x += (195 - coin.x) * .035 * dt;
      }
      if (!coin.got && coin.x < 220 && coin.x > 145 && Math.abs(coin.y-(this.playerY-35)) < 115) {
        coin.got = true;
        this.coinCombo = Math.min(10, this.coinCombo + 1);
        this.coinComboTimer = 105;
        const bonus = 25 + Math.max(0, this.coinCombo - 1) * 5;
        const multiplier = this.effects.multiplier > 0 ? 2 : 1;
        this.score += bonus * multiplier;
        this.burst(coin.x,coin.y,'#ffd34d',9 + Math.min(12,this.coinCombo));
        if (this.coinCombo === 5 || this.coinCombo === 10) {
          this.score += 100 * multiplier;
          this.burst(190, this.playerY - 90, '#43e6bb', 24);
        }
        this.callbacks.onSound?.("coin");
      }
    }
    this.coins = this.coins.filter(coin => !coin.got && coin.x > -40);
    for (const p of this.particles) { p.x += p.vx*dt; p.y += p.vy*dt; p.vy += .22*dt; p.life -= dt; }
    this.particles = this.particles.filter(p => p.life > 0);
    for (let i = this.recruits.length - 1; i >= 0; i--) {
      const r = this.recruits[i];
      // O novo aprendiz faz uma curva de entrada antes de integrar a horda.
      if (r.x < 285) {
        r.joining = true;
        r.joinT = Math.min(1, (r.joinT || 0) + 0.055 * dt);
        const t = r.joinT;
        r.y = (r.baseY ?? this.ground) - Math.sin(t * Math.PI) * 48;
        r.x += (145 - r.x) * 0.10 * dt;
      }
      if (r.joining && r.joinT >= 0.92) {
        this.crowd += 1; this.score += 50;
        this.cheerAnimationTimer = 22;
        this.burst(155, this.ground - 22, '#42d392', 9);
        this.callbacks.onSound?.("recruit");
        this.checkMilestones();
        this.recruits.splice(i, 1);
      } else if (r.x < -80) this.recruits.splice(i, 1);
    }
    for (const p of this.powerups) { p.x -= this.speed * dt; p.spin += .12 * dt; }
    for (let i=this.powerups.length-1;i>=0;i--) {
      const p=this.powerups[i];
      if (p.x < 225 && p.x > 145 && Math.abs(p.y-(this.playerY-45)) < 105) {
        this.effects[p.type] = p.type === 'shield' ? 520 : 620;
        this.score += 100;
        const colors = {shield:'#55c8ff',magnet:'#ff5c9a',turbo:'#ff9b35',multiplier:'#b38cff'};
        this.burst(p.x,p.y,colors[p.type],24);
        this.callbacks.onSound?.('success');
        this.powerups.splice(i,1);
      } else if (p.x < -70) this.powerups.splice(i,1);
    }
    for (const g of this.gates) g.x -= this.speed * dt;
    for (let i=this.gates.length-1;i>=0;i--) { const g=this.gates[i]; if (!g.triggered && g.x < 215) { g.triggered=true; this.paused=true; this.callbacks.onQuestion?.(); } if (g.x < -180) this.gates.splice(i,1); }
    for (const f of this.routeForks) {
      f.x -= this.speed * dt;
      f.pulse += .12 * dt;
      if (!f.chosen && f.x < 215 && f.x > 145) {
        f.chosen = true;
        if (this.isJumping) {
          this.crowd += 4;
          this.score += 200;
          this.burst(190, this.playerY - 70, '#42d392', 30);
          this.callbacks.onRouteChoice?.('alta', this.crowd);
          this.checkMilestones();
        } else {
          this.score += 300;
          this.effects.shield = Math.max(this.effects.shield, 360);
          this.burst(190, this.ground - 45, '#ffd34d', 30);
          this.callbacks.onRouteChoice?.('segura', this.crowd);
        }
      }
    }
    this.routeForks = this.routeForks.filter(f => f.x > -240);
    for (const o of this.obstacles) o.x -= this.speed * dt;
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const o = this.obstacles[i];
      if (!o.passed && o.x < 210 && o.x + o.w > 150) {
        o.passed = true;
        if (!this.isJumping) {
          if (this.effects.shield > 0) {
            this.effects.shield = 0;
            this.burst(190,this.ground-45,'#55c8ff',28);
            this.callbacks.onSound?.('success');
          } else {
            this.hitAnimationTimer = 26; this.burst(190,this.ground-35,'#f47721',14); this.cameraShake = 13; this.crowdReaction = 28; this.callbacks.onSound?.('hit'); this.combo=0;
            this.crowd = Math.max(0, this.crowd - (o.damage || 1));
            this.callbacks.onHit?.(o.damage || 1, this.crowd);
          }
          if (!this.crowd) { this.running = false; this.callbacks.onGameOver?.(); return; }
        } else {
          this.score += o.type === 'boss' ? 250 : 20;
          this.burst(190,this.playerY-30,o.type === 'boss' ? '#ffd34d' : '#8be0bd',o.type === 'boss' ? 36 : 7);
          this.callbacks.onSound?.('success');
          if (o.type === 'boss') {
            this.crowd += 5;
            this.score += 250;
            this.cheerAnimationTimer = 60; this.callbacks.onBossDefeated?.(this.crowd);
            this.checkMilestones();
          }
        }
      }
      if (o.x < -200) this.obstacles.splice(i, 1);
    }
    if (!this.isJumping && Math.random() < .32*dt) this.burst(170+Math.random()*45,this.ground-4,'#dce8ef',2,'dust');
    this.callbacks.onHud?.({ distance: Math.floor(this.distance), crowd: this.crowd, score: this.score });
    this.checkMilestones();
  }

  checkMilestones() {
    for (const target of [10,20,50,100]) {
      if (this.crowd >= target && !this.milestones.has(target)) {
        this.milestones.add(target); this.score += target * 10; this.cheerAnimationTimer = 48;
        this.callbacks.onMilestone?.(target);
        this.burst(205,this.ground-105,'#ffd34d',26);
      }
    }
  }
  answerQuestion(correct) { this.paused=false; if(correct){ this.score+=150; this.crowd+=1; this.checkMilestones(); this.burst(205,this.ground-80,'#ffd34d',22); this.callbacks.onSound?.('success'); } else { this.crowd=Math.max(0,this.crowd-1); this.burst(205,this.ground-55,'#f47721',14); this.callbacks.onSound?.('hit'); } if(this.crowd<=0){this.running=false;this.callbacks.onGameOver?.();return;} this.lastTime=0; requestAnimationFrame(this.loop); }
  burst(x,y,color,count=8,type='spark') {
    for(let i=0;i<count;i++){ const a=Math.random()*Math.PI*2, v=type==='dust'?1+Math.random()*2:2+Math.random()*5; this.particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1,color,life:18+Math.random()*18,size:type==='dust'?3+Math.random()*5:3+Math.random()*4,type}); }
  }
  environmentIndex() {
    return Math.floor(this.distance / 220) % 7;
  }
  drawEnvironment(c) {
    const themes = [
      {name:'TECNOLOGIA', sky1:'#56b9ed',sky2:'#e2f7ff',far:'#547ba6',near:'#244c7c',accent:'#7de0ff',ground:'#4b9664'},
      {name:'ADMINISTRAÇÃO',sky1:'#82bce8',sky2:'#f4f5ff',far:'#8c9db2',near:'#455c78',accent:'#ffd27b',ground:'#57966b'},
      {name:'ELETRÔNICA',sky1:'#253b69',sky2:'#6e8db8',far:'#354e7c',near:'#172d52',accent:'#4ff0d2',ground:'#355e5b'},
      {name:'INFORMÁTICA',sky1:'#345f9c',sky2:'#b8d7f2',far:'#5576a5',near:'#203e70',accent:'#ff9b55',ground:'#4b8761'},
      {name:'TI E REDES',sky1:'#263b62',sky2:'#7ca6c9',far:'#3f6689',near:'#183653',accent:'#65e7e1',ground:'#477c65'},
      {name:'HARDWARE',sky1:'#d18b58',sky2:'#f8d7a3',far:'#9d7157',near:'#654a42',accent:'#ffcf62',ground:'#71805a'},
      {name:'LABORATÓRIO',sky1:'#75b9d9',sky2:'#e8f8ff',far:'#7e9eae',near:'#466477',accent:'#8be0bd',ground:'#4c906d'}
    ];
    const idx = this.environmentIndex(), t = themes[idx];
    // Fase 1: pátio externo do SENAI, com escola, árvores, grade e calçada.
    if (idx === 0) {
      const sky = c.createLinearGradient(0,0,0,500);
      sky.addColorStop(0,'#42a9ed'); sky.addColorStop(1,'#d9f2ff');
      c.fillStyle=sky; c.fillRect(0,0,this.width,this.height);
      // Nuvens em movimento suave.
      for(let i=0;i<5;i++){
        const x=((i*310-this.frame*.35)%(this.width+180)+this.width+180)%(this.width+180)-90;
        c.fillStyle='#ffffff'; c.globalAlpha=.88;
        c.beginPath(); c.arc(x,105+(i%2)*28,24,0,Math.PI*2);
        c.arc(x+27,96+(i%2)*28,31,0,Math.PI*2);
        c.arc(x+58,107+(i%2)*28,22,0,Math.PI*2); c.fill();
      }
      c.globalAlpha=1;
      // Blocos da escola ao fundo.
      c.fillStyle='#dce8f2'; c.fillRect(180,235,930,225);
      c.fillStyle='#174f9b'; c.fillRect(160,218,970,28);
      c.fillStyle='#f5f8fc'; c.fillRect(430,175,430,285);
      c.fillStyle='#174f9b'; c.fillRect(410,160,470,25);
      c.fillStyle='#0d3677'; c.fillRect(535,300,220,160);
      c.fillStyle='#8bd5ed'; c.fillRect(555,320,180,92);
      c.fillStyle='#10265b'; c.fillRect(620,410,50,50);
      c.fillStyle='#ffffff'; c.font='bold 38px Arial'; c.textAlign='center';
      c.fillText('SENAI',645,285); c.textAlign='left';
      // Janelas laterais.
      for(let row=0;row<2;row++) for(let col=0;col<9;col++){
        const x=205+col*98, y=275+row*76;
        c.fillStyle='#8bd5ed'; c.fillRect(x,y,58,42);
        c.strokeStyle='#174f9b'; c.lineWidth=5; c.strokeRect(x,y,58,42);
        c.fillStyle='#ffffff'; c.fillRect(x+27,y,4,42);
      }
      // Árvores com parallax.
      for(let i=0;i<6;i++){
        const x=((i*270-this.frame*.8)%(this.width+240)+this.width+240)%(this.width+240)-120;
        c.fillStyle='#765038'; c.fillRect(x+25,345,18,110);
        for(const [ox,oy,r] of [[0,0,40],[32,-18,38],[58,5,34],[-25,14,32]]){
          c.fillStyle='#278b48'; c.beginPath(); c.arc(x+ox+32,oy+375,r,0,Math.PI*2); c.fill();
          c.fillStyle='#49b95e'; c.beginPath(); c.arc(x+ox+23,oy+365,r*.55,0,Math.PI*2); c.fill();
        }
      }
      // Grade frontal do campus.
      c.fillStyle='#e9f2f8'; c.fillRect(0,440,this.width,9);
      c.fillRect(0,486,this.width,8);
      c.fillStyle='#f2f6fa';
      for(let x=0;x<this.width;x+=42) c.fillRect(x,435,7,60);
      c.fillStyle='#b8c8d8'; c.fillRect(0,495,this.width,18);
      // Calçada e pista: chão permanece na coordenada usada pela física.
      c.fillStyle='#c5cbd2'; c.fillRect(0,513,this.width,42);
      c.fillStyle='#8d9baa'; c.fillRect(0,513,this.width,5);
      c.fillStyle='#343e4b'; c.fillRect(0,555,this.width,165);
      c.fillStyle='#f4d35e'; c.fillRect(0,555,this.width,5);
      c.fillStyle='#f7f7f7';
      for(let i=0;i<9;i++){
        const x=((i*190-this.frame*this.speed*.85)%(this.width+190)+this.width+190)%(this.width+190)-90;
        c.fillRect(x,650,92,7);
      }
      c.fillStyle='#10265bcc'; c.fillRect(18,92,250,34);
      c.fillStyle='#ffffff'; c.font='bold 18px Arial'; c.fillText('FASE 1 · PÁTIO SENAI',30,115);
      return;
    }
    const sky = c.createLinearGradient(0,0,0,this.ground);
    sky.addColorStop(0,t.sky1); sky.addColorStop(1,t.sky2);
    c.fillStyle=sky; c.fillRect(0,0,this.width,this.height);

    // Nuvens / brilho distante
    c.globalAlpha=.5;
    for(let i=0;i<5;i++){
      const x=(i*310-this.frame*.45)%(this.width+220)-100;
      c.fillStyle='#fff'; c.beginPath(); c.ellipse(x,105+(i%2)*36,72,16,0,0,Math.PI*2); c.fill();
    }
    c.globalAlpha=1;

    // Silhuetas de fundo com movimento lento (parallax)
    for(let i=0;i<12;i++){
      const x=(i*132-this.frame*1.05)%(this.width+150)-70;
      const h=105+(i%4)*31;
      c.fillStyle=t.far; c.fillRect(x,390-h,94,h);
      c.fillStyle=t.accent; c.globalAlpha=.35;
      for(let y=410-h;y<370;y+=25) c.fillRect(x+13,y,12,10);
      c.globalAlpha=1;
    }

    // Elementos temáticos em primeiro plano distante
    if(idx===0 || idx===3 || idx===4 || idx===6){
      for(let i=0;i<7;i++){
        const x=(i*225-this.frame*1.8)%(this.width+220)-80;
        c.fillStyle=t.near;
        c.fillRect(x,300,72,90);
        c.fillStyle=t.accent;
        c.fillRect(x+10,315,52,5);
        c.fillRect(x+10,330,52,42);
        c.fillStyle='#10265b'; c.fillRect(x+17,338,38,26);
        if(idx===4){ c.strokeStyle=t.accent;c.lineWidth=3;c.beginPath();c.moveTo(x+36,290);c.lineTo(x+36,315);c.stroke(); }
      }
    } else if(idx===1){
      for(let i=0;i<5;i++){
        const x=(i*275-this.frame*1.5)%(this.width+250)-70;
        c.fillStyle=t.near; c.fillRect(x,275,155,115);
        c.fillStyle=t.accent; c.fillRect(x+12,290,130,8);
        c.fillStyle='#dceeff'; c.fillRect(x+18,310,42,58); c.fillRect(x+72,310,65,58);
      }
    } else if(idx===2){
      for(let i=0;i<8;i++){
        const x=(i*180-this.frame*1.7)%(this.width+180)-60;
        c.fillStyle=t.near; c.fillRect(x,315,18,75);
        c.fillStyle=t.accent; c.beginPath(); c.arc(x+9,306,7,0,Math.PI*2); c.fill();
        c.strokeStyle=t.accent;c.lineWidth=3;c.beginPath();c.moveTo(x+9,330);c.lineTo(x+65,360);c.stroke();
      }
    } else if(idx===5){
      for(let i=0;i<6;i++){
        const x=(i*230-this.frame*1.4)%(this.width+220)-70;
        c.fillStyle=t.near;c.fillRect(x,300,120,90);
        c.fillStyle=t.accent;c.fillRect(x+12,315,96,12);
        c.fillStyle='#25364a';c.fillRect(x+22,340,76,35);
      }
    }


    // Cenografia temática: estruturas grandes, legíveis e animadas em camadas.
    // A repetição com velocidades diferentes cria profundidade sem alterar a pista.
    const drift = (base, speed, span) => ((base - this.frame * speed) % span + span) % span - 120;
    const panel = (x,y,w,h,fill,stroke=t.accent) => {
      c.fillStyle=fill; c.fillRect(x,y,w,h);
      c.strokeStyle=stroke; c.lineWidth=3; c.strokeRect(x+1.5,y+1.5,w-3,h-3);
    };
    const label = (txt,x,y,size=13,color='#ffffff') => {
      c.fillStyle=color; c.font=`bold ${size}px Arial`; c.textAlign='center'; c.fillText(txt,x,y);
      c.textAlign='left';
    };
    // Silhuetas de teto, vigas e luminárias para dar leitura de ambiente interno.
    if ([0,2,3,4,5,6].includes(idx)) {
      c.globalAlpha=.24; c.fillStyle='#10265b'; c.fillRect(0,145,this.width,9);
      for(let k=0;k<6;k++){
        const x=drift(k*250, .7, this.width+250);
        c.fillRect(x,145,5,34);
        c.fillStyle='#ffffff'; c.fillRect(x+28,178,82,5);
        c.fillStyle='#10265b';
      }
      c.globalAlpha=1;
    }
    // Equipamentos exclusivos de cada área.
    for(let k=0;k<4;k++){
      const x=drift(k*360+40, 1.35, this.width+360);
      if(idx===0){ // Tecnologia: painéis digitais e braço robótico
        panel(x,220,150,112,'#173d68');
        c.fillStyle='#7de0ff'; c.fillRect(x+13,237,124,5);
        for(let n=0;n<5;n++){ c.fillStyle=['#7de0ff','#f47721','#20a66a'][n%3]; c.fillRect(x+15+n*23,260,13,46); }
        c.strokeStyle='#c9e9ff'; c.lineWidth=8; c.beginPath(); c.moveTo(x+165,325); c.lineTo(x+188,285); c.lineTo(x+210,301); c.stroke();
        c.fillStyle='#f47721'; c.beginPath(); c.arc(x+210,301,9,0,Math.PI*2); c.fill();
        label('TECNOLOGIA',x+75,215,12);
      } else if(idx===1){ // Administração: balcão, pastas e relógio
        panel(x,255,190,90,'#f1f5fa','#9db4cc');
        c.fillStyle='#d5e2ef'; c.fillRect(x+12,270,166,12);
        for(let n=0;n<4;n++){ c.fillStyle=['#f47721','#2674b8','#20a66a','#e2b64f'][n]; c.fillRect(x+18+n*39,292,27,38); }
        c.fillStyle='#fff'; c.beginPath(); c.arc(x+155,205,29,0,Math.PI*2); c.fill();
        c.strokeStyle='#455c78'; c.lineWidth=3; c.beginPath(); c.arc(x+155,205,29,0,Math.PI*2); c.moveTo(x+155,205); c.lineTo(x+155,185); c.moveTo(x+155,205); c.lineTo(x+171,213); c.stroke();
        label('GESTÃO',x+90,248,12,'#10265b');
      } else if(idx===2){ // Eletrônica: bancada, osciloscópio e circuitos
        panel(x,240,168,100,'#102a50');
        c.fillStyle='#142033'; c.fillRect(x+14,255,88,62);
        c.strokeStyle='#4ff0d2'; c.lineWidth=3; c.beginPath(); c.moveTo(x+20,286); c.lineTo(x+38,286); c.lineTo(x+49,267); c.lineTo(x+64,304); c.lineTo(x+78,277); c.lineTo(x+95,277); c.stroke();
        c.fillStyle='#f47721'; c.fillRect(x+117,260,35,52);
        for(let n=0;n<4;n++){ c.fillStyle='#4ff0d2'; c.fillRect(x+122+n*7,267,3,8); }
        label('ELETRÔNICA',x+82,234,12);
      } else if(idx===3){ // Informática: estações de trabalho
        for(let n=0;n<2;n++){
          const sx=x+n*92;
          panel(sx,235,76,57,'#162f56');
          c.fillStyle='#7dc8ef'; c.fillRect(sx+7,242,62,42);
          c.fillStyle='#cbd8e6'; c.fillRect(sx+34,292,8,22); c.fillRect(sx+20,314,36,5);
          c.fillStyle='#455c78'; c.fillRect(sx+8,320,60,8);
        }
        label('INFORMÁTICA',x+82,226,12);
      } else if(idx===4){ // Redes: racks e cabos
        panel(x,205,72,174,'#101f36','#65e7e1');
        panel(x+84,205,72,174,'#101f36','#65e7e1');
        for(let n=0;n<5;n++){
          c.fillStyle='#65e7e1'; c.fillRect(x+12,222+n*28,48,13); c.fillRect(x+96,222+n*28,48,13);
          for(let j=0;j<4;j++){ c.fillStyle=(Math.sin(this.frame*.12+n+j)>0)?'#20d890':'#f47721'; c.beginPath(); c.arc(x+19+j*11,228+n*28,2.5,0,Math.PI*2); c.fill(); }
        }
        c.strokeStyle='#f47721'; c.lineWidth=4; c.beginPath(); c.moveTo(x+72,290); c.bezierCurveTo(x+100,300,x+52,355,x+85,365); c.stroke();
        label('TI E REDES',x+78,197,12);
      } else if(idx===5){ // Hardware: bancada e componentes
        panel(x,265,190,76,'#654a42','#ffcf62');
        c.fillStyle='#303d4d'; c.fillRect(x+16,238,70,55);
        c.fillStyle='#c2ccd4'; c.beginPath(); c.arc(x+51,265,21,0,Math.PI*2); c.fill();
        c.fillStyle='#4a5969'; c.beginPath(); c.arc(x+51,265,12,0,Math.PI*2); c.fill();
        c.fillStyle='#d7b36b'; c.fillRect(x+111,246,54,42);
        for(let n=0;n<6;n++){ c.fillStyle='#26364b'; c.fillRect(x+116+n*8,251,4,32); }
        label('BANCADA DE HARDWARE',x+95,257,11);
      } else { // Laboratório: bancadas, microscópio e armários
        panel(x,260,190,82,'#e8f4f8','#8be0bd');
        c.fillStyle='#9cb8c7'; c.fillRect(x+14,275,162,9);
        c.strokeStyle='#294b62'; c.lineWidth=6; c.beginPath(); c.moveTo(x+52,274); c.lineTo(x+52,235); c.lineTo(x+78,235); c.lineTo(x+78,249); c.stroke();
        c.fillStyle='#8be0bd'; c.beginPath(); c.arc(x+78,252,8,0,Math.PI*2); c.fill();
        c.fillStyle='#ffffff'; c.fillRect(x+112,286,35,34); c.fillStyle='#77b7c9'; c.fillRect(x+119,278,21,9);
        label('LABORATÓRIO',x+95,252,12,'#294b62');
      }
    }
    // Camada frontal: bases, rodapés e luzes móveis para reforçar sensação de deslocamento.
    c.globalAlpha=.45;
    for(let k=0;k<10;k++){
      const x=drift(k*150, this.speed*.42, this.width+150);
      c.fillStyle=idx===2||idx===4?'#10265b':'#dceaf4';
      c.fillRect(x,382,74,7);
      c.fillStyle=t.accent; c.fillRect(x+8,386,18,3);
    }
    c.globalAlpha=1;

    c.fillStyle=t.ground; c.fillRect(0,390,this.width,35);
    // Pista em perspectiva simulada, mantendo jogabilidade 2D lateral
    c.fillStyle='#303d4d'; c.fillRect(0,425,this.width,295);
    // Faixas convergentes e marcadores em escala crescente simulam profundidade 2.5D.
    c.fillStyle='#263548'; c.beginPath(); c.moveTo(0,425); c.lineTo(1280,425); c.lineTo(1280,720); c.lineTo(0,720); c.closePath(); c.fill();
    c.strokeStyle='#91a6b9'; c.globalAlpha=.34; c.lineWidth=3;
    for(let lane=0;lane<5;lane++){ const top=170+lane*235, bottom=lane*360-120; c.beginPath(); c.moveTo(top,425); c.lineTo(bottom,720); c.stroke(); }
    c.globalAlpha=1;
    c.fillStyle='#f47721'; c.fillRect(0,425,this.width,8);
    c.strokeStyle='#f4e7ae'; c.lineWidth=5;
    for(let i=0;i<9;i++){
      const x=(i*205-this.frame*this.speed*.8)%(this.width+180)-70;
      c.beginPath();c.moveTo(x,640);c.lineTo(x+92,640);c.stroke();
    }
    // Nome do ambiente
    c.fillStyle='#10265bcc'; c.fillRect(18,92,210,34);
    c.fillStyle='#fff'; c.font='bold 18px Arial'; c.fillText(t.name,30,115);
  }


  person(x, y, scale, phase, leader = false, reaction = 0, avoidance = 0) {
    const c = this.ctx;
    const variant = Math.abs(Math.floor(phase * 17)) % 10;
    const spriteId = leader ? 'A01' : 'A0' + (2 + (variant % 5));
    const sprite = leader ? this.leaderSprite : this.characterSprites?.[spriteId];
    const gait = Math.floor((phase * 5) % 6);
    const bob = Math.sin(this.frame * 0.24 + phase) * (this.isJumping ? 1.5 : 2.5);
    if (sprite?.draw(c, x - 44 * scale, y - 88 * scale + bob * scale, { scale, frameOffset: gait })) return;
    c.save();
    c.translate(Math.round(x), Math.round(y));
    c.scale(scale, scale);

    // Personagens em pixel art: vista lateral, mochila, uniforme e silhueta legível.
    // Elenco procedural de reserva: diversidade de tons de pele, cabelos e acessórios.
    const skin = ['#f0bd91','#c9875d','#9b6045','#e5a77d','#754833','#f2c9a4','#b97855','#d99a70','#633d2d','#e8b58d'][variant];
    const hair = ['#202638','#35251f','#111827','#6b452e','#171717','#8b5b35','#252525','#493126','#b84f2f','#d5b36a'][variant];
    const shirt = '#f47721';
    const trim = leader ? '#10265b' : '#1676c5';
    const cycle = this.frame * 0.255 + phase;
    const run = !this.isJumping;
    const legSwing = run ? Math.round(Math.sin(cycle) * 10) : 0;
    const armSwing = run ? Math.round(Math.sin(cycle + Math.PI) * 7) : 0;
    const bobOffset = run ? Math.round(Math.abs(Math.sin(cycle)) * 2) : -5;
    const stagger = reaction > 0 ? Math.max(0, 1 - reaction / 28) : 0;
    const dodge = Math.max(0, Math.min(1, avoidance));

    c.globalAlpha = this.isJumping ? 0.2 : 0.28;
    c.fillStyle = '#07152b';
    c.fillRect(-17, -1, 35, 5);
    c.globalAlpha = 1;
    c.translate(Math.round(-dodge * 3 + stagger * Math.sin(phase * 2) * 3), bobOffset);

    // Pernas articuladas em blocos, com tênis contrastantes.
    const drawLeg = (x0, swing, front) => {
      c.save();
      c.translate(x0, -23);
      c.rotate((this.isJumping ? (front ? -0.55 : 0.45) : swing * 0.045));
      c.fillStyle = '#102044';
      c.fillRect(-4, 0, 9, 15);
      c.fillStyle = '#24436f';
      c.fillRect(-3, 3, 7, 8);
      c.fillStyle = '#17243a';
      c.fillRect(-4, 12, 9, 7);
      c.fillStyle = '#f47721';
      c.fillRect(front ? 1 : -7, 17, 15, 6);
      c.fillStyle = '#fff0d8';
      c.fillRect(front ? 5 : -5, 18, 7, 2);
      c.restore();
    };
    drawLeg(-6, legSwing, false);
    drawLeg(5, -legSwing, true);

    // Mochila SENAI nas costas.
    c.fillStyle = '#10265b';
    c.fillRect(-22, -54, 11, 25);
    c.fillStyle = leader ? '#f47721' : '#1676c5';
    c.fillRect(-21, -52, 8, 18);
    c.fillStyle = '#ffd45c';
    c.fillRect(-20, -48, 6, 3);
    c.fillStyle = '#0b1934';
    c.fillRect(-18, -29, 5, 5);

    // Tronco e uniforme escolar/técnico.
    c.fillStyle = '#102044';
    c.fillRect(-12, -54, 25, 31);
    c.fillStyle = shirt;
    c.fillRect(-11, -55, 22, 28);
    c.fillRect(-14, -51, 5, 19);
    c.fillRect(10, -51, 5, 18);
    c.fillStyle = leader ? '#ffd45c' : '#b8d9f4';
    c.fillRect(-3, -54, 7, 5);
    c.fillStyle = trim;
    c.fillRect(4, -44, 6, 7);
    c.fillStyle = '#fff';
    c.fillRect(6, -43, 2, 4);

    // Braços em movimento, com mãos visíveis.
    const drawArm = (side, swing) => {
      c.save();
      c.translate(side * 10, -48);
      c.rotate(this.isJumping ? (side > 0 ? -0.75 : 0.65) : swing * 0.055);
      c.fillStyle = '#102044';
      c.fillRect(-1, 0, 8, 5);
      c.fillStyle = shirt;
      c.fillRect(0, 1, 6, 4);
      c.fillStyle = skin;
      c.fillRect(2, 5, 6, 9);
      c.fillRect(4, 12, 7, 5);
      c.restore();
    };
    drawArm(-1, armSwing);
    drawArm(1, -armSwing);

    // Cabeça, cabelo em silhueta pixelada e rosto voltado para a direita.
    c.fillStyle = '#102044';
    c.fillRect(-10, -82, 23, 25);
    c.fillStyle = skin;
    c.fillRect(-8, -80, 19, 21);
    c.fillRect(8, -74, 6, 8);
    c.fillRect(3, -59, 7, 3);
    c.fillStyle = hair;
    c.fillRect(-10, -84, 21, 8);
    c.fillRect(-10, -79, 6, 8);
    c.fillRect(-5, -76, 5, 4);
    if (variant === 1 || variant === 4 || variant === 6) {
      c.fillRect(-9, -87, 17, 5);
      c.fillRect(7, -81, 5, 8);
    } else if (variant === 2 || variant === 5) {
      c.fillRect(-8, -88, 14, 5);
      c.fillRect(-11, -82, 5, 8);
    } else {
      c.fillRect(-7, -87, 10, 4);
      c.fillRect(4, -82, 7, 4);
    }
    // Silhuetas exclusivas para diferenciar os dez aprendizes.
    if (variant === 1 || variant === 6) { // cabelo cacheado
      for (const [hx,hy] of [[-9,-89],[-3,-92],[4,-91],[10,-87]]) {
        c.fillStyle=hair; c.fillRect(hx,hy,6,6);
      }
    } else if (variant === 3 || variant === 8) { // cabelo comprido / ruivo
      c.fillStyle=hair; c.fillRect(-11,-78,5,17); c.fillRect(8,-79,6,19);
    } else if (variant === 5 || variant === 9) { // rabo de cavalo / cabelo claro
      c.fillStyle=hair; c.fillRect(-14,-80,6,12); c.fillRect(-17,-73,5,10);
    }
    if (variant === 2 || variant === 7) { // óculos
      c.strokeStyle='#17243a'; c.lineWidth=2;
      c.strokeRect(4,-75,7,6); c.strokeRect(12,-75,5,6);
      c.beginPath(); c.moveTo(11,-72); c.lineTo(12,-72); c.stroke();
    }
    // Olho, sobrancelha e sorriso em poucos pixels.
    c.fillStyle = '#17243a';
    c.fillRect(7, -73, 3, 3);
    c.fillRect(6, -77, 5, 2);
    c.fillStyle = '#fff';
    c.fillRect(8, -73, 1, 1);
    c.fillStyle = '#9b5147';
    c.fillRect(10, -65, 4, 2);

    // Detalhe de identificação no uniforme.
    c.fillStyle = '#ffd45c';
    c.fillRect(-2, -39, 5, 4);
    c.fillStyle = '#10265b';
    c.fillRect(-1, -38, 3, 2);
    c.restore();
  }

  draw() {
    const c = this.ctx; c.clearRect(0,0,this.width,this.height);
    c.save();
    const shakeX = this.cameraShake ? (Math.random()-.5)*this.cameraShake : 0;
    const shakeY = this.cameraShake ? (Math.random()-.5)*this.cameraShake*.55 : 0;
    c.translate(shakeX-this.cameraX, shakeY);
    this.drawEnvironment(c);
    if (this.environmentTransition > 0) {
      const progress = this.environmentTransition / 100;
      const alpha = Math.max(0, Math.min(1, progress * 2.2, (1 - progress) * 3.2 + 0.15));
      c.save();
      c.globalAlpha = alpha;
      c.fillStyle = '#10265b'; c.fillRect(0, 150, this.width, 118);
      c.fillStyle = '#f47721'; c.fillRect(0, 150, this.width, 7);
      const sweep = ((100 - this.environmentTransition) * 24) % (this.width + 260) - 260;
      c.globalAlpha = alpha * 0.22; c.fillStyle = '#7de0ff';
      c.beginPath(); c.moveTo(sweep, 150); c.lineTo(sweep + 170, 150); c.lineTo(sweep + 80, 268); c.lineTo(sweep - 90, 268); c.closePath(); c.fill();
      c.globalAlpha = alpha; c.textAlign = 'center';
      c.fillStyle = '#ffd34d'; c.font = 'bold 17px Arial'; c.fillText('PRÓXIMO SETOR', 640, 190);
      c.fillStyle = '#ffffff'; c.font = 'bold 34px Arial'; c.fillText(this.environmentTransitionName, 640, 235);
      c.restore();
    }
    for(const o of this.obstacles){
      if(o.type==='boss'){
        c.save(); c.translate(o.x,this.ground-8);
        c.fillStyle='#263b62'; c.strokeStyle='#8bd5ed'; c.lineWidth=5;
        c.fillRect(12,-132,126,124); c.strokeRect(12,-132,126,124);
        c.fillStyle='#f47721'; c.fillRect(25,-119,100,18);
        c.fillStyle='#ffd34d'; c.beginPath(); c.arc(48,-88,12,0,Math.PI*2); c.arc(102,-88,12,0,Math.PI*2); c.fill();
        c.fillStyle='#10265b'; c.fillRect(43,-45,64,24);
        c.fillStyle='#8bd5ed'; c.fillRect(0,-8,34,8); c.fillRect(116,-8,34,8);
        c.fillStyle='#fff'; c.font='bold 16px Arial'; c.textAlign='center'; c.fillText('CHEFE',75,-145);
        c.restore();
      }
      else if(o.type==='pit'){
        // Buraco aberto no asfalto: bordas quebradas, profundidade e pedras.
        c.save();
        c.translate(o.x,this.ground);
        c.fillStyle='#202a39';
        c.beginPath();
        c.moveTo(0,0); c.lineTo(12,-7); c.lineTo(28,-4); c.lineTo(43,-11);
        c.lineTo(62,-6); c.lineTo(81,-10); c.lineTo(101,-4); c.lineTo(o.w,0);
        c.lineTo(o.w-8,20); c.lineTo(12,20); c.closePath(); c.fill();
        c.fillStyle='#090f1c';
        c.beginPath(); c.moveTo(10,2); c.lineTo(27,-3); c.lineTo(43,2);
        c.lineTo(61,-5); c.lineTo(82,1); c.lineTo(o.w-10,3);
        c.lineTo(o.w-19,15); c.lineTo(17,15); c.closePath(); c.fill();
        c.fillStyle='#526174';
        c.fillRect(7,-5,15,4); c.fillRect(45,-8,18,4); c.fillRect(o.w-28,-4,17,4);
        c.fillStyle='#111827';
        c.fillRect(26,8,18,5); c.fillRect(69,6,22,6);
        c.fillStyle='#9aa7b6';
        c.fillRect(4,-11,12,4); c.fillRect(o.w-19,-8,13,4);
        c.strokeStyle='#17243a'; c.lineWidth=3;
        c.beginPath(); c.moveTo(16,-3); c.lineTo(7,-15); c.lineTo(18,-20);
        c.moveTo(o.w-22,-2); c.lineTo(o.w-10,-15); c.lineTo(o.w-20,-21);
        c.stroke();
        c.fillStyle='#f47721'; c.fillRect(o.w/2-17,-29,34,4);
        c.fillStyle='#ffd34d'; c.fillRect(o.w/2-17,-29,8,4); c.fillRect(o.w/2+9,-29,8,4);
        c.restore();
      }
      else if(o.type==='barrier'){
        c.fillStyle='#d94c35';c.fillRect(o.x,this.ground-92,o.w,92);
        c.fillStyle='#ffd34d';for(let k=0;k<4;k++){c.save();c.translate(o.x+8+k*22,this.ground-82);c.rotate(-.55);c.fillRect(0,0,10,75);c.restore();}
        c.fillStyle='#fff';c.font='bold 15px Arial';c.fillText('ATENÇÃO',o.x-3,this.ground-100);
      }
      else if(o.type==='cone'){
        c.save();c.translate(o.x,this.ground);
        c.fillStyle='#263b62';c.fillRect(0,-7,48,7);
        c.fillStyle='#f47721';c.beginPath();c.moveTo(23,-61);c.lineTo(5,-7);c.lineTo(42,-7);c.closePath();c.fill();
        c.fillStyle='#fff';c.fillRect(13,-32,23,7);c.fillRect(8,-17,32,6);c.restore();
      }
      else if(o.type==='chair'){
        c.save();c.translate(o.x,this.ground);c.fillStyle='#263b62';
        c.fillRect(7,-61,48,7);c.fillRect(7,-61,7,34);c.fillRect(48,-61,7,34);
        c.fillStyle='#f47721';c.fillRect(7,-29,48,7);c.fillRect(11,-22,5,22);c.fillRect(46,-22,5,22);
        c.strokeStyle='#10265b';c.lineWidth=3;c.strokeRect(7,-61,48,39);c.restore();
      }
      else if(o.type==='gate'){
        c.save();c.translate(o.x,this.ground);
        c.fillStyle='#8797aa';c.fillRect(0,-104,13,104);c.fillRect(79,-104,13,104);
        c.fillStyle='#1676c5';c.fillRect(10,-96,72,82);
        c.strokeStyle='#10265b';c.lineWidth=4;c.strokeRect(10,-96,72,82);
        c.fillStyle='#f7fbff';for(let k=0;k<5;k++)c.fillRect(19+k*13,-91,5,72);
        c.fillStyle='#ffd34d';c.fillRect(10,-57,72,9);
        c.fillStyle='#10265b';c.fillRect(-4,-108,20,8);c.fillRect(76,-108,20,8);c.restore();
      }
      else if(o.type==='toolbox'){
        c.save();c.translate(o.x,this.ground);
        c.fillStyle='#d94c35';c.fillRect(4,-45,60,45);
        c.fillStyle='#f47721';c.fillRect(12,-54,44,10);
        c.fillStyle='#10265b';c.fillRect(27,-59,15,8);
        c.fillStyle='#ffd34d';c.fillRect(28,-32,13,10);
        c.strokeStyle='#10265b';c.lineWidth=3;c.strokeRect(4,-45,60,45);c.restore();
      }
      else if(o.type==='tire'){
        c.save();c.translate(o.x+29,this.ground-25);
        c.fillStyle='#17243a';c.beginPath();c.arc(0,0,26,0,Math.PI*2);c.fill();
        c.fillStyle='#8290a1';c.beginPath();c.arc(0,0,12,0,Math.PI*2);c.fill();
        c.fillStyle='#263b62';c.beginPath();c.arc(0,0,6,0,Math.PI*2);c.fill();
        c.strokeStyle='#0b1428';c.lineWidth=4;c.beginPath();c.arc(0,0,20,0,Math.PI*2);c.stroke();c.restore();
      }
      else if(o.type==='sign'){
        c.save();c.translate(o.x,this.ground);
        c.fillStyle='#8797aa';c.fillRect(24,-62,7,62);
        c.fillStyle='#ffd34d';c.fillRect(0,-91,54,34);
        c.fillStyle='#10265b';c.lineWidth=3;c.strokeStyle='#10265b';c.strokeRect(0,-91,54,34);
        c.font='bold 22px Arial';c.textAlign='center';c.fillText('!',27,-67);
        c.fillStyle='#f47721';c.fillRect(17,-7,22,7);c.restore();
      }
      else if(o.type==='cable'){
        c.save();c.translate(o.x,this.ground);
        c.strokeStyle='#17243a';c.lineWidth=9;c.beginPath();c.moveTo(0,-5);c.bezierCurveTo(20,-48,78,-48,104,-5);c.stroke();
        c.strokeStyle='#f47721';c.lineWidth=3;c.beginPath();c.moveTo(0,-5);c.bezierCurveTo(20,-48,78,-48,104,-5);c.stroke();
        c.fillStyle='#8797aa';c.fillRect(-3,-10,12,12);c.fillRect(96,-10,12,12);c.restore();
      }
      else if(o.type==='monitor'){
        c.save();c.translate(o.x,this.ground);
        c.fillStyle='#263b62';c.fillRect(2,-57,62,43);
        c.fillStyle='#56b9ed';c.fillRect(8,-51,50,31);
        c.fillStyle='#10265b';c.fillRect(27,-14,12,8);c.fillRect(18,-6,31,6);
        c.fillStyle='#f47721';c.fillRect(14,-42,12,4);c.strokeStyle='#10265b';c.lineWidth=3;c.strokeRect(2,-57,62,43);c.restore();
      }
      else if(o.type==='pallet'){
        c.save();c.translate(o.x,this.ground);
        c.fillStyle='#a96c35';c.fillRect(0,-38,82,38);
        c.fillStyle='#d49a5b';for(let k=0;k<4;k++)c.fillRect(3+k*20,-35,16,31);
        c.fillStyle='#6e4528';c.fillRect(0,-9,82,9);c.fillRect(9,-9,9,9);c.fillRect(64,-9,9,9);
        c.strokeStyle='#6e4528';c.lineWidth=3;c.strokeRect(0,-38,82,38);c.restore();
      }
      else if(o.type==='car'){
        c.save();c.translate(o.x,this.ground);
        c.fillStyle='#17243a';c.fillRect(8,-38,130,31);
        c.fillStyle='#f47721';c.fillRect(0,-34,145,27);
        c.fillStyle='#ffd34d';c.fillRect(22,-51,83,19);
        c.fillStyle='#9edfff';c.fillRect(29,-48,31,14);c.fillRect(66,-48,31,14);
        c.fillStyle='#17243a';c.beginPath();c.arc(34,-7,13,0,Math.PI*2);c.arc(113,-7,13,0,Math.PI*2);c.fill();
        c.fillStyle='#b8c8d8';c.beginPath();c.arc(34,-7,6,0,Math.PI*2);c.arc(113,-7,6,0,Math.PI*2);c.fill();c.restore();
      }
      else if(o.type==='hacker'){
        c.save();c.translate(o.x,this.ground);
        c.fillStyle='#101827';c.fillRect(9,-73,54,70);c.fillRect(3,-63,66,38);
        c.fillStyle='#263b62';c.fillRect(14,-69,44,31);
        c.fillStyle='#43e6bb';c.fillRect(20,-57,8,5);c.fillRect(42,-57,8,5);
        c.fillStyle='#f47721';c.fillRect(21,-43,31,6);
        c.fillStyle='#17243a';c.fillRect(12,-12,19,12);c.fillRect(43,-12,19,12);
        c.fillStyle='#43e6bb';c.font='bold 12px monospace';c.fillText('0101',12,-80);c.restore();
      }
      else if(o.type==='cabinet'){
        c.save();c.translate(o.x,this.ground);
        c.fillStyle='#8797aa';c.fillRect(0,-91,76,91);
        c.fillStyle='#cbd8e6';c.fillRect(6,-85,64,79);
        c.strokeStyle='#10265b';c.lineWidth=4;c.strokeRect(0,-91,76,91);
        c.fillStyle='#1676c5';c.fillRect(9,-81,58,3);c.fillRect(9,-43,58,3);
        c.fillStyle='#f47721';c.fillRect(56,-72,5,7);c.fillRect(56,-33,5,7);c.restore();
      }
      else if(o.type==='officebox'){
        c.save();c.translate(o.x,this.ground);c.fillStyle='#b8c8d8';c.fillRect(0,-48,62,48);c.fillStyle='#8797aa';c.fillRect(7,-42,48,34);c.fillStyle='#f47721';c.fillRect(12,-33,38,5);c.strokeStyle='#10265b';c.lineWidth=3;c.strokeRect(0,-48,62,48);c.restore();
      }
      else if(o.type==='server'||o.type==='router'||o.type==='computer'||o.type==='pc_case'){
        c.save();c.translate(o.x,this.ground);c.fillStyle='#263b62';c.fillRect(0,-82,o.w,82);c.fillStyle='#10265b';c.fillRect(6,-76,o.w-12,70);
        for(let y=-67;y<-17;y+=17){c.fillStyle='#8bb9df';c.fillRect(12,y,o.w-24,4);c.fillStyle='#43e6bb';c.fillRect(o.w-19,y-3,5,5);}
        c.fillStyle='#f47721';c.fillRect(8,-8,o.w-16,4);c.strokeStyle='#0b1934';c.lineWidth=3;c.strokeRect(0,-82,o.w,82);c.restore();
      }
      else if(o.type==='battery'){
        c.save();c.translate(o.x,this.ground);c.fillStyle='#ffd34d';c.fillRect(8,-55,44,55);c.fillRect(22,-61,16,7);c.fillStyle='#10265b';c.fillRect(27,-45,7,18);c.fillRect(21,-39,19,7);c.strokeStyle='#10265b';c.lineWidth=3;c.strokeRect(8,-55,44,55);c.restore();
      }
      else if(o.type==='circuit'||o.type==='motherboard'){
        c.save();c.translate(o.x,this.ground);c.fillStyle='#16765a';c.fillRect(0,-56,o.w,56);c.strokeStyle='#ffd34d';c.lineWidth=3;
        for(let k=0;k<4;k++){c.beginPath();c.moveTo(8,-45+k*12);c.lineTo(28,-45+k*12);c.lineTo(28,-25);c.stroke();}
        c.fillStyle='#263b62';c.fillRect(o.w/2-12,-42,24,24);c.strokeStyle='#10265b';c.lineWidth=3;c.strokeRect(0,-56,o.w,56);c.restore();
      }
      else if(o.type==='coil'||o.type==='fan'){
        c.save();c.translate(o.x+31,this.ground-31);c.strokeStyle='#1676c5';c.lineWidth=7;c.beginPath();c.arc(0,0,25,0,Math.PI*2);c.stroke();c.fillStyle='#8797aa';c.beginPath();c.arc(0,0,8,0,Math.PI*2);c.fill();
        for(let k=0;k<4;k++){c.save();c.rotate(k*Math.PI/2);c.fillStyle='#b8c8d8';c.fillRect(-4,-24,8,19);c.restore();}c.restore();
      }
      else if(o.type==='drone'){
        c.save();c.translate(o.x,this.ground-50);c.fillStyle='#263b62';c.fillRect(13,-8,40,16);c.fillStyle='#56b9ed';c.fillRect(23,-4,20,8);
        c.strokeStyle='#10265b';c.lineWidth=4;c.beginPath();c.moveTo(18,0);c.lineTo(0,-15);c.moveTo(48,0);c.lineTo(66,-15);c.stroke();c.fillStyle='#f47721';c.fillRect(-7,-20,22,5);c.fillRect(50,-20,22,5);c.restore();
      }
      else if(o.type==='antenna'){
        c.save();c.translate(o.x,this.ground);c.strokeStyle='#8797aa';c.lineWidth=6;c.beginPath();c.moveTo(35,0);c.lineTo(35,-82);c.stroke();c.beginPath();c.arc(35,-82,24,-1.1,1.1);c.stroke();c.beginPath();c.arc(35,-82,14,-1.1,1.1);c.stroke();c.fillStyle='#f47721';c.fillRect(29,-5,13,5);c.restore();
      }
      else if(o.type==='labcart'||o.type==='microscope'){
        c.save();c.translate(o.x,this.ground);c.fillStyle='#8797aa';c.fillRect(4,-38,86,7);c.fillRect(12,-31,6,25);c.fillRect(77,-31,6,25);c.fillStyle='#56b9ed';c.fillRect(12,-57,24,18);c.fillStyle='#f47721';c.fillRect(48,-56,25,18);c.fillStyle='#17243a';c.beginPath();c.arc(20,-3,7,0,Math.PI*2);c.arc(76,-3,7,0,Math.PI*2);c.fill();c.restore();
      }
      else if(o.type==='printer'){
        c.save();c.translate(o.x,this.ground);
        c.fillStyle='#263b62';c.fillRect(4,-55,64,48);
        c.fillStyle='#dce8f4';c.fillRect(12,-49,48,25);
        c.fillStyle='#8797aa';c.fillRect(8,-17,56,14);
        c.fillStyle='#ffffff';c.fillRect(18,-25,38,18);
        c.fillStyle='#f47721';c.fillRect(50,-43,8,5);
        c.strokeStyle='#10265b';c.lineWidth=3;c.strokeRect(4,-55,64,48);c.restore();
      }
      else if(o.type==='books'){
        c.save();c.translate(o.x,this.ground);
        const bookColors=['#f47721','#1676c5','#20a66a'];
        for(let k=0;k<3;k++){c.fillStyle=bookColors[k];c.fillRect(k*19,-(28+k*9),58,25);c.fillStyle='#fff';c.fillRect(k*19+6,-(22+k*9),45,3);}
        c.restore();
      }
      else if(o.type==='wetfloor'){
        c.save();c.translate(o.x,this.ground);
        c.fillStyle='#ffd34d';c.beginPath();c.moveTo(29,-68);c.lineTo(57,-8);c.lineTo(1,-8);c.closePath();c.fill();
        c.strokeStyle='#10265b';c.lineWidth=3;c.stroke();
        c.fillStyle='#10265b';c.font='bold 16px Arial';c.textAlign='center';c.fillText('!',29,-28);
        c.fillStyle='#f47721';c.fillRect(7,-7,44,7);c.restore();
      }
      else if(o.type==='robotarm'){
        c.save();c.translate(o.x,this.ground);
        c.fillStyle='#8797aa';c.fillRect(5,-12,82,12);
        c.strokeStyle='#1676c5';c.lineWidth=13;c.lineCap='round';
        c.beginPath();c.moveTo(25,-12);c.lineTo(34,-52);c.lineTo(68,-68);c.stroke();
        c.fillStyle='#f47721';c.beginPath();c.arc(34,-52,9,0,Math.PI*2);c.arc(68,-68,8,0,Math.PI*2);c.fill();
        c.strokeStyle='#10265b';c.lineWidth=5;c.beginPath();c.moveTo(68,-68);c.lineTo(82,-78);c.moveTo(68,-68);c.lineTo(83,-59);c.stroke();
        c.restore();
      }
      else if(o.type==='usb'){
        c.save(); c.translate(o.x,this.ground);
        c.fillStyle='#8797aa'; c.fillRect(7,-37,34,30);
        c.fillStyle='#263b62'; c.fillRect(12,-31,24,18);
        c.fillStyle='#f47721'; c.fillRect(17,-24,14,5);
        c.fillStyle='#cbd8e6'; c.fillRect(18,-7,12,7);
        c.strokeStyle='#10265b'; c.lineWidth=3; c.strokeRect(7,-37,34,30); c.restore();
      }
      else if(o.type==='keyboard'){
        c.save(); c.translate(o.x,this.ground);
        c.fillStyle='#263b62'; c.fillRect(0,-25,82,22);
        c.fillStyle='#dce8f4';
        for(let row=0;row<2;row++) for(let k=0;k<10;k++) c.fillRect(5+k*7.5,-21+row*8,5,5);
        c.fillStyle='#f47721'; c.fillRect(25,-8,32,3);
        c.strokeStyle='#10265b'; c.lineWidth=3; c.strokeRect(0,-25,82,22); c.restore();
      }
      else if(o.type==='headphones'){
        c.save(); c.translate(o.x,this.ground);
        c.strokeStyle='#263b62'; c.lineWidth=9; c.beginPath(); c.arc(33,-29,24,Math.PI,0); c.stroke();
        c.fillStyle='#f47721'; c.fillRect(3,-31,13,25); c.fillRect(50,-31,13,25);
        c.fillStyle='#10265b'; c.fillRect(6,-26,7,14); c.fillRect(53,-26,7,14);
        c.restore();
      }
      else if(o.type==='ups'){
        c.save();c.translate(o.x,this.ground);
        c.fillStyle='#263b62';c.fillRect(5,-72,64,72);
        c.fillStyle='#10265b';c.fillRect(12,-64,50,55);
        c.fillStyle='#43e6bb';c.fillRect(20,-53,34,9);
        c.fillStyle='#f47721';c.fillRect(20,-33,34,5);
        c.fillStyle='#ffd34d';c.fillRect(30,-20,14,7);
        c.strokeStyle='#8bd5ed';c.lineWidth=3;c.strokeRect(5,-72,64,72);c.restore();
      }
      else {c.fillStyle='#a96c35';c.fillRect(o.x,this.ground-58,58,58);c.strokeStyle='#f0c17d';c.lineWidth=4;c.strokeRect(o.x+5,this.ground-53,48,48);}
    }
    // Portão de desafio pedagógico
    for(const g of this.gates){ c.fillStyle='#10265b'; c.fillRect(g.x,this.ground-175,22,175); c.fillRect(g.x+112,this.ground-175,22,175); c.fillStyle='#f47721'; c.fillRect(g.x-8,this.ground-184,150,18); c.fillStyle='#fff'; c.font='bold 19px Arial'; c.textAlign='center'; c.fillText('DESAFIO',g.x+63,this.ground-145); c.fillStyle='#ffd34d'; c.font='bold 15px Arial'; c.fillText('SENAI',g.x+63,this.ground-120); }
    // Bifurcação visual: escolha superior (mais aprendizes) ou inferior (pontos + escudo).
    for (const f of this.routeForks) {
      if (f.chosen) continue;
      const glow = 0.65 + Math.sin(f.pulse) * 0.25;
      c.save();
      c.globalAlpha = glow;
      c.fillStyle = '#10265b'; c.fillRect(f.x, this.ground - 205, 220, 205);
      c.fillStyle = '#42d392'; c.fillRect(f.x + 12, this.ground - 190, 196, 74);
      c.fillStyle = '#ffd34d'; c.fillRect(f.x + 12, this.ground - 88, 196, 74);
      c.fillStyle = '#10265b'; c.font = 'bold 18px Arial'; c.textAlign = 'center';
      c.fillText('↑ PULE: +4 ALUNOS', f.x + 110, this.ground - 148);
      c.fillText('ROTA SEGURA', f.x + 110, this.ground - 48);
      c.fillStyle = '#fff'; c.font = 'bold 13px Arial';
      c.fillText('PONTOS + ESCUDO', f.x + 110, this.ground - 25);
      c.restore();
    }
    // Moedas/medalhas coletáveis
    for(const coin of this.coins){ const squash=.35+Math.abs(Math.cos(coin.spin))*.65; c.save();c.translate(coin.x,coin.y);c.scale(squash,1);c.fillStyle='#f8b928';c.strokeStyle='#fff0a6';c.lineWidth=4;c.beginPath();c.arc(0,0,14,0,Math.PI*2);c.fill();c.stroke();c.fillStyle='#fff4b5';c.font='bold 16px Arial';c.textAlign='center';c.fillText('★',0,6);c.restore(); }
    // Itens especiais flutuantes: cada poder tem cor e símbolo próprios.
    const powerStyle = {
      shield:{color:'#55c8ff',symbol:'S'},
      magnet:{color:'#ff5c9a',symbol:'M'},
      turbo:{color:'#ff9b35',symbol:'»'},
      multiplier:{color:'#b38cff',symbol:'x2'}
    };
    for (const p of this.powerups) {
      const st=powerStyle[p.type]; c.save(); c.translate(p.x,p.y+Math.sin(p.spin*2)*5);
      c.shadowColor=st.color; c.shadowBlur=22;
      c.fillStyle='#10265b'; c.strokeStyle=st.color; c.lineWidth=5;
      c.beginPath(); c.arc(0,0,23,0,Math.PI*2); c.fill(); c.stroke();
      c.shadowBlur=0; c.fillStyle='#fff'; c.font='bold 18px Arial'; c.textAlign='center'; c.fillText(st.symbol,0,6);
      c.restore();
    }
    // Indicadores dos poderes ativos no canto superior direito.
    const active = Object.entries(this.effects).filter(([,time])=>time>0);
    if(active.length){
      const names={shield:'ESCUDO',magnet:'ÍMÃ',turbo:'TURBO',multiplier:'PONTOS x2'};
      c.fillStyle='#10265bdc'; c.fillRect(1000,18,260,active.length*34+14);
      active.forEach(([key,time],i)=>{
        c.fillStyle=powerStyle[key].color; c.beginPath(); c.arc(1020,39+i*34,8,0,Math.PI*2); c.fill();
        c.fillStyle='#fff'; c.font='bold 15px Arial'; c.textAlign='left';
        c.fillText(`${names[key]}  ${Math.ceil(time/60)}s`,1038,44+i*34);
      });
    }
    // Aprendizes recrutáveis aparecem à frente do grupo
    for (const r of this.recruits) {
      const t = r.joinT || 0, y = r.y ?? this.ground;
      this.person(r.x, y, r.joining ? 0.94 - t * 0.18 : 0.94, r.phase, false);
      c.fillStyle = '#20a66a'; c.font = 'bold 16px Arial'; c.textAlign = 'center';
      c.fillText(r.joining ? 'ENTRANDO!' : '+1', r.x, y - 94);
      if (r.joining) {
        c.globalAlpha = 0.35 * (1-t); c.strokeStyle = '#42d392'; c.lineWidth = 3;
        c.beginPath(); c.arc(r.x, y-35, 25+t*20, 0, Math.PI*2); c.stroke(); c.globalAlpha = 1;
      }
    }
    // Formação 2.5D: três faixas de profundidade com abertura em leque.
    // As fileiras próximas parecem maiores; as distantes ficam menores e mais compactas.
    const shown = Math.min(this.crowd, 110);
    for (let i = shown - 1; i >= 0; i--) {
      const row = Math.floor(i / 11), col = i % 11;
      const depth = row / 9;
      const spacing = 21 + depth * 5.5;
      const laneWave = Math.sin(this.frame * 0.035 - row * 0.52) * (2.5 + depth * 3.5);
      const laneOffset = (col % 2 ? 3 : -3) + laneWave;
      const x = 218 - col * spacing - row * 8.5 + laneOffset;
      const y = this.playerY - row * 16 - (col % 2) * 5
        + Math.sin(this.frame * .12 + i * 1.7) * (1.4 + depth);
      const scale = Math.max(0.46, 0.94 - row * 0.043);
      const wave = this.crowdReaction > 0
        ? Math.max(0, this.crowdReaction - ((row * 2 + col % 4) * 2.2))
        : 0;
      const dodgeWave = this.obstacleAwareness > 0.02
        ? Math.max(0, this.obstacleAwareness - (row * 0.035 + (col % 5) * 0.025))
        : 0;
      this.person(x, y, scale, i * 0.63 + row * 0.11, i === 0, wave, dodgeWave);
    }
    // Contador de horda em destaque quando a equipe cresce.
    if (this.crowd >= 10) { c.fillStyle='#10265bdc'; c.fillRect(22,18,250,48); c.fillStyle='#ffd34d'; c.font='bold 23px Arial'; c.fillText(`ONDA: ${this.crowd} APRENDIZES`,36,49); }
    // Alerta visual: a horda se prepara quando um obstáculo se aproxima.
    if (this.obstacleAwareness > 0.08) {
      const alert = Math.min(1, this.obstacleAwareness);
      c.globalAlpha = 0.72 * alert;
      c.fillStyle = '#10265b';
      c.fillRect(120, this.ground - 188, 190, 28);
      c.fillStyle = '#ffd34d';
      c.font = 'bold 13px Arial';
      c.textAlign = 'center';
      c.fillText('ATENÇÃO À FRENTE!', 215, this.ground - 169);
      c.globalAlpha = 1;
      c.textAlign = 'left';
    }
    // O impacto percorre a horda em ondas, fazendo cada fileira reagir em sequência.
    if (this.crowdReaction > 0) {
      const strength = this.crowdReaction / 28;
      c.globalAlpha = 0.12 * strength;
      c.fillStyle = '#f47721';
      c.fillRect(115, this.ground - 150, 190, 150);
      c.globalAlpha = 1;
    }
    // Partículas de corrida, coleta e impacto
    for(const p of this.particles){ c.globalAlpha=Math.max(0,Math.min(1,p.life/22)); c.fillStyle=p.color; c.beginPath(); c.arc(p.x,p.y,p.size*(p.type==='dust'?1.1:Math.max(.2,p.life/18)),0,Math.PI*2); c.fill(); } c.globalAlpha=1;
    c.textAlign = 'left';
    if(this.landingPulse>0){c.globalAlpha=this.landingPulse/12*.32;c.fillStyle='#ffffff';c.fillRect(0,this.ground-5,this.width,5);c.globalAlpha=1;}
    if(this.paused){c.fillStyle='#10265bcc';c.fillRect(0,0,this.width,this.height);c.fillStyle='#fff';c.font='bold 54px Arial';c.textAlign='center';c.fillText('PAUSADO',640,350);c.textAlign='left';}
    c.restore();
  }
}

window.Game = Game;
})();
(()=>{
const Game = window.Game;
const $ = (s) => document.querySelector(s);
const canvas = $('#game'), overlay = $('#overlay'), results = $('#results'), quiz = $('#quiz');
const startButton = $('#start'), jumpButton = $('#jump'), pauseButton = $('#pause');
const environmentSelect = $('#environment-select');
let questionIndex = 0, questionOpen = false, soundEnabled = true;
let questionDeck = [];
const questions = [
 {topic:'Hardware',level:'Fácil',q:'Qual componente executa as instruções de um computador?',a:['Memória RAM','Processador (CPU)','Fonte de alimentação','Gabinete'],correct:1,why:'A CPU interpreta e executa as instruções dos programas.'},
 {topic:'Hardware',level:'Fácil',q:'Qual componente mantém dados temporários enquanto o computador está ligado?',a:['SSD','Memória RAM','Placa de vídeo','Fonte'],correct:1,why:'A memória RAM guarda temporariamente dados e programas em uso.'},
 {topic:'Hardware',level:'Fácil',q:'Qual dispositivo armazena arquivos mesmo após desligar o computador?',a:['Cooler','Memória cache','SSD','Dissipador'],correct:2,why:'O SSD é uma unidade de armazenamento não volátil.'},
 {topic:'Periféricos',level:'Fácil',q:'Qual destes é um dispositivo de entrada?',a:['Monitor','Teclado','Caixa de som','Projetor'],correct:1,why:'O teclado envia dados e comandos do usuário para o computador.'},
 {topic:'Periféricos',level:'Fácil',q:'Qual periférico transforma documentos físicos em arquivos digitais?',a:['Scanner','Impressora','Headset','Estabilizador'],correct:0,why:'O scanner captura imagens ou documentos e os digitaliza.'},
 {topic:'Software',level:'Fácil',q:'Para que serve um driver?',a:['Aumentar a memória RAM','Permitir a comunicação do sistema com um dispositivo','Limpar o monitor','Criar cópias de segurança automaticamente'],correct:1,why:'O driver permite que o sistema operacional reconheça e controle o hardware.'},
 {topic:'Sistemas',level:'Fácil',q:'Qual é a principal função de um sistema operacional?',a:['Gerenciar recursos do computador e oferecer serviços aos programas','Somente editar imagens','Aumentar fisicamente o disco','Substituir todos os aplicativos'],correct:0,why:'O sistema operacional gerencia hardware, arquivos, memória e execução de programas.'},
 {topic:'Redes',level:'Fácil',q:'Qual equipamento conecta dispositivos em uma rede local cabeada?',a:['Scanner','Switch','Projetor','Nobreak'],correct:1,why:'O switch encaminha quadros entre dispositivos conectados à rede local.'},
 {topic:'Redes',level:'Médio',q:'O que significa a sigla IP em redes?',a:['Internet Program','Internal Process','Internet Protocol','Input Port'],correct:2,why:'IP significa Internet Protocol, protocolo usado no endereçamento e encaminhamento de pacotes.'},
 {topic:'Redes',level:'Médio',q:'Qual serviço normalmente distribui endereços IP automaticamente?',a:['DHCP','HTTP','FTP',' HDMI'],correct:0,why:'O DHCP entrega configurações de rede automaticamente aos clientes.'},
 {topic:'Segurança',level:'Fácil',q:'Qual prática ajuda a proteger uma conta?',a:['Repetir a mesma senha em todos os sites','Compartilhar a senha com colegas','Usar senha forte e exclusiva','Anotar a senha em local público'],correct:2,why:'Senhas fortes e exclusivas reduzem o risco de acesso indevido.'},
 {topic:'Segurança',level:'Médio',q:'O que é phishing?',a:['Um tipo de memória','Uma tentativa de enganar a pessoa para obter dados ou acesso','Um cabo de rede','Uma atualização do sistema'],correct:1,why:'Phishing usa mensagens ou páginas falsas para induzir a vítima a revelar informações.'},
 {topic:'Manutenção',level:'Fácil',q:'Qual ação é recomendada antes de abrir um gabinete para manutenção?',a:['Desconectar a energia e adotar proteção contra descarga eletrostática','Molhar os componentes','Deixar o computador ligado','Retirar peças puxando pelos cabos'],correct:0,why:'Desenergizar o equipamento e controlar a eletricidade estática ajuda a evitar danos e acidentes.'},
 {topic:'Manutenção',level:'Médio',q:'Qual ferramenta é indicada para verificar tensão elétrica?',a:['Alicate comum','Multímetro','Pincel','Chave Phillips'],correct:1,why:'O multímetro mede grandezas elétricas, como tensão, corrente e resistência.'},
 {topic:'Manutenção',level:'Fácil',q:'O que caracteriza uma manutenção preventiva?',a:['Agir somente depois da falha','Substituir sempre todo o computador','Realizar ações planejadas para reduzir a chance de falhas','Ignorar sinais de desgaste'],correct:2,why:'A manutenção preventiva é planejada para reduzir falhas e prolongar a vida útil.'},
 {topic:'Armazenamento',level:'Médio',q:'Qual vantagem comum do SSD em relação ao HD mecânico?',a:['Possui partes móveis','Geralmente oferece acesso mais rápido aos dados','Não precisa de energia','Armazena dados apenas enquanto ligado'],correct:1,why:'O SSD usa memória flash e não possui pratos mecânicos móveis.'},
 {topic:'Eletricidade',level:'Médio',q:'Qual é a função principal de um nobreak?',a:['Aumentar a velocidade da internet','Fornecer energia temporária e proteger contra interrupções e variações','Resfriar o processador','Ampliar a memória'],correct:1,why:'O nobreak mantém a alimentação por um período e pode oferecer proteção elétrica.'},
 {topic:'Ergonomia',level:'Fácil',q:'Qual atitude contribui para uma postura adequada no computador?',a:['Manter o monitor em posição confortável e fazer pausas','Trabalhar sempre curvado','Manter os punhos tensionados','Evitar qualquer pausa'],correct:0,why:'Ajustes ergonômicos e pausas ajudam a reduzir desconforto e sobrecarga.'},
 {topic:'TI Verde',level:'Fácil',q:'Como descartar corretamente equipamentos eletrônicos sem uso?',a:['Misturar com lixo orgânico','Queimar os componentes','Encaminhar a ponto de coleta ou logística reversa adequada','Jogar em terrenos vazios'],correct:2,why:'Resíduos eletrônicos devem seguir canais apropriados de coleta e destinação.'},
 {topic:'Boas práticas',level:'Médio',q:'Por que registrar uma manutenção realizada?',a:['Para evitar qualquer manutenção futura','Para manter histórico, rastreabilidade e apoiar diagnósticos','Para substituir o inventário','Para apagar alertas do sistema'],correct:1,why:'O registro documenta intervenções, peças, datas e resultados, facilitando o acompanhamento.'}
];
function refillQuestionDeck() {
  questionDeck = questions.map((_, index) => index);
  for (let i = questionDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questionDeck[i], questionDeck[j]] = [questionDeck[j], questionDeck[i]];
  }
}
function nextQuestion() {
  if (!questionDeck.length) refillQuestionDeck();
  return questions[questionDeck.pop()];
}
const achievementList = [
  {id:'distance100',label:'Primeiros passos',detail:'Alcance 100 metros',test:s=>s.distance>=100},
  {id:'distance500',label:'Aprendiz persistente',detail:'Alcance 500 metros',test:s=>s.distance>=500},
  {id:'distance1000',label:'Mestre da pista',detail:'Alcance 1.000 metros',test:s=>s.distance>=1000},
  {id:'crowd10',label:'Trabalho em equipe',detail:'Reúna 10 aprendizes',test:s=>s.crowd>=10},
  {id:'crowd50',label:'Liderança SENAI',detail:'Reúna 50 aprendizes',test:s=>s.crowd>=50},
  {id:'crowd100',label:'Grande equipe',detail:'Reúna 100 aprendizes',test:s=>s.crowd>=100},
  {id:'score1000',label:'Pontuação de destaque',detail:'Faça 1.000 pontos',test:s=>s.score>=1000}
];
const safeStorage = { get(key, fallback = null) { try { const value = localStorage.getItem(key); return value === null ? fallback : value; } catch (_) { return fallback; } }, set(key, value) { try { localStorage.setItem(key, value); return true; } catch (_) { return false; } } };
let unlockedAchievements = [];
try { unlockedAchievements = JSON.parse(safeStorage.get('ondaAprendizesAchievements', '[]')); } catch (_) { unlockedAchievements = []; }
function checkAchievements(stats) {
  const next = achievementList.find(a => !unlockedAchievements.includes(a.id) && a.test(stats));
  if (!next) return;
  unlockedAchievements.push(next.id);
  safeStorage.set('ondaAprendizesAchievements', JSON.stringify(unlockedAchievements));
  const msg = $('#message');
  msg.textContent = `🏅 CONQUISTA: ${next.label} — ${next.detail}!`;
  msg.classList.add('show');
  setTimeout(() => msg.classList.remove('show'), 3000);
}
const getBest = () => Number(safeStorage.get('ondaAprendizesRecord', '0')) || 0;
$('#best-score').textContent = getBest().toLocaleString('pt-BR');
const achievementCount = $('#achievement-count');
if (achievementCount) achievementCount.textContent = unlockedAchievements.length;

function sound(kind) {
  if (!soundEnabled) return;
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    const ctx = sound.ctx || (sound.ctx = new Audio());
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    const settings = {jump:[420,.09],coin:[880,.07],recruit:[660,.12],success:[990,.18],hit:[150,.16]};
    const [freq,duration] = settings[kind] || [440,.1];
    osc.type = kind === 'hit' ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(freq,ctx.currentTime);
    if (kind === 'success') osc.frequency.exponentialRampToValueAtTime(1320,ctx.currentTime+duration);
    gain.gain.setValueAtTime(.0001,ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.12,ctx.currentTime+.012);
    gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime+duration+.02);
  } catch (_) {}
}

const game = new Game(canvas, {
  onHud: ({ distance, crowd, score }) => {
    $('#distance').textContent = `${distance} m`;
    $('#crowd').textContent = crowd;
    $('#score').textContent = score.toLocaleString('pt-BR');
    checkAchievements({ distance, crowd, score });
  },
  onSound: sound,
  onMilestone: (target) => {
    const msg = $(`#message`);
    msg.textContent = `🏆 META ALCANÇADA: ${target} APRENDIZES! BÔNUS DE PONTOS!`;
    msg.classList.add('show');
    setTimeout(() => msg.classList.remove('show'), 2400);
  },
  onRouteChoice: (route, remaining) => {
    const msg = $('#message');
    msg.textContent = route === 'alta'
      ? `🟢 ROTA SUPERIOR! +4 APRENDIZES · TURMA: ${remaining}`
      : `🟡 ROTA SEGURA! +300 PONTOS E ESCUDO ATIVADO`;
    msg.classList.add('show');
    setTimeout(() => msg.classList.remove('show'), 2600);
  },
  onDifficulty: (level) => {
    const labels = ['INICIANTE','EM EVOLUÇÃO','DESAFIO','AVANÇADO','ESPECIALISTA','MESTRE'];
    const msg = $('#message');
    msg.textContent = `📈 NÍVEL ${level + 1}: ${labels[level]} — A pista ficou mais desafiadora!`;
    msg.classList.add('show');
    setTimeout(() => msg.classList.remove('show'), 2600);
  },
  onBoss: (number) => {
    const msg = $('#message');
    msg.textContent = `🤖 CHEFE DO SETOR ${number}! PREPARE O SALTO!`;
    msg.classList.add('show');
    setTimeout(() => msg.classList.remove('show'), 2600);
  },
  onBossDefeated: (remaining) => {
    const msg = $('#message');
    msg.textContent = `🏆 CHEFE SUPERADO! +5 APRENDIZES · TURMA: ${remaining}`;
    msg.classList.add('show');
    setTimeout(() => msg.classList.remove('show'), 2800);
  },
  onHit: (lost, remaining) => {
    const msg = $('#message');
    msg.textContent = `⚠️ IMPACTO! -${lost} aprendiz(es) · Restam ${remaining}`;
    msg.classList.add('show');
    setTimeout(() => msg.classList.remove('show'), 1500);
  },
  onQuestion: () => {
    if (questionOpen) return;
    questionOpen = true;
    const q = nextQuestion();
    $('#question-title').textContent = `DESAFIO · ${q.topic.toUpperCase()} · ${q.level.toUpperCase()}`;
    $('#question-text').textContent = q.q;
    $('#feedback').textContent = 'Escolha uma alternativa para liberar a passagem.';
    const answers = $('#answers'); answers.innerHTML = '';
    q.a.forEach((label,i) => {
      const b = document.createElement('button'); b.className = 'answer'; b.textContent = `${String.fromCharCode(65+i)}. ${label}`;
      b.addEventListener('click', () => {
        const ok = i === q.correct;
        $('#feedback').textContent = ok
          ? `Correto! ${q.why} +150 pontos e +1 aprendiz.`
          : `Resposta correta: ${String.fromCharCode(65+q.correct)}. ${q.a[q.correct]}. ${q.why} Você perdeu 1 aprendiz.`;
        sound(ok ? 'success' : 'hit');
        answers.querySelectorAll('button').forEach((x,index) => {
          x.disabled = true;
          if (index === q.correct) x.classList.add('correct-answer');
          else if (index === i && !ok) x.classList.add('wrong-answer');
        });
        setTimeout(() => { quiz.style.display = 'none'; questionOpen = false; game.answerQuestion(ok); }, 1900);
      });
      answers.appendChild(b);
    });
    quiz.style.display = 'grid';
  },
  onGameOver: () => showResults(),
  onError: (error) => {
    const msg = $('#message');
    msg.textContent = `ERRO NO JOGO: ${error?.message || 'falha na animação'}`;
    msg.classList.add('show');
    overlay.style.display = 'grid';
    const title = overlay.querySelector('h1');
    if (title) title.textContent = 'FALHA AO INICIAR';
  }
});

function beginGame() {
  const selectedEnvironment = Number(environmentSelect.value);
  if (!Number.isInteger(selectedEnvironment) || selectedEnvironment < 0 || selectedEnvironment > 6) throw new Error('Ambiente selecionado inválido');
  questionOpen = false;
  questionIndex = 0;
  refillQuestionDeck();
  game.start(selectedEnvironment);
  $('#message').textContent = 'JOGO INICIADO';
  $('#message').classList.add('show');
  setTimeout(() => $('#message').classList.remove('show'), 1200);
  quiz.style.display = 'none';
  results.style.display = 'none';
  overlay.style.display = 'none';
}
function showResults() {
  const distance = Math.floor(game.distance), score = game.score;
  const previous = getBest(), isRecord = score > previous;
  if (isRecord) safeStorage.set('ondaAprendizesRecord', String(score));
  $('#result-distance').textContent = `${distance} m`;
  $('#result-crowd').textContent = game.crowd;
  $('#result-score').textContent = score.toLocaleString('pt-BR');
  $('#result-summary').textContent = 'Missão concluída! Confira seu desempenho e tente superar sua marca.';
  $('#record-message').textContent = isRecord ? '🏆 NOVO RECORDE! Parabéns!' : `Seu melhor resultado: ${Math.max(previous,score).toLocaleString('pt-BR')} pontos`;
  $('#best-score').textContent = Math.max(previous,score).toLocaleString('pt-BR');
  results.style.display = 'grid';
}

let startActivationAt = 0;
function activateStart(event) {
  if (event) event.preventDefault();
  const now = Date.now();
  if (now - startActivationAt < 700) return;
  startActivationAt = now;
  startButton.classList.add('is-pressed');
  setTimeout(() => startButton.classList.remove('is-pressed'), 220);
  try {
    beginGame();
  } catch (error) {
    console.error('Falha ao iniciar o jogo:', error);
    const msg = $('#message');
    msg.textContent = `Erro ao iniciar: ${error?.message || 'falha desconhecida'}`;
    msg.classList.add('show');
    overlay.style.display = 'grid';
  }
}
startButton.type = 'button';
startButton.style.touchAction = 'manipulation';
window.__ondaStart = activateStart;
startButton.addEventListener('click', activateStart);
$('#again').addEventListener('click', beginGame);
$('#back-menu').addEventListener('click', () => { results.style.display = 'none'; overlay.style.display = 'grid'; });
$('#sound-toggle').addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  $('#sound-toggle').textContent = soundEnabled ? '🔊 SOM: LIGADO' : '🔇 SOM: DESLIGADO';
  if (soundEnabled) sound('success');
});
const jumpStart = (event) => {
  if (event.cancelable) event.preventDefault();
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  game.jump();
};
jumpButton.addEventListener('pointerdown', jumpStart, { passive: false });
canvas.addEventListener('pointerdown', (event) => {
  if (event.target === canvas) jumpStart(event);
}, { passive: false });

window.addEventListener('keydown', (event) => {
  if (['Space','ArrowUp','KeyW'].includes(event.code)) { event.preventDefault(); if (!event.repeat) game.jump(); }
  if (event.code === 'Escape') game.togglePause();
});
pauseButton.addEventListener('click', () => game.togglePause());

})();