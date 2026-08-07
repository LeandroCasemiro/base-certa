# Base Certa — Documentação do Projeto

> App educativo de matemática desenvolvido como ferramenta do ecossistema Pai MOVIDO.
> Criado por Leandro Casemiro — professor de matemática com 17 anos de experiência na rede estadual do Rio de Janeiro.

---

## 1. Contexto e Problema

### Por que esse app existe

Muitos alunos chegam às séries finais do fundamental e até ao ensino médio sem dominar operações básicas e tabuada. Essa defasagem trava toda a matemática posterior e gera desânimo, vergonha e dificuldade acumulada.

A escola sozinha não resolve — e é exatamente aí que o Pai MOVIDO atua: ajudando pais a assumirem a formação dos filhos dentro de casa.

O **Base Certa** é uma ferramenta prática para que alunos possam praticar matemática de forma leve, rápida e sem a pressão de uma prova escolar.

### Público-alvo

- Alunos do fundamental 2 e início do ensino médio
- Alunos com defasagem de base matemática
- Filhos de pais que acompanham o Pai MOVIDO

---

## 2. Decisões de Produto (antes de codar)

Todas as decisões abaixo foram tomadas antes do desenvolvimento, com base em critérios pedagógicos e de experiência de produto.

### Nome

Foram considerados: Tabuada Game, Conta Rápida, MatQuiz, Conta Comigo, Tabuada MOVIDO.

**Escolha final: Base Certa**
- Remete diretamente ao problema que resolve (falta de base matemática)
- Funciona sozinho e dentro do ecossistema Pai MOVIDO
- URL limpa: `basecerta.vercel.app`

### Modos de jogo

| # | Modo | Grupo |
|---|---|---|
| 1 | Adição | Operações Básicas |
| 2 | Subtração | Operações Básicas |
| 3 | Multiplicação | Operações Básicas |
| 4 | Divisão | Operações Básicas |
| 5 | Tabuada | Operações Básicas |
| 6 | Adição com Inteiros | Números Inteiros |
| 7 | Subtração com Inteiros | Números Inteiros |
| 8 | Multiplicação com Inteiros | Números Inteiros |
| 9 | Divisão com Inteiros | Números Inteiros |

### Tabuada — sub-fluxo de configuração (adicionado em 07/08/2026)

Ao escolher "Tabuada" na Home, o aluno passa por uma tela extra (`TabuadaSetupScreen`) antes da tela de nível:

1. **Qual tabuada?** — "Todas as tabuadas" (padrão, comportamento original: `a × b` aleatórios dentro da faixa do nível) ou um número específico de 1 a 12.
2. **Como treinar** (só aparece se escolheu um número específico `N`):
   - **Só multiplicação** — igual à tabuada tradicional, travada no número `N` (`N × b` ou `b × N`).
   - **Família completa (+, −, × e ÷)** — sorteia um parceiro `b` (mesma faixa por nível da tabuada) e monta a "família de fatos" de `N` e `b`: soma, subtração, multiplicação e divisão, todas envolvendo `N`. A explicação de toda questão amarra de volta à multiplicação (`"Isso vem da tabuada do N: N × b = produto."`), mesmo nas perguntas de soma/subtração/divisão.

O placar de melhor pontuação é isolado por variante (ex: "Tabuada do 7 · Família completa" tem seu próprio recorde por nível, separado de "Todas as tabuadas").

### Níveis de dificuldade

| Nível | Label | Descrição |
|---|---|---|
| beginner | Iniciante | Números pequenos, sem pressão |
| intermediate | Desafiador | Números maiores, bom treino |
| expert | Expert | Números grandes, máximo desafio |

### Faixas numéricas por nível

| Modo | Iniciante | Desafiador | Expert |
|---|---|---|---|
| Adição | 1–10 + 1–10 | 1–20 + 1–20 | 1–50 + 1–50 |
| Subtração | até 15, positivo | até 30, positivo | até 100, positivo |
| Multiplicação | 2–5 × 2–5 | 2–12 × 2–9 | 2–15 × 2–12 |
| Divisão | quoc. 1–5, div. 2–5 | quoc. 1–10, div. 2–10 | quoc. 1–20, div. 2–12 |
| Tabuada | número × 1–10 | número × 11–100 | número × 101–999 |
| Inteiros (+/−) | −5 a 5 | −10 a 10 | −20 a 20 |
| Inteiros (×/÷) | −5 a 5 (excl. 0) | −10 a 10 (excl. 0) | −20 a 20 (excl. 0) |

