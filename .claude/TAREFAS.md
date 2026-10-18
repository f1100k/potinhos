# Potinhos — Lista de tarefas

Fonte: projeto **Potinhos** no Claude Design (`Potinhos.dc.html` + conversa "Melhorias de navegação e funcionalidades", 03–16/10/2026).
Link: https://claude.ai/design/p/6d296869-0354-40d0-b9d5-8a7e2e81f331

## Resumo do produto

App de tarefas gratuito, sem anúncios, para quem vive ciclos de procrastinação. A pessoa guarda tarefas em papeizinhos dentro de três potes: **Simples**, **Complexas** e **Semanal** (recorrente, com X vezes por semana). Cada dia ela escolhe o pote de acordo com a energia que tem, e o app sorteia um papelzinho. Tudo que ela conclui vai para o **pote de conquistas**.

O app não tem pontos, ranking, sequência de dias nem culpa. Também não tem conta nem backend: os dados ficam em `localStorage`, com exportação e importação por arquivo. Funciona na web e no celular, e o celular tem prioridade.

**Princípios inegociáveis**
- Nunca mostrar vermelho de alerta, contador de atraso ou notificação insistente.
- Nunca mostrar botão de "sortear de novo".
- O relatório reconhece o que foi feito, não mede desempenho. Sem gráficos, porcentagens ou comparações, e sem mostrar o que não foi feito.
- Animações lentas e orgânicas. Sons de papel baixos, que podem ser desligados.
- Tom de amiga, em português do Brasil, com frases curtas.

---

## 0. Decisões

- [x] **Stack:** React + Vite + TypeScript, como PWA instalável. CSS puro ou CSS Modules para portar os keyframes do protótipo.
- [x] **Virada da semana:** a semana fecha **domingo às 23:59, no fuso local** do aparelho. A semana vai de segunda 00:00 a domingo 23:59.
  - [x] Quando o card "Fechar a semana" aparece na home: **a partir de sexta às 18h** (ajustável em `src/domain/week.ts`). Sem sobras no Semanal, a semana fecha sozinha na virada, já que não há nada para decidir.
- [x] **Se a pessoa não fechar a semana:** nada é fechado automaticamente. A semana **fica pendente até a pessoa abrir o app**. Na próxima abertura depois da virada, ela vê a tela "Fim de semana" daquela semana, com "levar" como padrão em cada sobra. Se o app ficar várias semanas fechado, aparece um fechamento só, referente à última semana não fechada.
- [x] **Página de apoio:** **Pix** (chave copiável + QR code) e **Buy Me a Coffee** (link externo).
  - [ ] Falta: a chave Pix real, o QR code e a URL do Buy Me a Coffee.
- [x] **Arquivos de som:** escolher em bibliotecas gratuitas (ex.: freesound.org com licença CC0, Pixabay Sound Effects). Registrar a fonte e a licença de cada arquivo num `CREDITS.md`.
- [x] **Formato do arquivo de exportação:** JSON versionado, `{ version, exportedAt, tasks, achievements, settings, meta, drawn }`. Nome do arquivo: `potinhos-AAAA-MM-DD.json`.
- [x] **"Apagar tudo":** texto da confirmação (sugestão):
  - Título: "Apagar tudo mesmo?"
  - Texto: "Seus potes, pendentes e conquistas vão sumir deste aparelho, e não dá para desfazer. Se quiser guardar uma cópia, baixe seus dados antes."
  - Botões: [Baixar meus dados] [Apagar tudo] e o link "Melhor não".
  - Depois de apagar, toast: "Tudo limpinho. Quando quiser, é só começar de novo."
- [x] **Contadores no Semanal:** **não mantém.** A tela de edição deixa de mostrar "X de Y esta semana" e o fechamento deixa de mostrar "faltaram N vezes". A frequência ("2x por semana") continua aparecendo como configuração. O progresso aparece só na quantidade de papeizinhos no pote e em "semana completa".
- [ ] **Nome definitivo** ("Potinhos" é provisório) e domínio. Ideias em discussão: Potinhos, Papelzinho, Um Passinho, Pote da Vez, Dobrinha.
  - Em 17/10/2026, nenhum destes estava registrado no registro do .app: `potinhos.app`, `papelzinho.app`, `umpassinho.app`, `potedavez.app`, `dobrinha.app`. Confirmar no registrador na hora de comprar.

