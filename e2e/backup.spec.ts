import { expect, test } from '@playwright/test';
import { addTask, openApp, WEDNESDAY } from './helpers.ts';

test('export, erase everything, then import the file back', async ({
  page,
}) => {
  await openApp(page, WEDNESDAY);
  await addTask(page, 'Lavar a louça', 'Simples');
  await page.getByRole('link', { name: 'Ajustes' }).click();

  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar meus dados' }).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toBe('potinhos-2026-10-14.json');
  const file = await download.path();

  await page.getByRole('button', { name: 'Apagar tudo' }).click();
  await page
    .getByRole('dialog', { name: 'Apagar tudo mesmo?' })
    .getByRole('button', { name: 'Apagar tudo' })
    .click();
  await expect(page.getByText(/Tudo limpinho/)).toBeVisible();

  await page.goto('/settings');
  await page.getByLabel('Arquivo para importar').setInputFiles(file);
  await expect(
    page.getByText('Pronto, seus papeizinhos chegaram.'),
  ).toBeVisible();
  await page.goto('/jars');
  await expect(
    page.getByRole('button', { name: 'Pote Simples, 1 papelzinho' }),
  ).toBeVisible();
});
