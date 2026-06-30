import { test, expect } from '@playwright/test';
import { uniqueEmail, registerAndLogin } from './helpers.js';

// Regression coverage for the mobile navbar overflow bug: the navbar used
// to be 580px of content squeezed into a 390px viewport, pushing Messages,
// Friends, Notifications, Avatar, and Logout completely off-screen with no
// way to reach them. Fixed with a hamburger drawer below the lg breakpoint.
test.describe('Mobile navbar', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('does not overflow the viewport', async ({ page }) => {
    const email = uniqueEmail('navtest');
    await registerAndLogin(page, { email });

    const nav = page.locator('nav').first();
    const scrollWidth = await nav.evaluate((el) => el.scrollWidth);
    const clientWidth = await nav.evaluate((el) => el.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test('exposes Messages, Friends, Notifications, and Logout via the hamburger drawer', async ({ page }) => {
    const email = uniqueEmail('drawertest');
    await registerAndLogin(page, { email });

    await page.click('button[title=Menu]');
    await expect(page.getByRole('link', { name: 'Messages' })).toBeVisible();
    await expect(page.getByText('Friends', { exact: true })).toBeVisible();
    await expect(page.getByText('Notifications', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();
  });

  test('closes the drawer and navigates when a nav link is clicked', async ({ page }) => {
    const email = uniqueEmail('navlink');
    await registerAndLogin(page, { email });

    await page.click('button[title=Menu]');
    await page.getByRole('link', { name: 'Collab' }).click();
    await expect(page).toHaveURL(/\/collab/);
    await expect(page.getByRole('button', { name: 'Log out' })).not.toBeVisible();
  });
});
