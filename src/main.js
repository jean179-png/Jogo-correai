import { Game } from './game.js';

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
let unlockedAchievements = [];
try { unlockedAchievements = JSON.parse(localStorage.getItem('ondaAprendizesAchievements') || '[]'); } catch (_) {}
function checkAchievements(stats) {
  const next = achievementList.find(a => !unlockedAchievements.includes(a.id) && a.test(stats));
  if (!next) return;
  unlockedAchievements.push(next.id);
  localStorage.setItem('ondaAprendizesAchievements', JSON.stringify(unlockedAchievements));
  const msg = $('#message');
  msg.textContent = `🏅 CONQUISTA: ${next.label} — ${next.detail}!`;
  msg.classList.add('show');
  setTimeout(() => msg.classList.remove('show'), 3000);
}
const getBest = () => Number(localStorage.getItem('ondaAprendizesRecord') || 0);
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
  onGameOver: () => showResults()
});

function beginGame() {
  quiz.style.display = 'none'; results.style.display = 'none'; overlay.style.display = 'none';
  questionOpen = false; questionIndex = 0; refillQuestionDeck(); game.start(Number(environmentSelect.value));
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
