import { test, expect } from '@playwright/test';
import { uniqueEmail, registerAndLogin, login } from './helpers.js';

test.describe('Authentication', () => {
  test('registers successfully with a blank (auto-generated) username', async ({ page }) => {
    // Regression test: RegisterForm's submit handler used to require
    // usernameStatus === 'available' unconditionally, which is never true
    // when the optional username field is left blank — silently blocking
    // every signup that didn't manually type a username.
    const email = uniqueEmail('regtest');
    await registerAndLogin(page, { email });
    await expect(page).toHaveURL(/\/explore/);

    const stored = await page.evaluate(() => localStorage.getItem('auth'));
    const { state } = JSON.parse(stored);
    expect(state.accessToken).toBeTruthy();
    expect(state.refreshToken).toBeTruthy();
  });

  test('persists the session across a full page reload', async ({ page }) => {
    // Regression test: fetchMe() used to bypass the axios refresh
    // interceptor, so an expired/invalid access token at app-mount time
    // would immediately log the user out instead of refreshing.
    const email = uniqueEmail('reload');
    await registerAndLogin(page, { email });

    await page.reload();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/explore/);
  });

  test('logs in with valid credentials and logs out via the navbar drawer on mobile', async ({ page }) => {
    test.skip(!process.env.E2E_SEED_EMAIL, 'requires a known seeded account (set E2E_SEED_EMAIL / E2E_SEED_PASSWORD)');
    await page.setViewportSize({ width: 390, height: 844 });
    await login(page, process.env.E2E_SEED_EMAIL, process.env.E2E_SEED_PASSWORD);

    // Regression test: the mobile navbar used to overflow ~190px past the
    // viewport, hiding Messages/Friends/Notifications/Avatar/Logout with
    // no way to reach them.
    await page.click('button[title=Menu]');
    await page.getByRole('button', { name: 'Log out' }).click();
    await expect(page).toHaveURL('/');
  });

  test('rejects login with wrong password', async ({ page }) => {
    // Register fresh rather than depend on a pre-seeded account, but reuse
    // this same context (no second full page load of the heavy auth scene).
    const email = uniqueEmail('wrongpw');
    await registerAndLogin(page, { email });
    await page.evaluate(() => localStorage.removeItem('auth'));

    await page.goto('/login');
    await page.fill('input[type=email], input[name=email]', email);
    await page.fill('input[type=password], input[name=password]', 'definitely-wrong');
    await page.click('button[type=submit]');

    await expect(page.getByText(/invalid|incorrect|wrong|failed/i)).toBeVisible({ timeout: 10_000 });
    await expect(page).not.toHaveURL(/\/explore/);
  });
});