> Correção 07/08/2026: esta tabela dizia ±15 no Expert de Inteiros ×/÷, mas o código sempre usou a mesma `getIntRange()` dos outros 3 modos de inteiros (±20). A tabela estava desatualizada, não o código — nenhuma faixa numérica mudou nesta revisão.

### Tabuada — o nível escala o multiplicador, não o produto (corrigido em 07/08/2026)

Uma primeira versão desta correção tentou definir o nível pelo tamanho do **produto** (resultado ≤10 / ≤100 / >100). Isso quebra pra qualquer tabuada pequena escolhida — a tabuada do 6, por exemplo, nunca passa de 6×12=72, então nunca teria Expert. A versão correta escala o **segundo fator** ("o número escolhido vezes X"), não o produto:

- **Iniciante:** número escolhido × 1 a 10 (a tabuada clássica: `6 × 1` até `6 × 10`)
- **Desafiador:** número escolhido × 11 a 100 (ex: `6 × 67`)
- **Expert:** número escolhido × 101 a 999 (ex: `6 × 128`) — o teto de 999 foi uma escolha (não veio de pedido explícito), pra manter 3 dígitos em vez de números arbitrariamente grandes

Vale tanto pra "Todas as tabuadas" (o primeiro fator sorteia 1–12, representando qual tabuada) quanto pra tabuada de número específico (o primeiro fator é o número escolhido pelo aluno). Implementado em `getTabuadaRange()` no `gameEngine.ts`.

### Por que os níveis mais altos são mais difíceis (revisado em 07/08/2026)

Faixas numéricas maiores por si só não garantem mais dificuldade em um jogo de múltipla escolha — dá pra "chutar por estimativa" mesmo com números grandes se as alternativas erradas estiverem longe da certa. Por isso, além da faixa numérica, cada questão escolhe as alternativas erradas com um "erro plausível" (ex: `7 × 9` errado como `7 × 8` ou `6 × 9`, `48 + 10` errado como `59` ou `57`) — a proporção de alternativas plausíveis vs. genéricas cresce por nível:

| Nível | Alternativas "erro plausível" (das 3 erradas) |
|---|---|
| Iniciante | 1 |
| Desafiador | 2 |
| Expert | 3 |

No Expert, as 3 alternativas erradas são sempre erros plausíveis — exige cálculo/memória real, não estimativa. Em Números Inteiros, o erro mais comum (inverter o sinal) é sempre priorizado como uma das alternativas. Implementado em `pickOptions()` / `getConfusableCount()` no `gameEngine.ts`.

**Mesmo algarismo da unidade — só no Expert (adicionado em 07/08/2026, ajustado no mesmo dia):** no Expert, as 4 alternativas (a certa + as 3 erradas) sempre terminam no mesmo algarismo da unidade (ex: certa `17`, erradas `37`, `27`, `7` — todas terminam em 7). Sem isso dava pra eliminar alternativas só olhando o último dígito, sem calcular nada. Prioriza candidatos de "erro plausível" que já batem essa unidade por coincidência; só completa com `correto ± múltiplo de 10` quando falta. Em modos não-inteiros (`basic-*`, Tabuada), nunca deixa esse `±10k` cair em número negativo — troca de direção quando um lado ficaria negativo, garantindo sempre 3 distratores positivos distintos. Implementado em `sameUnitsDigitDistractors()`, chamado dentro do próprio `pickOptions()` quando `confusableCount >= 3`. No Iniciante e no Desafiador não entra — lá o objetivo ainda é deixar eliminar por estimativa/cálculo parcial.

### Regras do jogo

- 10 perguntas por rodada
- 4 alternativas por questão (1 correta)
- Feedback imediato: acerto = verde, erro = vermelho + mostra a resposta correta em verde
- Ao errar: caixa amarela com explicação pedagógica usando os números reais da questão
- Avanço manual (botão "Próxima") — dá tempo de assimilar o erro
- Histórico salvo por modo + nível no LocalStorage

### Decisões descartadas (não incluir no MVP)

Login, banco de dados, cadastro, ranking online, painel de pais/professor, sons, animações complexas, moedas, avatares.

---

## 3. Stack Técnica

| Tecnologia | Função |
|---|---|
| Next.js 16 (App Router) | Framework principal |
| TypeScript | Tipagem estática |
| Tailwind CSS | Estilização |
| LocalStorage | Persistência do histórico |
| Vercel | Hospedagem e deploy |
| GitHub | Controle de versão |

