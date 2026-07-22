import { test, expect } from '@playwright/test';
import { uniqueEmail, registerAndLogin } from './helpers.js';

test('share button copies a post-specific link and shows a toast', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  const email = uniqueEmail('sharetest');
  await registerAndLogin(page, { email });

  // Create a text post so we have something to share.
  await page.getByText('Text').first().click().catch(() => {});
  const title = `Share verify ${Date.now()}`;
  await page.fill('input[placeholder*="itle" i]', title);
  const bodyBox = page.locator('textarea').first();
  await bodyBox.fill('verifying the share button fix');
  await page.getByRole('button', { name: /post/i }).last().click();

  await expect(page.getByText(title)).toBeVisible({ timeout: 15_000 });

  const postCard = page.locator('div', { hasText: title }).last();
  const shareBtn = page.locator('.ml-auto button').first();
  await shareBtn.click();

  await expect(page.getByText(/link copied/i)).toBeVisible({ timeout: 5_000 });

  const clip = await page.evaluate(() => navigator.clipboard.readText());
  console.log('CLIPBOARD:', clip);
  expect(clip).toMatch(/\/explore\?post=[a-zA-Z0-9]+$/);
});
