# Etapa 7 — Sistema pedagógico de perguntas

## Banco de questões
Foi ampliado o banco para 20 questões de múltipla escolha, com quatro alternativas por questão, resposta correta, tema, nível e explicação.

## Temas contemplados
- Hardware e armazenamento
- Periféricos
- Software e sistemas operacionais
- Redes
- Segurança da informação
- Manutenção
- Eletricidade e nobreak
- Ergonomia
- TI Verde
- Boas práticas profissionais

## Funcionamento
- As perguntas são embaralhadas no início de cada partida.
- O jogo percorre o banco sem repetir uma questão antes de completar a rodada.
- Ao terminar as 20 questões, uma nova sequência é embaralhada.
- O portão pausa a partida até o jogador responder.
- A alternativa correta é destacada em verde; uma alternativa incorreta escolhida é destacada em vermelho.
- Após a resposta, o jogo apresenta o gabarito e uma explicação curta.
- Resposta correta: +150 pontos e +1 aprendiz.
- Resposta incorreta: perde 1 aprendiz, conforme a regra já existente do jogo.

## Arquivos alterados
- `src/main.js`: banco de questões, embaralhamento, seleção e feedback.
- `style.css`: destaque visual para respostas corretas e incorretas.

## Observação pedagógica
As questões são introdutórias e abrangem fundamentos de informática e suporte. O banco pode ser substituído ou ampliado por questões alinhadas a uma Unidade Curricular, turma, conteúdo formativo ou plano de aula específico.

## Validação pendente
Os arquivos foram salvos e conferidos no GitHub. Ainda é necessário executar uma partida no navegador para validar o fluxo completo de pergunta, resposta, pausa e retomada, além de revisar o nível das questões com o professor.
