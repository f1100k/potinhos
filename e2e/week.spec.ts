import { expect, test } from '@playwright/test';
import { addTask, openApp, SATURDAY } from './helpers.ts';

test('close the week from the home card', async ({ page }) => {
  await openApp(page, SATURDAY);
  await addTask(page, 'Correr', 'Semanal');

  await page.getByRole('button', { name: 'Fechar a semana' }).click();
  await expect(
    page.getByRole('heading', { name: 'Essa semana foi do jeito que deu.' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Fechar a semana' }).click();

  await expect(
    page.getByRole('heading', { name: 'Semana fechada.' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Pular animação' }).click();
  await page.getByRole('button', { name: 'Agora não' }).click();
  await expect(
    page.getByRole('button', { name: 'Fechar a semana' }),
  ).toBeHidden();
});
