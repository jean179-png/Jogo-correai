# Plano de evolução visual e técnica — Onda de Aprendizes

## Objetivo
Evoluir o jogo atual para um endless runner 2D lateral em pixel art, com personagens expressivos e variados, animações por spritesheet, cenários em camadas e obstáculos temáticos. A interface deve permanecer limpa e discreta, deixando a maior parte da tela para a ação.

## Diagnóstico do projeto atual
Verificação do repositório em 25/11/2026:
- O jogo está concentrado em index.html (HTML, CSS e JavaScript em um arquivo).
- A renderização usa um único Canvas de 1280 × 720.
- O desenho é feito principalmente por primitivas Canvas; não há carregamento de sprites externos.
- Já existem corrida, salto, multidão/recrutamento, moedas, portões, rotas, poderes, chefes, ambientes e obstáculos temáticos.
- A geração de obstáculos já contém regra para espaçar buracos, mas precisa de testes de jogabilidade e ajuste de dificuldade.
- O repositório contém workflow de GitHub Pages; a publicação deve ser validada separadamente.

## Direção visual aprovada
1. Jogo 2D lateral, sem perspectiva 3D.
2. Pixel art detalhado, contornos consistentes e paleta coesa.
3. Aprendizes de corpo inteiro, proporções humanas estilizadas, camiseta laranja, calça azul-marinho e mochila.
4. Diversidade real: gênero, tons de pele, cabelo, penteados e óculos.
5. Cenário escolar/urbano com céu, sol, nuvens, prédios, árvores, grades, calçada e asfalto.
6. Cenários alternativos industriais e de tecnologia, com fábricas, guindastes, equipamentos e laboratório.
7. Obstáculos legíveis e variados: buracos, carros, cones, cabos, caixas de ferramentas, cadeiras, armários, computadores, servidores, roteadores e portões.
8. HUD minimalista: pontuação, quantidade de aprendizes e comandos discretos. Menus e perguntas aparecem apenas quando necessários.

## Regras de produção de arte
- Criar arte original usando as imagens fornecidas como referência de estilo e direção; não copiar sprites proprietários pixel a pixel.
- Fundo transparente para personagens, obstáculos e itens.
- Escala-base comum para personagens e objetos.
- Spritesheet com células idênticas, margens consistentes e ordem de quadros documentada.
- Pixel art nítido, sem suavização no Canvas.
- Cada recurso deve ter nome, dimensões, quadros, ponto de ancoragem e descrição das animações.
- Criar fallback visual caso um arquivo não carregue.

## Roteiro de implementação

### Etapa 0 — Segurança e baseline
- Confirmar que a versão atual abre e que as mecânicas existentes funcionam.
- Salvar uma versão/tag de referência antes de grandes mudanças.
- Verificar publicação do GitHub Pages e corrigir o workflow, se necessário.
- Registrar capturas de tela e bugs conhecidos.
**Aceite:** versão de referência acessível, sem erro fatal no console, com instruções de execução.

### Etapa 1 — Organizar o código
- Separar o arquivo único em módulos: src/main.js, src/game.js, src/renderer.js, src/assets.js, src/entities/ e src/ui.js.
- Manter index.html como ponto de entrada.
- Centralizar dimensões, escala, cores e parâmetros em src/config.js.
- Não alterar regras de jogo nesta etapa.
**Aceite:** jogo se comporta como antes após a separação, sem regressões.

### Etapa 2 — Sistema de assets e animação
- Implementar carregador assíncrono de imagens com cache, estado de carregamento e fallback.
- Implementar animação por spritesheet: linha/coluna, duração por quadro, loop, pausa e troca de estado.
- Desenhar pixel-perfect com imageSmoothingEnabled = false.
- Usar âncora nos pés para manter contato com o chão.
- Suportar escala e profundidade sem deformar o pixel art.
**Aceite:** sprites sem distorção; animações sem tremor ou deslizamento no chão.

