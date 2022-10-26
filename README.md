# 📜 🎭 Playwright Report Summary  🎭  📜

[![Coverage Status](https://coveralls.io/repos/github/stephenkilbourn/playwright-report-summary/badge.svg?branch=main)](https://coveralls.io/github/stephenkilbourn/playwright-report-summary?branch=main)

Small text based custom reporter for Playwright.
It can be handy to publish test results for things such as an SNS message or minimal Slack update. This Tool allows you to generate smaller reports with basic info about your test run.

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->
## Table of Contents

* [✨ Installation ✨](#✨-installation-✨)
* [📍 Configuration 📍](#📍-configuration-📍)
* [ Default Output 📜](#default-output-📜)
* [Customizing Outputs 👨‍💻](#customizing-outputs-👨‍💻)
* [Available  Stats 🧰](#available-stats-🧰)

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

The default output location will be to your root as `summary.txt`  Including the optional `outputFile` parameter allows you to specify a custom report location.

## Default Output 📜

If you do not pass an `outputFile` option, then the summary will be generated to a `summary.txt` file in the following format:

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

You may also create a custom report by leveraging the values in the [`stats`](#available-stats-🧰) object. To add a custom report leveraging your stats, create a function in the format:

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

## Available  Stats 🧰

The `stats` object provides information on your test suite:

| **Name**                 | **type** | **Description**                                                                                                                                                  |
|--------------------------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| testsInSuite             | number   | Total number of tests in suite                                                                                                                                   |
| totalTestsRun            | number   | t
otal tests run. Retried tests can make this value larger than testsInSuite                                                                                      |
| expectedResults          | number   | total test finished as [expected](https://playwright.dev/docs/api/class-testcase#test-case-expected-status)                                                      |
| unexpectedResults        | number   | total tests not finished as expected                                                                                                                             |
| flakyTests               | number   | total of tests that passed when retried                                                                                                                          |
| testMarkedSkipped        | number   | total tests marked as test.skip() or test.fixme()                                                                                                                |
| failureFree              | boolean  | returns `true` if suite completes with unexpectedResults = 0                                                                                                     |
| durationCPU              | number   | total milliseconds spent run tests. If tests run parallel with multiple workers, this value will be larger than the duration of running the suite                |
| durationSuite            | number   | milliseconds to complete all tests in suite                                                                                                                      |
| avgTestDuration          | number   | average test duration of all tests in milliseconds                                                                                                               |
| formattedDurationSuite   | string   | duration to complete all tests in mm:ss format                                                                                                                   |
| formattedAvgTestDuration | string   | average test duration of all tests in mm:ss format                                                                                                               |
| failures                 | object   | an object containing each failure  in the format `{[test.title: result.status]}` Retries with failures will populate this with multiple entries of the same test |
| workers                  | number   | total number of workers used to run the suite                                                                                                                    |
