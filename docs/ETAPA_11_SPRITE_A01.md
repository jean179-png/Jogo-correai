# Etapa 11 — primeiro personagem em sprite

## Objetivo
Substituir o desenho procedural do personagem líder por um spritesheet próprio, mantendo o desenho procedural como fallback caso a imagem não carregue.

## Implementação
- Criado `assets/personagens/spritesheet-A01.svg`, com grade de 6 colunas por 3 linhas e células de 96×96.
- O personagem A01 usa camiseta laranja, calça azul-marinho, mochila azul e tênis claros.
- Configuradas sequências de corrida, salto, queda, espera e comemoração.
- Integrado o carregamento do personagem no motor do jogo.
- Apenas o aprendiz líder usa o sprite nesta etapa; os demais integrantes da turma continuam com as variações procedurais existentes.
- Se o arquivo SVG falhar ao carregar, o método de desenho procedural continua disponível.

## Arquivos alterados
- `assets/personagens/spritesheet-A01.svg`
- `src/sprite-animation.js`
- `src/game.js`

## Verificação e limitações
Os arquivos foram gravados e relidos no repositório. Foi conferida a existência dos caminhos e da integração no código. Ainda não foi realizado teste visual em navegador ou celular; portanto, alinhamento, ritmo da animação e compatibilidade do SVG precisam ser confirmados em execução.

## Próxima etapa
Etapa 12 — criar variações de personagens aprendizes (A02 em diante) e integrar uma seleção aleatória para os integrantes da turma, mantendo diversidade visual e consistência do uniforme.