### Etapa 3 — Biblioteca de aprendizes
Produzir primeiro 8 a 10 personagens originais:
- Masculinos e femininos, diferentes tons de pele.
- Cabelos curtos, crespos, longos/presos e ruivos.
- Personagem com óculos.
- Uniforme consistente: camiseta laranja, calça azul-marinho, tênis e mochila.
- Animações mínimas: idle, run, jump, fall/land, hit e celebrate.
**Aceite:** multidão sorteia personagens diferentes sem duplicação excessiva; cada um mantém identidade visual.

### Etapa 4 — Multidão e recrutamento
- Substituir os bonecos desenhados por sprites.
- Distribuir aprendizes em profundidades/linhas com pequenas diferenças de escala, mantendo leitura 2D.
- Variar fase da animação para evitar corrida sincronizada.
- Animar entrada de novos aprendizes e reação ao dano.
- Limitar quantidade visual para preservar desempenho.
**Aceite:** grupo parece uma turma correndo, sem sobreposição excessiva, tremor ou queda de FPS.

### Etapa 5 — Cenários e parallax
Criar conjuntos de camadas independentes:
- Escola/cidade: céu, sol/nuvens, prédios, árvores, grades, calçada e rua.
- Industrial: céu/pôr do sol, fábricas, chaminés, guindastes e estruturas.
- Tecnologia/laboratório: fachadas, antenas, servidores e equipamentos.
Cada camada deve ter velocidade própria e repetição sem emendas.
**Aceite:** cenário se move continuamente, com profundidade e sem espaços vazios.

### Etapa 6 — Obstáculos e itens
Produzir sprites separados para:
- Buraco no asfalto, com variações de largura e rachaduras.
- Carro, cone, barreira e cabo/fio atravessando a pista.
- Cadeira, armário e caixa de ferramentas.
- Computador, gabinete, monitor, servidor e roteador.
- Bateria, placa eletrônica, bobina e antena.
- Portão nos estados fechado, abrindo, aberto e quebrando.
Cada obstáculo terá caixa de colisão própria, independente da área transparente.
**Aceite:** perigo legível antes da colisão; buracos exigem salto e nunca surgem em sequência impossível.

### Etapa 7 — Interface limpa
- HUD discreto no topo, com contraste suficiente e sem cobrir personagens.
- Botões de toque pequenos nas bordas inferiores.
- Mensagens curtas e temporárias.
- Perguntas/portões em telas de evento, sem painéis permanentes.
- Menu inicial e resultados coerentes com a identidade SENAI.
**Aceite:** área principal livre e legível em celular e desktop.

### Etapa 8 — Áudio, efeitos e feedback
- Sons curtos para salto, coleta, recrutamento, colisão e portão.
- Partículas discretas e efeitos de impacto.
- Opção para desligar som.
- Não iniciar áudio antes da primeira interação.
**Aceite:** feedback claro, sem excesso de efeitos ou travamentos.

### Etapa 9 — Testes e publicação
Testar teclado, toque no Android/Chrome, telas estreitas, orientação horizontal/vertical, saltos, colisões, recrutamento, portões, rede lenta, fallback de assets, sessão longa, desempenho e GitHub Actions.
**Aceite:** sem erro fatal ou asset quebrado, controles responsivos e publicação confirmada.

## Ordem recomendada
1. Baseline e organização do código.
2. Asset loader e animação.
3. Personagens.
4. Multidão.
5. Cenário escolar.
6. Obstáculos.
7. Cenários temáticos.
8. HUD e efeitos.
9. Testes e publicação.

## Fora de escopo nesta primeira atualização
- Não reconstruir todas as mecânicas do zero.
- Não trocar o jogo por imagem ou vídeo.
- Não usar sprites genéricos repetidos para simular diversidade.
- Não adicionar interface permanente que esconda o cenário.
- Não considerar publicação concluída até o workflow ficar verde e o site abrir.

## Critérios finais de qualidade
Visual consistente; personagens identificáveis e animados; cenários com parallax sem emendas; obstáculos variados, legíveis e justos; interface mínima; mecânicas preservadas; bom desempenho no Android/Chrome.
