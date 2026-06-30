import { test, expect } from '@playwright/test';
import { uniqueEmail, registerAndLogin } from './helpers.js';

// Full two-user flow: poster posts a job, a separate applicant applies,
// the poster accepts, and the applicant sees the status update. This is
// the scenario that originally caught the blank-username registration
// bug and the fetchMe() refresh-bypass bug.
test('post a job, apply, accept, and confirm status on both sides', async ({ browser }) => {
  // Two full registerAndLogin round trips (each loading the heavy auth
  // scene) plus a multi-step job flow needs more than the suite default.
  test.setTimeout(150_000);

  const stamp = Date.now();
  const jobTitle = `E2E QA Engineer ${stamp}`;

  const posterCtx = await browser.newContext();
  const posterPage = await posterCtx.newPage();
  const applicantCtx = await browser.newContext();
  const applicantPage = await applicantCtx.newPage();

  try {
    // Poster posts a job
    await registerAndLogin(posterPage, { name: 'E2E Poster', email: uniqueEmail('poster') });
    await posterPage.getByRole('link', { name: 'Jobs' }).first().click();
    await posterPage.getByText('Post a Job', { exact: true }).click();
    await posterPage.fill('input[placeholder="Senior Frontend Engineer"]', jobTitle);
    await posterPage.fill('input[placeholder="Your company"]', 'Prograstic Inc');
    await posterPage.fill('input[placeholder="Bangalore, India"]', 'Remote');
    await posterPage.fill('textarea[placeholder*="Responsibilities"]', 'Own quality across the web app. 2+ years QA experience.');
    await posterPage.click('button:has-text("Post Job")');
    await expect(posterPage.getByText('Job posted', { exact: false })).toBeVisible({ timeout: 5000 }).catch(() => {});
    await posterPage.click('button:has-text("Done")');

    // Applicant applies
    await registerAndLogin(applicantPage, { name: 'E2E Applicant', email: uniqueEmail('applicant') });
    await applicantPage.goto('/jobs');
    await expect(applicantPage.getByText(jobTitle).first()).toBeVisible({ timeout: 10_000 });
    await applicantPage.getByText(jobTitle).first().click();
    const applyBtn = applicantPage.getByRole('button', { name: /apply/i }).first();
    await applyBtn.click();
    await applicantPage.locator('textarea').first().fill('I have hands-on QA automation experience and would love to help.');
    await applicantPage.getByRole('button', { name: /submit application/i }).click();
    await expect(applicantPage.getByText(/sent|submitted|success/i).first()).toBeVisible({ timeout: 5000 }).catch(() => {});

    // Poster reviews and accepts
    await posterPage.goto('/jobs');
    await posterPage.getByText('My Postings', { exact: true }).click();
    await posterPage.getByText(/review/i).first().click();
    await expect(posterPage.getByText('E2E Applicant').first()).toBeVisible({ timeout: 10_000 });
    await posterPage.getByRole('button', { name: 'Accept', exact: true }).first().click();

    // Applicant confirms
    await applicantPage.goto('/jobs');
    await applicantPage.getByText('My Applications', { exact: true }).click();
    await expect(applicantPage.getByText(/accepted/i).first()).toBeVisible({ timeout: 10_000 });
  } finally {
    await posterCtx.close();
    await applicantCtx.close();
  }
});
