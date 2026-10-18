# Fase 1 — Fundação

Guia passo a passo da Fase 1 do [TAREFAS.md](TAREFAS.md). Faça uma etapa de cada vez e marque o checkbox quando o critério de "Pronto quando" estiver ok.

Ambiente conferido em 17/10/2026: Node 24.21, npm 11.19, Git 2.56, Windows (PowerShell).

**Ao final da fase:** projeto React + Vite + TypeScript estrito rodando, com lint, format e testes; deploy automático no ar; design tokens, estilos globais, keyframes e movimento reduzido prontos; e uma máquina de telas navegando entre telas vazias.

---

## Etapa 1 — Criar o projeto com Vite

- [x] Concluída

Na pasta `C:\projects\potinhos` (que já tem o `TAREFAS.md`):

```powershell
npm create vite@latest . -- --template react-ts
```

- Se perguntar sobre a pasta não estar vazia, escolha **"Ignore files and continue"** (não escolha a opção de apagar, senão o `TAREFAS.md` some).
- Se perguntar se quer instalar e iniciar agora, pode dizer **sim**. Se disser não, rode:

```powershell
npm install
npm run dev
```

**Pronto quando:** abrir o endereço que aparece no terminal (normalmente `http://localhost:5173`) mostra a página padrão do Vite + React, e o `TAREFAS.md` e o `FASE-1.md` continuam na pasta.

---

## Etapa 2 — Git e primeiro commit

- [x] Concluída

```powershell
git init
git add .
git commit -m "Cria projeto com Vite + React + TypeScript"
```

O template já traz um `.gitignore` com `node_modules` e `dist`.

**Pronto quando:** `git status` mostra "nothing to commit, working tree clean".

---

## Etapa 3 — TypeScript mais estrito

- [x] Concluída

O template já vem com `"strict": true` no `tsconfig.app.json`. Vamos acrescentar algumas regras que pegam erros comuns:

```jsonc
// tsconfig.app.json → dentro de "compilerOptions"
"noUncheckedIndexedAccess": true,
"noImplicitOverride": true,
"exactOptionalPropertyTypes": true
```

E um script para checar tipos sem gerar build, no `package.json`:

```jsonc
"typecheck": "tsc -b --noEmit"
```

**Pronto quando:** `npm run typecheck` termina sem erros.

---

## Etapa 4 — Biome (lint + formatação)

- [x] Concluída

O Biome faz o trabalho do ESLint e do Prettier numa ferramenta só, mais rápida e com um arquivo de configuração só.

1. Remover o ESLint que vem no template:

```powershell
npm uninstall eslint @eslint/js eslint-plugin-react-hooks eslint-plugin-react-refresh globals typescript-eslint
Remove-Item eslint.config.js
```

(Se o `npm uninstall` reclamar de algum pacote que não existe, tudo bem: confira os nomes em `devDependencies` no `package.json`.)

2. Instalar o Biome com versão fixa e criar a configuração:

```powershell
npm install -D -E @biomejs/biome
npx @biomejs/biome init
```

3. Ajustar o `biome.json`: indentação de 2 espaços, aspas simples, ignorar `dist`, e ligar o domínio de regras do React. (Detalhes quando chegarmos aqui.)

4. Scripts no `package.json` (trocar o `lint` do template):

```jsonc
"lint": "biome lint .",
"format": "biome format --write .",
"check": "biome check .",
"check:fix": "biome check --write ."
```

5. Opcional: instalar a extensão **Biome** no VS Code e definir como formatador padrão, com "format on save".

**Pronto quando:** não existe mais `eslint.config.js` nem pacotes de ESLint, `npm run check:fix` formata tudo e `npm run check` passa sem erros.

---

## Etapa 5 — Testes com Vitest

- [x] Concluída

```powershell
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Configurar o Vitest no `vite.config.ts`, criar um arquivo de setup e um teste de exemplo, e adicionar os scripts `test` e `test:watch`.

**Pronto quando:** `npm test` roda e o teste de exemplo passa.

**Scripts esperados no fim desta etapa:** `dev`, `build`, `preview`, `typecheck`, `lint`, `format`, `check`, `check:fix`, `test`, `test:watch`.

---

## Etapa 6 — Limpar o template e organizar pastas

- [x] Concluída

Remover o conteúdo de demonstração (logos, contador, CSS do template) e criar a estrutura:

```
src/
  app/          # App, router, layout, regra do fluxo, estado (Zustand) e app.css
  routes/       # uma rota por URL, com a tela junto (gera routeTree.gen.ts)
  components/   # componentes visuais reutilizáveis (Toast, Fase 4)
  domain/       # regras e tipos, sem React (Fase 2)
  test/         # setup e helpers dos testes
  main.tsx