---

## 4. Arquitetura do Projeto

```
base-certa/
├── src/
│   ├── app/
│   │   ├── layout.tsx        — HTML shell, metadata
│   │   ├── globals.css       — Tailwind base
│   │   └── page.tsx          — Orquestrador de telas (estado global)
│   │
│   ├── components/
│   │   ├── HomeScreen.tsx    — Tela inicial com os 9 modos
│   │   ├── TabuadaSetupScreen.tsx — Escolha de tabuada específica + família de operações (só no modo Tabuada)
│   │   ├── DifficultyScreen.tsx — Seleção de nível + melhor pontuação (aceita título/variante customizados)
│   │   ├── GameScreen.tsx    — Pergunta, alternativas, feedback, explicação
│   │   ├── ResultScreen.tsx  — Resultado final com acertos/erros (aceita título/variante customizados)
│   │   ├── OptionButton.tsx  — Botão de alternativa com estados visuais
│   │   └── ProgressBar.tsx   — Barra de progresso da rodada
│   │
│   ├── hooks/
│   │   └── useGameSession.ts — Toda a lógica de estado da sessão de jogo
│   │
│   └── lib/
│       ├── types.ts          — Interfaces TypeScript
│       ├── constants.ts      — Modos, níveis e configurações
│       ├── gameEngine.ts     — Geração de questões e explicações
│       └── storage.ts        — LocalStorage (salvar/ler histórico)
```

### Fluxo de telas

```
Home → (clica modo) ────────────────────────────┐
         │                                       ↓
         │ (modo = Tabuada)          DifficultyScreen → (clica nível) → GameScreen → ResultScreen
         ↓                                       ↑                                       ↓
   TabuadaSetupScreen ──(Continuar)───────────────┘                          Jogar novamente → GameScreen
         ↑                                                                   Voltar ao início → Home
         └── Voltar (da DifficultyScreen, só quando o modo é Tabuada)
```

### Como funciona a geração de questões

O `gameEngine.ts` gera questões dinamicamente para cada modo e nível. Para cada questão:

1. Gera os operandos aleatoriamente dentro da faixa do nível (ou, no modo Tabuada com número específico, sorteia o parceiro `b` e monta a família de fatos — ver `generateFocusedTabuadaQuestion()`)
2. Calcula a resposta correta
3. Monta uma lista de candidatos "erro plausível" por operação (`buildAddConfusable`, `buildSubConfusable`, `buildMulConfusable`, `buildDivConfusable`; em Inteiros, `withSignFlip` prioriza a inversão de sinal)
4. `pickOptions()` escolhe quantos desses candidatos usar conforme o nível (`getConfusableCount`: 1 / 2 / 3) e completa o restante com alternativas genéricas próximas, depois embaralha as 4 opções (Fisher-Yates)
5. Cria a explicação com os números reais da questão
6. Garante 10 questões únicas por rodada (sem repetição de texto)

### Explicações pedagógicas por modo

| Modo | Exemplo de explicação |
|---|---|
| Adição básica | "Some 7 com 8: 7 + 8 = 15." |
| Subtração básica | "Retire 4 de 13: 13 − 4 = 9." |
| Multiplicação | "3 grupos de 7: 3 × 7 = 21. Lembre: 7 × 3 também vale 21." |
| Divisão | "6 × 7 = 42, então 42 ÷ 6 = 7." |
| Tabuada | "Tabuada do 8: 8 × 9 = 72. Grave este resultado!" |
| Inteiros — adição | Regra de sinais com os valores reais |
| Inteiros — subtração | "Subtrair (−5) é somar 5: ..." |
| Inteiros — multiplicação | "Sinais iguais → positivo / Sinais diferentes → negativo" |
| Inteiros — divisão | Regra de sinais + verificação pela multiplicação inversa |

---

## 5. Componentes em Detalhe

### `page.tsx` — Orquestrador
Controla qual tela está ativa (`home`, `tabuada-setup`, `difficulty`, `game`, `result`). Guarda o `tabuadaConfig` (número específico + família de operações, quando aplicável) e monta o título/variante customizados que descem para `DifficultyScreen`/`ResultScreen`. Passa callbacks para os componentes filhos. Não contém lógica de jogo.

