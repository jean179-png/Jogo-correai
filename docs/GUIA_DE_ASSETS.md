# Guia de assets — Onda de Aprendizes

## Convenções
- PNG com transparência para sprites e objetos; PNG ou WebP para fundos em camadas.
- Pixel art sem antialiasing e sem redimensionamento fracionário.
- Nome de arquivo em minúsculas, sem espaços, com prefixos por categoria.
- Cada spritesheet informa largura/altura da célula, colunas/linhas, FPS, loop e ponto de ancoragem.
- Personagens usam a mesma escala-base e ancoragem nos pés.

## Estrutura-alvo
assets/characters/apprentice_01/ (e demais personagens)
assets/backgrounds/school/
assets/backgrounds/industrial/
assets/backgrounds/technology/
assets/obstacles/
assets/items/
assets/effects/
assets/ui/

## Lista inicial de produção

### Personagens
- 8–10 aprendizes originais.
- Cada um com corrida, salto, queda/aterrissagem, dano e comemoração.
- Aparências distintas; uniforme comum laranja/azul-marinho.

### Cenário escolar
- Céu com sol e nuvens.
- Prédios distantes e próximos.
- Árvores, grades, calçada e asfalto em faixas separadas.

### Cenário industrial
- Céu de pôr do sol.
- Fábricas, chaminés, guindastes e estruturas em planos separados.

### Obstáculos
- Buraco com pelo menos 2 variações.
- Carro, cone, cabo, cadeira, armário e caixa de ferramentas.
- Computador, servidor, roteador, bateria, placa e antena.
- Portão com 4 estados visuais.

## Convenção de spritesheet
Nome: char_ID_STATE.png
- Uma linha por estado ou um arquivo separado por estado.
- Quadros com dimensões idênticas.
- Ordem dos quadros documentada da esquerda para a direita.
- Sem texto, bordas ou numeração dentro da imagem.
- Transparência real fora do personagem.
- Ancoragem no centro inferior da célula.

## Controle de qualidade
- Verificar transparência.
- Alinhar os pés entre quadros.
- Não cortar cabelo, mochila, mãos ou sapatos.
- Manter consistência de contorno, luz e paleta.
- Testar animação em velocidade real no Canvas.