---

## Fase 1 — Fundação

- [x] Criar o projeto (stack definida acima), com Biome (lint + format), TypeScript estrito e scripts de dev, build e test.
- [ ] Configurar o deploy estático (Vercel, Netlify ou GitHub Pages).
  - Pronto no código: `vercel.json` e CI no GitHub Actions. Falta criar o repositório no GitHub e importar na Vercel.
- [x] **Design tokens** a partir do protótipo:
  - Fundo `#F2F6EE`, superfície `#FFFFFF` / `#FCFDFA`, borda `#CFDBC7` / `#D6E0CE`, divisória `#DCE5D5`
  - Texto `#2F3D2B`, secundário `#6E7E68`, terciário `#9DAA95`, `#55654F`
  - Acento (botões) `#D4876A`, links `#B86D52`, hover `#9A5A41`
  - Tampas: Simples `#E8BFA4`, Complexas `#C98D72`, Semanal `#9DB596`, Conquistas `#E6BB63`
  - Chips: Simples `#F7DFD0`/`#9A5A41`, Complexas `#EBD3C6`/`#7E4A36`, Semanal `#E6EEE1`/`#587553`
  - Semanal: `#EAF0E6` / `#587553` / `#D3DDCD`. Conquistas: `#FBF3E4` / `#F0E2C6` / `#E9D7B2` / `#FFF8EA` / `#9A7430` / `#C9A95C`
  - Fonte **Varela Round** (Google Fonts), com fallback `system-ui`
  - Raios: pílula 999px, cards 14–20px. Alvos de toque com pelo menos 44px.
- [x] Estilos globais e todos os keyframes do protótipo: `wobble`, `riseUp`, `unfold`, `fadeUp`, `fadeIn`, `foldPaper`, `floatToJar`, `glow`, `fallIn`, `unfoldIn`, `markIn`, `sway`.
- [x] Suporte a **movimento reduzido**: com `prefers-reduced-motion`, as animações viram um fade de 0,6s (sem toggle nas Configurações).
- [x] Roteamento ou máquina de telas: `landing`, `home`, `draw`, `task`, `done`, `notdone`, `return`, `vazio`, `weekend`, `novasemana`, `ach`, `add`, `edit`, `pending`, `settings`, `cafe`.

## Fase 2 — Modelo de dados e persistência

- [x] Tipos:
  - `Task { id, text, jar: 'simple'|'complex'|'weekly', status?: 'pending', freq?: 1..7, doneWeek?, carriedOver?, paused? }`
  - `Achievement { id, text, jar, date: 'YYYY-MM-DD' }` (até a versão 1 do schema era em português e até a 2 usava `done`, `current` e `extra`; `parseData` migra)
  - `Settings { sounds: boolean }`
  - Meta: `{ visited, weekStart / lastWeekClosed }` (a versão do schema fica só no `version` do arquivo)
- [x] Store central (Context + reducer, Zustand ou similar) com ações puras e testáveis.
- [x] Persistência em `localStorage`, com versão de schema e migração. Tratar JSON corrompido sem quebrar o app.
- [x] Regras do domínio, cada uma com teste unitário:
  - [x] `restante(t) = paused ? 0 : max(0, freq + extra − doneWeek)`
  - [x] Pool sorteável: tarefas do pote que não estão pendentes. No Semanal, só as que têm `restante > 0`.
  - [x] Contagem do pote: tamanho do pool (Simples e Complexas) ou soma dos restantes (Semanal).
  - [x] Sorteio aleatório uniforme no pool. Se o pool estiver vazio, vai para a tela de pote vazio.
  - [x] Concluir: Simples e Complexas saem da lista. No Semanal, `doneWeek + 1`. Em todos os casos, registrar a conquista com a data de hoje.
  - [x] Não consegui: devolver (mesmo pote), mover (outro pote) ou marcar como pendente (mantém o pote de origem).
  - [x] Mover de pote: zera `doneWeek` e `extra`. Ao entrar no Semanal, `freq` padrão 1.
  - [x] Fechar a semana: para cada semanal com restante, aplicar a decisão `levar` (padrão; `extra = restante`), `pendente` (cria uma cópia pendente) ou `deixar ir`. Depois, `doneWeek = 0` em todas.
  - [x] Detecção da virada da semana com base na data (ver decisões em aberto).
