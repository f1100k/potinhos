# Potinhos

App de tarefas gratuito e sem anúncios para quem vive ciclos de procrastinação. As tarefas viram papeizinhos em três potes (Simples, Complexas e Semanal). Cada dia a pessoa escolhe um pote conforme a energia que tem, e o app sorteia um papelzinho.

Não tem conta nem backend: os dados ficam no `localStorage` do navegador.

## Rodando

```sh
npm install
npm run dev
```

## Scripts

| Script | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Typecheck e build de produção em `dist/` |
| `npm test` | Testes (Vitest) |
| `npm run typecheck` | Só o TypeScript |
| `npm run check` | Lint e formatação (Biome) |
| `npm run check:fix` | Corrige o que o Biome consegue |
| `npm run knip` | Procura exports, arquivos e dependências sem uso |

## Estrutura

Segue o [bulletproof-react](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md):

```
src/
  app/          App, router e routes/ (uma rota por URL, com a tela junto)
  features/     código de uma tela só: jars/, settings/, coffee/
  components/   ui/ (genéricos), layouts/ (Shell, Toaster), jars/ (visual dos potes)
  stores/       estado (Zustand), reducer, flags de sessão e persistence/
  utils/        regras puras: datas, semana, sorteio, tarefas, conquistas
  types/        tipos do modelo
  config/       constantes do produto
  lib/          wrappers de API do navegador
  testing/      setup e helpers dos testes (os testes ficam em __tests__/ ao lado de cada módulo)
```

Os imports fluem numa direção só: compartilhado → `features/` → `app/`. O Biome garante: uma feature não importa outra feature nem `app/`; `components/`, `stores/`, `utils/`, `types/`, `config/` e `lib/` não importam `features/` nem `app/`; e tudo que não é componente fica sem React.

O código é em inglês; os textos da interface são em português.
