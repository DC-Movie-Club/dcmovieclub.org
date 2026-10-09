import { defineConfig } from "@playwright/test";

const PORT = 3100;

// Screenshots of the /kit pages, compared against a baseline taken before a
// change (see tests/kit.spec.ts). The baseline stays out of git: take it with
// `pnpm kit:baseline` on the commit to compare against, then run
// `pnpm kit:check` after the change.
export default defineConfig({
  testDir: "tests",
  snapshotPathTemplate: "tests/kit-screenshots/{projectName}/{arg}{ext}",
  timeout: 60_000,
  reporter: [["list"]],
  expect: {
    toHaveScreenshot: {
      // Finishes transitions and holds CSS animations (the marquee) still
      animations: "disabled",
      caret: "hide",
      maxDiffPixels: 0,
    },
  },
  use: {
    baseURL: `http://localhost:${PORT}`,
    timezoneId: "America/New_York",
    locale: "en-US",
  },
  projects: [
    {
      name: "phone",
      use: {
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "desktop",
      use: { viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 },
    },
  ],
  webServer: {
    command: `pnpm dev --port ${PORT}`,
    url: `http://localhost:${PORT}/kit`,
    reuseExistingServer: true,
    timeout: 120_000,
    // Every render logs the root 404 page failing to reach Firestore (Next
    // renders it with each page), which drowns the results
    stderr: "ignore",
  },
});