- [x] Primeiro uso: **estado vazio** (decidido na implementação). Os potes vazios já convidam a "Colocar uma tarefa".

## Fase 3 — Shell e navegação

- [x] Layout responsivo: até 900px, barra inferior fixa com blur e safe-area. A partir de 900px, menu lateral fixo de 224px.
- [x] Barra inferior: **Meus potes · Nova tarefa · Pendentes · Configurações**.
- [x] Menu lateral: **Meus potes · Nova tarefa · Ver e editar potes · Tarefas pendentes · Pote de conquistas · Configurações**, com o link "Me paga um café?" discreto no rodapé.
- [x] Item ativo destacado. "Meus potes" fica ativo durante todo o fluxo de sorteio.
- [x] A barra inferior fica oculta nas telas do fluxo (sorteio, tarefa, concluí, etc.).
- [x] Componente **Toast** (pílula branca acima da nav, cerca de 2,6s).
- [x] Largura de conteúdo: 520px no celular, 760px na web.

## Fase 4 — Componentes visuais

- [x] **`<Pote>`** reutilizável, com tamanho, cor da tampa, número de papeizinhos (até 9 visíveis, em posições determinísticas como em `slips()`), brilho e etiqueta opcional "esta semana" (Semanal, animação `sway`).
- [x] **`<PoteConquistas>`** na variante dourada e calorosa.
- [x] **`<Papelzinho>`** nos estados dobrado, desdobrado e card de tarefa.
- [x] Chip de pote (cores por pote).
- [x] Botões primário (pílula terracota), secundário (contorno) e link.
- [x] Segmented control (abas de Conquistas e de Editar).

## Fase 5 — Landing page ("Como funciona")

- [ ] Tela inicial do app, fora do shell (sem nav).
- [ ] Cabeçalho com "Potinhos" e CTA "Começar". Para quem já visitou, o CTA vira "Abrir meus potes".
- [ ] Hero "Um jeito gentil de fazer as coisas, um papelzinho de cada vez." com subtítulo, a nota "Gratuito. Sem anúncios." e a ilustração dos 3 potes.
- [ ] "Como funciona": 3 cards **com estilo igual** (1 escrever papeizinhos, 2 escolher pelo nível de energia, 3 pote de conquistas).
- [ ] Três pontos: "Não consegui hoje? Tudo bem.", "Nada sai do seu aparelho.", "Baseado em psicologia."
- [ ] CTA final "Um passinho de cada vez." e rodapé "Potinhos. Gratuito, sem anúncios, para sempre." com link "Me paga um café?".
- [ ] No primeiro "Começar", toast "Seus papeizinhos ficam só neste aparelho." e marcar `visited`.
- [ ] Quem já visitou abre direto em "Meus potes"? (Confirmar. No protótipo o app sempre abre na landing.)

## Fase 6 — Tela inicial (Meus potes)

- [x] Data por extenso (pt-BR), "Como está sua energia hoje?" e "Escolha um pote do jeito que você está. Sem pressa."
- [x] Três potes clicáveis com a quantidade visual de papeizinhos e a legenda "vazio / 1 papelzinho / N papeizinhos". O Semanal mostra "semana completa" quando tudo foi feito.
- [x] Link "Ver e editar os potes".
- [x] Atalho discreto "Suas conquistas" com "N papeizinhos guardados" ou "ainda vazio".
- [x] Card de fim de semana (só quando houver sobras no Semanal e a semana não estiver fechada): "A semana está acabando…" → "Fechar a semana".

## Fase 7 — Fluxo do sorteio

- [x] **Sorteio:** o pote balança (0,9s), o papel sobe (até cerca de 2,4s) e se desdobra (até cerca de 4s), depois vai para a tela da tarefa.
  - Legendas: "Deixa eu ver o que tem aqui…" → "Saiu um papelzinho." → "Olha só o que veio."
  - Nota: "Sorteado agora. Não dá para sortear de novo, e tudo bem."
