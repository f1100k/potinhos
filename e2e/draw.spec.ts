import { expect, test } from '@playwright/test';
import { addTask, openApp, WEDNESDAY } from './helpers.ts';

test.beforeEach(async ({ page }) => {
  await openApp(page, WEDNESDAY);
  await addTask(page, 'Lavar a louça', 'Simples');
  await page
    .getByRole('button', { name: 'Pote Simples, 1 papelzinho' })
    .click();
  await expect(page.getByText('Deixa eu ver o que tem aqui…')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Sua tarefa de hoje' }),
  ).toBeVisible({ timeout: 8000 });
  await expect(page.getByText('Lavar a louça')).toBeVisible();
});

test('draw, then finish the task', async ({ page }) => {
  await page.getByRole('button', { name: 'Concluí' }).click();
  await expect(page.getByText('Olha só você!')).toBeVisible({ timeout: 8000 });
  await page.getByRole('button', { name: 'Ver conquistas' }).click();
  await expect(page.getByText('Lavar a louça')).toBeVisible();
});

test('draw, could not do it today, move it to another jar', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Não consegui hoje' }).click();
  await page.getByRole('button', { name: /Mudar para outro pote/ }).click();
  await page.getByRole('button', { name: 'Complexas' }).click();
  await expect(page.getByText('Guardado. Sem pressa.')).toBeVisible({
    timeout: 8000,
  });
  await expect(
    page.getByRole('button', { name: 'Pote Complexas, 1 papelzinho' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Pote Simples, vazio' }),
  ).toBeVisible();
});
