import { expect, type Page } from '@playwright/test';

export const WEDNESDAY = new Date('2026-10-14T10:00:00-03:00');
export const SATURDAY = new Date('2026-10-17T10:00:00-03:00');

/** Opens the app at `now`, already past the landing page. */
export async function openApp(page: Page, now: Date) {
  await page.clock.setFixedTime(now);
  await page.goto('/');
  await page.getByRole('button', { name: 'Começar' }).first().click();
  await expect(
    page.getByRole('heading', { name: 'Como está sua energia hoje?' }),
  ).toBeVisible();
}

export async function addTask(
  page: Page,
  text: string,
  jar: 'Simples' | 'Complexas' | 'Semanal',
) {
  await page.getByRole('link', { name: 'Nova', exact: true }).click();
  await page
    .getByRole('textbox', { name: 'O que você quer guardar?' })
    .fill(text);
  await page.getByRole('button', { name: jar, exact: true }).click();
  await page.getByRole('button', { name: 'Colocar no pote' }).click();
  await expect(
    page.getByRole('heading', { name: 'Como está sua energia hoje?' }),
  ).toBeVisible();
}
