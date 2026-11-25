# Etapa 2 — Sistema de sprites e animações

## Objetivo
Preparar o jogo para receber personagens em PNG com transparência, mantendo o desenho atual como fallback até que cada arquivo esteja disponível.

## Implementado
- Módulo reutilizável `src/sprite-animation.js`.
- Carregamento assíncrono de spritesheets.
- Seleção de animação e avanço de quadros por tempo.
- Desenho com escala e opção de inverter horizontalmente.
- Configuração inicial do personagem A01.

## Padrão planejado para os arquivos
- Formato: PNG com fundo transparente.
- Células uniformes: 96 × 96 px.
- Personagem A01: spritesheet com 6 colunas.
- Sequências configuradas: corrida (6 quadros), salto (4), queda (4) e comemoração (4).
- Caminho previsto: `assets/personagens/spritesheet-A01.png`.

## Importante
O módulo ainda não substitui os personagens desenhados diretamente no Canvas. A integração visual será ativada quando os spritesheets reais, recortados e conferidos, forem adicionados. Isso evita que o jogo fique com imagens quebradas ou personagens invisíveis.

## Próximo passo
Produzir e validar os PNGs individuais dos aprendizes A01–A10; depois conectar o A01 ao método de desenho do jogo e testar no navegador, incluindo tela de celular.
