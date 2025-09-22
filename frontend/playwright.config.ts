import { defineConfig } from '@playwright/test';
const chromiumPath =
  process.env.CHROMIUM_PATH ||
  '/usr/bin/chromium'; // fallback; change to /usr/bin/chromium-browser if needed

export default defineConfig({
  testDir: './e2e',
  reporter: [['list'], ['junit', { outputFile: './test-results/junit-results.xml' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Set a larger viewport size for better visibility in screenshots
    viewport: { width: 1920, height: 1280 },
  },
  projects: [
    {
      name: 'chromium-system',
      use: {
        browserName: 'chromium',
        headless: true,
        launchOptions: {
          executablePath: chromiumPath,
          args: (process.env.PW_LAUNCH_ARGS || '').split(' ').filter(Boolean),
        },
      },
    },
  ],
});
