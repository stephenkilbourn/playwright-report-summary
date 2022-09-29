import * as fs from 'fs';

import * as path from 'path';

import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';

import millisToMinuteSeconds from './utils';

const defaultReport = require('./defaultReport');

export type Stats = {
  testsInSuite: number;
  totalCompleted: number;
  expectedResults: number;
  unexpectedResults: number;
  flakyTests: number;
  testMarkedSkipped: number;
  failureFree: boolean;
  duration: number;
  avgTestDuration: number;
  formattedDuration: string;
  formattedAvgTestDuration: string;
};

const initialStats = (): Stats => ({
  testsInSuite: 0,
  totalCompleted: 0,
  expectedResults: 0,
  unexpectedResults: 0,
  flakyTests: 0,
  testMarkedSkipped: 0,
  failureFree: true,
  duration: 0,
  avgTestDuration: 0,
  formattedDuration: '',
  formattedAvgTestDuration: '',
});

class PlaywrightReportSummary implements Reporter {
  private stats!: Stats;

  private outputFile: string;

  constructor(options: { outputFile?: string } = {}) {
    this.outputFile = options.outputFile;
  }

  onBegin(config, suite) {
    this.stats = initialStats();
    this.stats.testsInSuite = suite.allTests().length;
  }

  async onTestEnd(test: TestCase, result: TestResult) {
    const outcome = test.outcome();
    if (outcome === 'expected') this.stats.expectedResults += 1;
    if (outcome === 'skipped') this.stats.testMarkedSkipped += 1;
    if (outcome === 'unexpected') this.stats.unexpectedResults += 1;
    if (outcome === 'flaky') this.stats.flakyTests += 1;
    this.stats.totalCompleted += 1;
    this.stats.duration += result.duration;
    this.stats.failureFree = this.stats.unexpectedResults === 0;
  }

  async onEnd() {
    const avgTestTime = this.stats.duration / (this.stats.totalCompleted || 1);
    this.stats.formattedDuration = millisToMinuteSeconds(this.stats.duration);
    this.stats.formattedAvgTestDuration = millisToMinuteSeconds(avgTestTime);
    outputReport(this.stats, this.outputFile);
  }
}

function outputReport(stats: Stats, outputFile = 'results.txt') {
  const reportString = defaultReport(
    stats.testsInSuite,
    stats.totalCompleted,
    stats.expectedResults,
    stats.unexpectedResults,
    stats.flakyTests,
    stats.testMarkedSkipped,
    stats.failureFree,
    stats.duration,
    stats.avgTestDuration,
    stats.formattedDuration,
    stats.formattedAvgTestDuration,
  );
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, reportString);
}

export default PlaywrightReportSummary;
