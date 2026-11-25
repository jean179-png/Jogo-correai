# Etapa 8 — Progressão e dificuldade dinâmica

## Progressão por distância
A dificuldade agora evolui em seis faixas, começando em Iniciante e avançando a cada 500 metros:
1. Iniciante
2. Em evolução
3. Desafio
4. Avançado
5. Especialista
6. Mestre

Ao alcançar uma nova faixa, o jogo mostra um aviso na tela.

## Ajustes de desafio
- A velocidade do jogo já aumentava gradualmente com a distância; esse comportamento foi preservado.
- A frequência de obstáculos agora aumenta progressivamente por faixa, com limite mínimo de intervalo para evitar uma sequência impossível.
- Os chefes continuam surgindo em intervalos de distância; conforme a dificuldade sobe, o intervalo diminui gradualmente, respeitando um limite mínimo.
- O dano dos chefes aumenta gradualmente a cada três chefes derrotados, limitado a 7 aprendizes.

## Arquivos alterados
- `src/game.js`: nível de dificuldade, ajuste de frequência e escala dos chefes.
- `src/main.js`: aviso visual de mudança de faixa.

## Validação
Os arquivos foram gravados e conferidos no GitHub. A execução real no navegador ainda é necessária para verificar o equilíbrio da dificuldade, a distância entre obstáculos e a experiência em diferentes dispositivos.
