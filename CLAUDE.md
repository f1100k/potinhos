# Potinhos — regras do projeto

Converse com o usuário em português. O plano do produto está em [.claude/TAREFAS.md](.claude/TAREFAS.md) e o histórico de setup em [.claude/FASE-1.md](.claude/FASE-1.md).

## Idioma

- Todo o código é em inglês: identificadores, nomes de arquivo, URLs e parâmetros de busca, valores salvos no localStorage, tokens do CSS, mensagens de erro, descrições dos testes (`describe`/`it`) e comentários.
- Só o texto que o usuário vê é em português: labels, títulos, `aria-label`, mensagens de toast. Textos de exemplo nos testes (como "Lavar a louça") também podem ser em português.
- Nomes do domínio: pote = `jar` (`simple`, `complex`, `weekly`), papelzinho = slip, conquista = `achievement`, pendente = `pending`, sorteio = `draw`.

## Comentários

- Só comente o que o código não consegue dizer: um porquê não óbvio, uma restrição externa, um formato legado. Na dúvida, não comente.
- Prefira um nome melhor a um comentário (ex.: `lenientListOf` em vez de `listOf` + comentário).
- Nada de comentários de seção ("/* Texto */"), nem JSDoc que repete a assinatura.

## Nomes

- Nomes descritivos para arquivos, funções e variáveis. Uma letra só em lambdas curtas (`(t) => t.id`).
- Não sombreie nomes (por isso os schemas do Zod levam o sufixo `Schema`).
- Arquivos que não são componentes vão em camelCase (`store.ts`, `searchParams.ts`). Componentes em PascalCase.

## Organização

- Um arquivo, uma responsabilidade. Cada módulo tem o seu `*.test.ts` com o mesmo nome, numa pasta `__tests__/` ao lado (`utils/dates.ts` → `utils/__tests__/dates.test.ts`).
- A estrutura segue o [bulletproof-react](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md). O fluxo de imports é só numa direção: compartilhado → `features/` → `app/`. O Biome barra violações com `noRestrictedImports`.
  - `src/app/`: `App.tsx`, `router.tsx`, `app.css` e `routes/` (uma rota por arquivo, com a tela junto). Só aqui se compõem features e código compartilhado.
  - `src/features/<nome>/`: código de uma tela só, nas subpastas que precisar (`hooks/`, `utils/`, `components/`). Uma feature não importa outra feature nem `app/`. Hoje: `jars`, `settings`, `coffee`.
  - Compartilhado (não importa `features/` nem `app/`):
    - `src/components/`: `ui/` (genéricos), `layouts/` (Shell, Toaster), `jars/` (visual dos potes, usado por várias telas).
    - `src/stores/`: `appData.ts` (Zustand), `appReducer.ts`, `session.ts` (flags de uma sessão) e `persistence/` (`migrate.ts`, `schema.ts`, `storage.ts`).
    - `src/utils/`: regras puras (datas, semana, sorteio, tarefas, conquistas, labels).
    - `src/types/model.ts`: tipos do modelo, incluindo `AppAction`.
    - `src/config/`: constantes do produto (Pix, links).
    - `src/lib/`: wrappers de API do navegador.
    - `src/testing/`: setup e helpers dos testes.
  - `config/`, `lib/`, `stores/`, `types/` e `utils/` não importam React, TanStack nem `components/`.
- Sem barrel files (`index.ts` reexportando): importe o arquivo direto.
- Tipos internos de um módulo ficam no próprio módulo, sem `export`.
- Só exporte o que é usado fora do arquivo. O knip (`npm run knip`) aponta exports sem uso. API já planejada para as próximas fases leva `/** @public */`.
- Código usado por uma tela só vai em `features/`; quando uma segunda tela precisar dele, sobe para a pasta compartilhada correspondente.

## Domínio

- O reducer (`src/stores/appReducer.ts`) é puro: datas e ids chegam pela ação (`now: Date`, `ids`), nunca de `new Date()` ou `crypto` lá dentro.
- Quando uma ação não muda nada, o reducer devolve o mesmo objeto `data` (evita redesenho e gravação).
- Regras do produto ficam em `utils/`, `stores/` ou `features/*/utils/`, não só na interface (ex.: concluir só vale para o sorteio do dia).
- Estado que dura só uma sessão (flags de "já abriu", "fluxo liberado") fica em `src/stores/session.ts`, com `resetSession()` para os testes.

## Formato salvo

- Mudou o formato do que vai para o localStorage? Acrescente uma função em `MIGRATIONS` (`src/stores/persistence/migrate.ts`). `SCHEMA_VERSION` é `MIGRATIONS.length` e sobe sozinho.
- Os schemas de `schema.ts` descrevem só o formato atual; toda compatibilidade com formatos antigos fica na migração.
- Toda migração nova ganha um teste em `stores/persistence/__tests__/schema.test.ts` com um arquivo da versão anterior.

## Rotas

- `src/app/routeTree.gen.ts` é gerado pelo plugin do TanStack Router. Não edite à mão.
- Com o dev server rodando, o plugin reescreve arquivos de rota ao criar ou renomear, e já trocou uma tela inteira pelo esqueleto padrão ("Hello /_app/..."). Depois de mexer em rotas, procure `RouteComponent` ou `Hello "` em `src/app/routes/`.
- Cada rota tem um teste em `src/app/__tests__/App.test.tsx` que confere o título.

## Antes de dizer que terminou

Rode, nesta ordem, e só conclua com tudo verde:

```sh
npm run typecheck && npm run check:fix && npm run check && npm run knip && npm test && npm run build
```

## Git

- Commit e push só quando o usuário pedir. O fluxo do projeto é commitar direto no `master`.
- Mensagens em português, no formato conventional commits: `refactor(escopo): descrição curta`, corpo explicando o porquê.
- Não inclua `.tanstack/` nem arquivos gerados que estejam no `.gitignore`.

## Como trabalhar com o usuário

- Quando pedirem melhorias, primeiro liste sugestões numeradas, da mais útil para a menos, com o motivo de cada uma e o que você não mudaria. Aplique depois que o usuário escolher.
- Sugestões de bibliotecas são bem-vindas quando o ganho é grande; diga o custo (dependência, tamanho).
- Pergunte só quando a decisão é do usuário e muda o resultado (ex.: formato salvo, URLs). Para o resto, siga o padrão do projeto.