```

**Pronto quando:** a página mostra só um texto simples ("Potinhos"), e `typecheck`, `check` e `test` passam. Fazer commit.

---

## Etapa 7 — Repositório no GitHub e deploy

- [ ] Concluída (falta só conectar: `vercel.json` e o CI já estão no repositório)

**Recomendação: Vercel**, conectado ao GitHub. Ele detecta o Vite sozinho, publica cada push na `main` e gera uma prévia para cada branch. O Netlify funciona igual; o GitHub Pages exige configurar o `base` do Vite e um workflow, então dá mais trabalho.

1. Criar um repositório (pode ser privado) no GitHub e enviar o código.
2. Em vercel.com, "Add New → Project", importar o repositório e aceitar o preset **Vite** (build `npm run build`, saída `dist`).

**Pronto quando:** a URL `*.vercel.app` abre a página "Potinhos" e um novo push atualiza o site.

---

## Etapa 8 — Design tokens

- [x] Concluída

Criar `src/styles/tokens.css` com variáveis CSS no `:root`, a partir das cores do TAREFAS.md: fundo, superfícies, bordas, textos, acento, tampas, chips, Semanal e Conquistas. Também os raios (pílula 999px, cards 14–20px) e o alvo de toque mínimo (44px).

Nomes pensados pelo papel, não pela cor. Exemplo: `--color-bg`, `--color-text-secondary`, `--color-lid-simples`, `--radius-pill`.

**Pronto quando:** todas as cores da lista estão no arquivo e uma página de teste usa algumas delas.

---

## Etapa 9 — Fonte Varela Round

- [x] Concluída

Carregar pelo Google Fonts no `index.html` (com `preconnect`) e definir no tokens: `--font-base: "Varela Round", system-ui, sans-serif;`. Ajustar também `<html lang="pt-BR">` e o `<title>`.

**Pronto quando:** o texto da página aparece na Varela Round (conferir no DevTools → Computed → font-family).

---

## Etapa 10 — Estilos globais e keyframes

- [x] Concluída

- `src/styles/global.css`: reset leve, `box-sizing`, fundo e cor de texto pelos tokens, fonte, foco visível, `-webkit-tap-highlight-color`, botões sem estilo padrão.
- `src/styles/animations.css`: os 12 keyframes do protótipo — `wobble`, `riseUp`, `unfold`, `fadeUp`, `fadeIn`, `foldPaper`, `floatToJar`, `glow`, `fallIn`, `unfoldIn`, `markIn`, `sway`.

Os keyframes serão copiados do `Potinhos.dc.html` no Claude Design, para ficarem idênticos ao protótipo.

**Pronto quando:** os três CSS são importados no `main.tsx` e uma página de teste mostra cada animação funcionando.

---

## Etapa 11 — Movimento reduzido

- [x] Concluída

Com `@media (prefers-reduced-motion: reduce)`, toda animação vira um fade de 0,6s. Sem toggle nas Configurações.

**Pronto quando:** no DevTools (Rendering → "Emulate CSS prefers-reduced-motion: reduce") as animações viram só fade.

---

## Etapa 12 — Máquina de telas

- [x] Concluída

As 16 telas: `landing`, `home`, `draw`, `task`, `done`, `notdone`, `return`, `vazio`, `weekend`, `novasemana`, `ach`, `add`, `edit`, `pending`, `settings`, `cafe`.

**Recomendação:** uma máquina de telas tipada (um `type Screen = ...` com `useReducer`), igual ao protótipo, em vez de rotas por URL. O fluxo de sorteio não pode ser revisitado nem "voltado" pelo navegador, e o app não precisa de links profundos. O botão voltar do Android pode ser tratado depois com a History API, se quisermos.

**Revisto em 17/10/2026:** trocamos a máquina de telas pelo **TanStack Router** (`src/app/router.tsx`), com rotas por URL em português. Assim o voltar do navegador e do celular funciona, e recarregar mantém a tela. O fluxo do sorteio continua protegido: as telas dele moram em `/potes/...`, dentro da rota sem caminho `fluxo`, e só abrem por `useIrNoFluxo()` (`src/app/fluxo.ts`). Recarregar ou voltar até uma delas leva para `/potes`, e dentro do fluxo a navegação troca a entrada do histórico em vez de empilhar. A Vercel reescreve todo caminho para `index.html`.

Cada tela começa como um componente vazio com o próprio nome. Uma barra de navegação temporária, só em desenvolvimento, permite pular entre elas.

**Pronto quando:** dá para navegar pelas 16 telas, o TypeScript reclama de nome de tela inválido, e existe um teste da transição de telas. Fazer commit e conferir o deploy.

---

## Fim da Fase 1

- [ ] Todas as etapas concluídas
- [x] Marcar a Fase 1 no `TAREFAS.md`
