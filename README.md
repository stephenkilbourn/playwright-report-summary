# 📜 🎭 Playwright Report Summary  🎭  📜

Small text based custom reporter for Playwright.
It can be handy to publish test results for things such as an SNS message or minimal Slack update. This Tool allows you to generate smaller reports with basic info about your test run.

## ✨ Installation ✨

Run following commands:

### npm

`npm install @skilbournplaywright-report-summary --save-dev`

### yarn

`yarn add @skilbournplaywright-report-summary --dev`

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

## Customizing Outputs

Coming Soon
