# 📜 🎭 Playwright Report Summary  🎭  📜

Small text based custom reporter for Playwright.
It can be handy to publish test results for things such as an SNS message or minimal Slack update. This Tool allows you to generate smaller reports with basic info about your test run.

## ✨ Installation ✨

Run following commands:

### npm

`npm install @skilbourn/playwright-report-summary --save-dev`

### yarn

`yarn add @skilbourn/playwright-report-summary --dev`

## 📍 Configuration 📍

Modify your `playwright.config.ts` file to include the reporter:

```typescript
  reporter: [
    ['@skilbourn/playwright-report-summary', { outputFile: 'custom-summary.txt' }]]
    ['html'], // other reporters
    ['dot']
  ],
```

The default output location will be to your root as `summary.txt`  Including the `outputFile` parameter allows you to specify a custom report location.

## Default Output 📜

If you do not pass an outputFile option, then the summary will be generated to a `summary.txt` file in the following format:

```txt
Total Tests in Suite: 30,
Total Tests Completed: 30,
Tests Passed: 30,
Tests Failed: 0,
Flaky Tests: 0,
Test Skipped: 0,
Test run was failure free? true,
Duration in ms: 234,
Average Test Duration:0,
Formatted Duration: 00:01 (mm:ss),
Formatted Avg Test Duration: 00:01 (mm:ss)
```

## Customizing Outputs 👨‍💻

To add a custom report leveraging your stats, create a function in the format:

```typescript
  stats,
) => `
I completed  ${stats.totalCompleted} Total Tests in ${stats.formattedDuration}.`;
```

and then modify your `playwright.config.ts` file with the following:

```typescript
import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';

const customReport = require('./customReport'); // Your custom report path and preferred name


const config: PlaywrightTestConfig = {
  ...
  reporter: [
    ['@skilbourn/playwright-report-summary', { outputFile: 'custom-summary.txt', inputTemplate: customReport }]]
  ],

```

this will generate a file such as :

```txt
I completed  30 Total Tests in 00:01 (mm:ss).
```
