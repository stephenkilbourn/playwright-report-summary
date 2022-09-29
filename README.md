# 📜 🎭 Playwright Report Summary  🎭  📜

Small text based custom reporter for Playwright.

## Configuration

Modify your `playwright.config.ts` file to include the reporer:

```typescript
  reporter: [
    ['./src/index.ts', { outputFile: 'summary.txt' }]]
    ['html'], // other reporters
    ['dot']
  ],
```

The default output location will be to your root as `summary.txt`  Including the `outputFile` parameter allows you to specify a custom report location.
