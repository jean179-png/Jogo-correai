# Etapa 6 — Coletáveis, poderes e recompensas

## Recursos existentes preservados
- Moedas/medalhas coletáveis.
- Escudo, ímã, turbo e multiplicador de pontos.
- Indicadores dos poderes ativos na interface.
- Efeitos de partículas e sons de coleta.
- Atração de moedas pelo ímã.

## Melhorias implementadas
- Sequência de moedas (combo) com janela de tempo.
- Bônus progressivo por coleta consecutiva, limitado a 10 moedas na sequência.
- Recompensa extra ao alcançar 5 e 10 moedas consecutivas.
- O multiplicador x2 também dobra os pontos das moedas e os bônus de sequência.
- Combo reinicia quando a janela de tempo termina ou uma nova partida começa.

## Regras de pontuação
- Primeira moeda: 25 pontos.
- Cada moeda consecutiva acrescenta 5 pontos ao valor-base, até o limite do combo.
- Ao atingir 5 ou 10 moedas seguidas: +100 pontos extras.
- Com multiplicador ativo, os pontos dessas recompensas são dobrados.

## Validação pendente
O código foi atualizado e conferido no GitHub. Ainda é necessário testar no navegador o ritmo de coleta, a janela do combo, o acúmulo do multiplicador e o comportamento em celular.
