# Etapa 13 — Animações e reações dos aprendizes

## Implementado
- Estado de impacto prioritário após colisão, com duração temporizada.
- Estado de comemoração após recrutamento, conquista de marco e derrota de chefe.
- Corrida, salto e queda continuam selecionados conforme o movimento vertical.
- Variação de fase por personagem no desenho do sprite, reduzindo a sensação de movimento sincronizado.
- Pequeno balanço vertical individual durante a corrida.
- Os estados novos usam os quadros de impacto e comemoração já existentes nos spritesheets.

## Preservação
- Não altera velocidade, colisões, pontuação, recrutamento ou regras de jogo.
- O desenho procedural continua como fallback caso o sprite não esteja carregado.

## Verificação
As alterações de código foram gravadas no GitHub. A conferência visual em navegador e em dispositivos móveis ainda precisa ser realizada.
