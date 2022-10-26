# 📜 🎭 Playwright Report Summary  🎭  📜

[![Coverage Status](https://coveralls.io/repos/github/stephenkilbourn/playwright-report-summary/badge.svg?branch=main)](https://coveralls.io/github/stephenkilbourn/playwright-report-summary?branch=main)

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
Tests Passed: 27,
Tests Failed: 0,
Flaky Tests: 0,
Test run was failure free? true,
Test Skipped: 3,
Duration of CPU usage in ms: 75188,
Duration of entire test run in ms: 12531,
Average Test Duration in ms:2506.3,
Test Suite Duration: 00:13 (mm:ss),
Average Test Duration: 00:03 (mm:ss),
Number of workers used for test run: 6
```

## Customizing Outputs 👨‍💻

YOu may also create a custom report by leveraging the values in the `stats` object. To add a custom report leveraging your stats, create a function in the format:

```typescript
import type { Stats } from '@skilbourn/playwright-report-summary';

function customReport(stats: Stats) {
  return `Greetings, hello, ${stats.expectedResults} tests passed as expected in ${stats.formattedDurationSuite}`;
}

export default customReport;
```

and then modify your `playwright.config.ts` file with the following:

```typescript
import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';

import customReport from './customReport';
 // Your custom report path and preferred name


const config: PlaywrightTestConfig = {
  ...
  reporter: [
    ['@skilbourn/playwright-report-summary', { outputFile: 'custom-summary.txt', inputTemplate: customReport }]]
  ],

```

this will generate a `custom-summary.txt` file such as :

```txt
hello, 50 tests passed as expected in 03:51 (mm:ss)
```