### `TabuadaSetupScreen.tsx` — Configuração da Tabuada
Só aparece quando o modo escolhido é Tabuada. Deixa escolher "Todas as tabuadas" ou um número de 1 a 12, e — só quando um número é escolhido — "Só multiplicação" ou "Família completa". Devolve um `TabuadaConfig` para o `page.tsx` via `onContinue`.

### `useGameSession.ts` — Hook central
Toda a lógica de uma partida:
- `startGame(mode, level, tabuadaConfig?)` — gera as questões e inicializa o estado
- `selectOption(value)` — registra a resposta e aciona o feedback
- `nextQuestion()` — avança para a próxima questão ou finaliza
- `resetGame()` — volta ao estado inicial
- Usa `useRef` para score, mode e variante — evita problemas de closure stale em callbacks

### `gameEngine.ts` — Motor de questões
Funções puras, sem estado. Recebe modo + nível (+ `tabuadaConfig` opcional) e retorna array de 10 questões únicas com texto, opções, resposta correta e explicação. Ver "Como funciona a geração de questões" acima para o sistema de alternativas plausíveis.

### `storage.ts` — Persistência
Salva e lê histórico no LocalStorage. Chave composta `modo__nível` (ou `modo__nível__variante` para tabuadas específicas, via `tabuadaVariantKey()`) para separar os recordes. Protegido com `try/catch` para não quebrar em modo privado ou storage cheio.

---

## 6. Deploy

### Repositório
- GitHub: `https://github.com/LeandroCasemiro/base-certa`
- Branch principal: `main`

### Hospedagem
- Plataforma: Vercel (plano Hobby — gratuito)
- Deploy automático a cada push na branch `main`

### Para atualizar o app após mudanças

```bash
cd "D:/1. PROJETOS/APPS/base-certa"
git add .
git commit -m "descrição do que foi alterado"
git push
```

> A pasta mudou em 07/08/2026 (de `CLAUDE CODE/IMERSAO COM TATA/base-certa` para `APPS/base-certa`) — sem efeito no repo Git nem na Vercel.
>
> Em 07/08/2026 o repositório também migrou de `casemiroya/base-certa` para `LeandroCasemiro/base-certa` (a conta antiga não tinha permissão de push) e o projeto na Vercel foi reconectado ao repositório novo via `vercel git connect`. Este parágrafo foi adicionado por um push de teste pra confirmar que o deploy automático continua funcionando após a migração.

A Vercel detecta o push e faz o novo deploy automaticamente em ~1 minuto.

---

## 7. Próximos Passos Sugeridos

### Curto prazo
- [ ] Revisar as explicações pedagógicas dos inteiros com olhar de professor
- [ ] Testar com a Yasmin e coletar feedback real de uso
- [x] ~~Ajustar faixas numéricas se algum nível estiver fácil ou difícil demais~~ — resolvido em 07/08/2026, mas não mexendo nas faixas: o problema real era a distância das alternativas erradas (ver "Por que os níveis mais altos são mais difíceis" acima)

### Médio prazo
- [ ] Adicionar sons simples (acerto/erro) — melhora a experiência lúdica
- [ ] Tela de histórico — o aluno vê sua evolução ao longo do tempo
- [ ] Modo contrarrelógio — adiciona pressão controlada para alunos mais avançados

### Longo prazo
- [ ] Login simples (Google) para salvar histórico na nuvem
- [ ] Painel do pai/professor para acompanhar o desempenho
- [ ] Integração como bônus ou ferramenta dentro do programa Pai MOVIDO

---

## 8. Observações Importantes

- As explicações pedagógicas para **Números Inteiros** foram geradas automaticamente. Recomenda-se revisão com olhar de professor antes de usar com alunos em contexto formal.
- O app funciona 100% no navegador, sem instalação. Qualquer dispositivo com internet acessa pelo link da Vercel.
- Todo o histórico fica salvo no dispositivo do aluno (LocalStorage). Se o aluno trocar de dispositivo ou limpar o cache, o histórico é perdido — isso só muda com login + banco de dados.

---

*Documento gerado em 22/03/2026 — Base Certa v1.0*
*Atualizado em 07/08/2026 — v1.1: seleção de tabuada específica, família de operações (+, −, ×, ÷) focada em um número, e alternativas erradas com dificuldade progressiva por nível*
*Atualizado em 07/08/2026 — v1.2: corrige o critério de nível da Tabuada — escala o multiplicador (1–10 / 11–100 / 101–999), não o produto, pra funcionar em qualquer tabuada escolhida*
