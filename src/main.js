import { Game } from './game.js';

const $ = (s) => document.querySelector(s);
const canvas = $('#game'), overlay = $('#overlay'), results = $('#results'), quiz = $('#quiz');
const startButton = $('#start'), jumpButton = $('#jump'), pauseButton = $('#pause');
const environmentSelect = $('#environment-select');
let questionIndex = 0, questionOpen = false, soundEnabled = true;
const questions = [
 {q:'Qual componente executa as instruções de um computador?',a:['Memória RAM','Processador (CPU)','Fonte de alimentação'],correct:1},
 {q:'Qual dispositivo conecta computadores em uma rede local?',a:['Switch','Monitor','Scanner'],correct:0},
 {q:'Qual prática ajuda a proteger uma conta?',a:['Repetir a mesma senha','Compartilhar a senha','Usar senha forte e exclusiva'],correct:2},
 {q:'Qual componente armazena arquivos mesmo com o computador desligado?',a:['SSD','Cooler','Memória cache'],correct:0},
 {q:'Para que serve um driver?',a:['Decorar a área de trabalho','Permitir a comunicação do sistema com o dispositivo','Aumentar o brilho'],correct:1}
];
const getBest = () => Number(localStorage.getItem('ondaAprendizesRecord') || 0);
$('#best-score').textContent = getBest().toLocaleString('pt-BR');

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
    const q = questions[questionIndex++ % questions.length];
    $('#question-text').textContent = q.q;
    $('#feedback').textContent = 'Escolha uma alternativa para liberar a passagem.';
    const answers = $('#answers'); answers.innerHTML = '';
    q.a.forEach((label,i) => {
      const b = document.createElement('button'); b.className = 'answer'; b.textContent = label;
      b.addEventListener('click', () => {
        const ok = i === q.correct;
        $('#feedback').textContent = ok ? 'Resposta correta! +150 pontos e +1 aprendiz.' : 'Não foi dessa vez! Você perdeu 1 aprendiz.';
        sound(ok ? 'success' : 'hit');
        answers.querySelectorAll('button').forEach(x => x.disabled = true);
        setTimeout(() => { quiz.style.display = 'none'; questionOpen = false; game.answerQuestion(ok); }, 850);
      });
      answers.appendChild(b);
    });
    quiz.style.display = 'grid';
  },
  onGameOver: () => showResults()
});

function beginGame() {
  quiz.style.display = 'none'; results.style.display = 'none'; overlay.style.display = 'none';
  questionOpen = false; game.start(Number(environmentSelect.value));
}
function showResults() {
  const distance = Math.floor(game.distance), score = game.score;
  const previous = getBest(), isRecord = score > previous;
  if (isRecord) localStorage.setItem('ondaAprendizesRecord', String(score));
  $('#result-distance').textContent = `${distance} m`;
  $('#result-crowd').textContent = game.crowd;
  $('#result-score').textContent = score.toLocaleString('pt-BR');
  $('#result-summary').textContent = 'Missão concluída! Confira seu desempenho e tente superar sua marca.';
  $('#record-message').textContent = isRecord ? '🏆 NOVO RECORDE! Parabéns!' : `Seu melhor resultado: ${Math.max(previous,score).toLocaleString('pt-BR')} pontos`;
  $('#best-score').textContent = Math.max(previous,score).toLocaleString('pt-BR');
  results.style.display = 'grid';
}

startButton.addEventListener('click', beginGame);
$('#again').addEventListener('click', beginGame);
$('#back-menu').addEventListener('click', () => { results.style.display = 'none'; overlay.style.display = 'grid'; });
$('#sound-toggle').addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  $('#sound-toggle').textContent = soundEnabled ? '🔊 SOM: LIGADO' : '🔇 SOM: DESLIGADO';
  if (soundEnabled) sound('success');
});
const jumpStart = (event) => { event.preventDefault(); game.jump(); };
jumpButton.addEventListener('pointerdown', jumpStart);
canvas.addEventListener('pointerdown', jumpStart);
window.addEventListener('keydown', (event) => {
  if (['Space','ArrowUp','KeyW'].includes(event.code)) { event.preventDefault(); if (!event.repeat) game.jump(); }
  if (event.code === 'Escape') game.togglePause();
});
pauseButton.addEventListener('click', () => game.togglePause());