- [x] **Tarefa em andamento:** "Sua tarefa de hoje", card com o texto e o chip do pote, "Tentar já conta. Um passinho de cada vez.", botões **Concluí** e **Não consegui hoje**.
- [x] Persistir a tarefa sorteada, para que um reload não permita sortear de novo. Vale até o fim do dia do sorteio.
- [x] **Concluí:** o papel se dobra, flutua até o pote de conquistas, e o pote brilha. Depois, "Olha só você!" / "Guardei esse no seu pote de conquistas." com [Voltar aos potes] [Ver conquistas].
- [x] **Não consegui hoje:** "Tudo bem, amanhã é outro dia. O que fazemos com esse papelzinho?"
  - Devolver ao pote X / Mudar para outro pote (submenu "Para qual pote?" + Voltar) / Deixar como pendente.
- [x] **Papelzinho voltando:** "Guardando com calma…", o papel dobra e cai no pote escolhido (ou em "Pendentes"). Depois volta para a home com o toast "Guardado. Sem pressa."
- [x] **Pote vazio:** "Esse pote está vazio por enquanto." com [Colocar uma tarefa] [Voltar aos potes].
  - Variante para o Semanal completo: "Semana completa. Que semana, hein?", sem o botão de adicionar.

## Fase 8 — Pote Semanal: fechamento da semana

- [x] Tela **Fim de semana**: chip "Pote Semanal", "Essa semana foi do jeito que deu." e "O que fazemos com esses?".
  - Para cada sobra: o texto (sem contador de quantas vezes faltaram) e as opções Levar para a próxima semana (padrão) / Deixar pendente / Deixar ir.
  - Botões [Fechar a semana] [Depois].
- [x] Tela **Nova semana**: "Semana fechada." e "O pote Semanal se enche de novo para a próxima.", com os papeizinhos caindo um a um (`fallIn`, 0,22s entre cada).
- [x] Convite: "Quer ver o que você fez essa semana?" → [Abrir pote de conquistas] (aba semana) [Agora não].
- [x] Virada sem fechamento: a semana fica pendente. Na primeira abertura depois de domingo 23:59, mostrar a tela "Fim de semana" antes da home. O pote só se reabastece depois que a pessoa fecha a semana. Se forem várias semanas sem abrir, fechar uma vez só.

## Fase 9 — Pote de conquistas

- [x] Cabeçalho "‹ Potes" e abas **Esta semana** (semana corrente, de segunda a domingo, como a virada; `?week=` abre uma semana específica) / **Este mês** (mês do calendário).
- [x] Ilustração do pote dourado, título "Sua semana" / "Seu mês" e "Papeizinhos guardados, um a um."
- [x] Lista de papeizinhos desdobrando um a um (`unfoldIn`, 0,35s entre cada, leve inclinação), com o texto, o chip do pote e a data ("3 de out.").
- [x] Mensagem final: "Olha tudo que você fez essa semana/esse mês, mesmo nos dias difíceis."
- [x] Estado vazio: "Aqui vão morar as coisas que você fizer."
- [x] Listas longas: performance e animação limitadas aos primeiros itens.

## Fase 10 — Gerenciar tarefas

- [x] **Nova tarefa:** "O que você quer guardar?", campo de texto, "Em qual pote?" (3 opções). Para o Semanal, "Quantas vezes por semana?" com −/+ entre 1 e 7 (padrão 2). Botão "Colocar no pote".
  - Texto vazio: toast "Escreva a tarefa primeiro, sem pressa."
  - Sucesso: toast "Papelzinho guardado no pote X." e volta para a home.
  - Enter envia. Foco automático no campo.
- [x] **Ver e editar potes:** título "Seus potes" e abas Simples/Complexas/Semanal.
  - Por item: Editar (inline + Salvar), Mover de pote (→ outros potes, com toast), Excluir.
  - No Semanal: frequência −/+ e Pausar/Retomar, sem mostrar "X de Y esta semana". Tarefa pausada fica com opacidade 0,55 e meta "pausada".
  - Estado vazio: "Esse pote está vazio por enquanto. Quando quiser, coloque algo nele."
  - [x] Excluir com desfazer (toast "Papelzinho excluído." + Desfazer).
