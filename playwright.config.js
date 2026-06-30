import { defineConfig, devices } from '@playwright/test';

// Each test run hits the real dev backend + the shared Atlas dev database
// (no isolated test DB yet) — keep specs additive (create fresh, timestamped
// data) rather than asserting on exact global counts, and avoid deleting
// data you didn't create.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  // One shared dev backend + Atlas dev DB behind this suite, not an
  // isolated per-worker environment — run serially to avoid contention.
  workers: 1,
  retries: 0,
  // Generous: the auth page renders a real WebGL Spline scene, which is
  // slow under headless software rendering and every test goes through it
  // at least once via registerAndLogin.
  timeout: 75_000,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    {
      command: 'npm --prefix ../backend run start',
      url: 'http://localhost:3000/api/auth/me',
      reuseExistingServer: true,
      timeout: 30_000,
      env: { PORT: '3000' },
      // /api/auth/me without a token returns 401, which still proves the
      // server answered — Playwright's webServer just needs *a* response.
      ignoreHTTPSErrors: true,
    },
    {
      command: 'npm run dev -- --port 5173',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 30_000,
      env: { VITE_API_URL: 'http://localhost:3000' },
    },
  ],
});
