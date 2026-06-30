// Shared helpers for e2e specs. Each test that needs a logged-in user
// creates its own fresh, timestamped account rather than relying on
// shared fixture data, since specs run against the real dev database.

export function uniqueEmail(prefix) {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}@example.com`;
}

export async function registerAndLogin(page, { name = 'E2E Test User', email, password = 'testpass123' }) {
  await page.goto('/register');
  await page.fill('input[autocomplete="name"]', name);
  await page.fill('input[autocomplete="email"]', email);
  const pwFields = page.locator('input[autocomplete="new-password"]');
  await pwFields.nth(0).fill(password);
  await pwFields.nth(1).fill(password);
  await page.click('button[type=submit]');
  // The auth page renders a real WebGL scene that's slow under headless
  // software rendering — give navigation generous room.
  await page.waitForURL('**/explore', { timeout: 30_000 });
}

export async function login(page, email, password) {
  await page.goto('/login');
  await page.fill('input[type=email], input[name=email]', email);
  await page.fill('input[type=password], input[name=password]', password);
  await page.click('button[type=submit]');
  await page.waitForURL('**/explore', { timeout: 30_000 });
}