- [x] **Pendentes:** "Coisas que ficaram esperando. Elas não têm pressa." Cards tracejados com "Retomar agora" (vai direto para a tarefa) e "→ Simples / Complexas / Semanal". Vazio: "Nada pendente por aqui."

## Fase 11 — Configurações

- [x] Toggle "Sons de papel" ("Respeitam o modo silencioso do celular"), persistido.
- [x] Seção "Seus papeizinhos": "Guardados só neste aparelho…"
  - [x] **Baixar meus dados:** gera o arquivo JSON para download.
  - [x] **Importar arquivo:** file picker, validação do schema, confirmação de juntar (acrescenta o que falta, pelo id) ou trocar tudo, mensagens gentis em caso de erro. Com o aparelho vazio, importa direto.
  - [x] **Apagar tudo:** confirmação (texto na seção 0), limpa o `localStorage` e volta ao estado inicial.
- [x] Links "Sobre o Potinhos" (→ landing) e "Me paga um café?" (card dourado discreto).
- [x] Legenda "Quando cada som toca" (4 itens).

## Fase 12 — Me paga um café?

- [ ] Tela com a ilustração da xícara (fumaça com `sway`), o texto sobre gratuidade, o QR code do Pix, a chave Pix copiável (Clipboard API + toast "Chave Pix copiada. Obrigada!"), o botão "Apoiar no Buy Me a Coffee" (link externo) e a nota "Sem valor sugerido, sem meta."
- [ ] "‹ Voltar" quando a tela é aberta pela landing.
- [ ] Trocar os placeholders pelos dados reais.

## Fase 13 — Sons

- [ ] Selecionar e otimizar os áudios (curtos, baixos, em mp3 ou ogg):
  - Sorteio: farfalhar + papel desdobrando.
  - Conclusão: papel dobrando + "toc" ao cair no pote.
  - Não consegui: só um farfalhar leve (nenhum som de erro).
  - Nova semana: papeizinhos caindo, bem baixinho.
- [ ] Serviço de áudio (Web Audio ou `HTMLAudioElement`) com pré-carregamento, volume baixo e respeito ao toggle. Só tocar depois de uma interação, por causa das políticas de autoplay.
- [ ] Sincronizar com as fases das animações.
- [ ] Checar o modo silencioso. No iOS a web não consegue detectar o silencioso diretamente, então documentar a limitação ou usar a Web Audio API, que respeita a chave.

## Fase 14 — PWA, acessibilidade e qualidade

- [ ] PWA: manifest, ícones, service worker offline e instalável no celular.
- [ ] Pedir `navigator.storage.persist()` para reduzir o risco de o navegador apagar os dados.
- [ ] Acessibilidade:
  - Rótulos ARIA nos potes ("Pote Simples, 5 papeizinhos").
  - `aria-live` nos toasts e nas legendas do sorteio.
  - Foco visível, navegação por teclado e contraste AA (checar o `#9DAA95`).
- [ ] Durante as animações, impedir toques duplos e permitir pular a animação com um toque.
- [ ] Testes: unitários do domínio (Fase 2) e E2E (Playwright) dos fluxos sortear → concluir, sortear → não consegui → mover, fechar a semana, exportar → importar.
- [ ] Testar em iOS Safari, Android Chrome e desktop. Cuidar da safe-area e do teclado virtual.
- [ ] Revisão de texto: tom acolhedor, pt-BR e nenhum texto de cobrança.
- [ ] Garantir que não há analytics nem rastreamento (requisito do produto).

## Fase 15 — Lançamento

- [ ] Domínio e deploy de produção.
- [ ] Meta tags e imagem de compartilhamento (Open Graph).
- [ ] Página ou nota curta de privacidade ("nada sai do seu aparelho"), coerente com a LGPD por não coletar dados.
- [ ] README do repositório.

---

## Ideias para depois (fora do escopo inicial)
- Variações de ilustração dos potes.
- Layout web mais rico em dois painéis.
- Lembretes opcionais e gentis (avaliar se não viram "notificação insistente").
