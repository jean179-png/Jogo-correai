# Etapa 9 — Interface responsiva e controles mobile

## Adaptação visual
- A área do jogo ocupa a tela disponível usando unidades de viewport modernas.
- HUD reduz tamanhos e espaçamentos em telas estreitas.
- Menus e diálogos podem rolar verticalmente quando a altura do aparelho é limitada.
- Perguntas usam duas colunas em telas baixas na orientação paisagem.
- Foram consideradas as áreas seguras do aparelho (notch e barras do sistema).
- Botões e alternativas têm altura mínima de toque de 44 px em telas compatíveis.

## Controles
- Botão PULAR com área de toque ampliada.
- Toque no canvas também executa o pulo.
- Eventos de ponteiro evitam comportamento padrão de rolagem/seleção durante o jogo.
- Teclado e mouse continuam compatíveis.

## Acessibilidade e experiência
- Mantidos rótulos acessíveis do botão de pulo.
- Respeitada a preferência do sistema por movimento reduzido em animações CSS.
- Adicionado texto de descrição da experiência na página.

## Arquivos alterados
- `style.css`: regras responsivas, safe areas, orientação paisagem, área de toque e diálogos roláveis.
- `src/main.js`: tratamento de eventos de toque e ponteiro.
- `index.html`: descrição da página e dica do controle de pulo.

## Validação pendente
As alterações foram salvas e conferidas no GitHub. Não foi executado teste real em aparelho Android/iOS nem em emulador. Recomenda-se testar em retrato e paisagem, conferir se o HUD não cobre a área de jogo e validar os botões de resposta do quiz.
