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

```
src/
  domain/       regras e tipos, sem React
    persistence/  validação, migração e localStorage
  app/          router, layout, estado (Zustand) e regras de navegação
  components/   componentes visuais reutilizáveis
  routes/       uma rota por URL, com a tela junto
  test/         setup e helpers dos testes
```

O Biome garante as camadas: `domain/` não importa de `app/`, `components/` nem `routes/`, e `components/` não importa de `app/` nem `routes/`.

O código é em inglês; os textos da interface são em português.
