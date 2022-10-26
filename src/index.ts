import * as fs from 'fs';

import * as path from 'path';

import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import type { Stats } from './types';
import millisToMinuteSeconds from './utils';
import DefaultReport from './defaultReport';

const initialStats = (): Stats => ({
  testsInSuite: 0,
  totalTestsRun: 0,
  expectedResults: 0,
  unexpectedResults: 0,
  flakyTests: 0,
  testMarkedSkipped: 0,
  failureFree: true,
  durationCPU: 0,
  durationSuite: 0,
  avgTestDuration: 0,
  formattedDurationSuite: '',
  formattedAvgTestDuration: '',
  failures: {},
  workers: 1,
});

class PlaywrightReportSummary implements Reporter {
  private outputFile: string;

  private inputTemplate: () => string;

  stats: Stats;

  constructor(
    options: { outputFile?: string; inputTemplate?: () => string } = {},
  ) {
    this.outputFile = options.outputFile;
    this.inputTemplate = options.inputTemplate;
  }

  onBegin(config, suite) {
    this.stats = initialStats();
    this.stats.testsInSuite = suite.allTests().length;
    this.stats.workers = config.workers;
  }

  async onTestEnd(test: TestCase, result: TestResult) {
    const outcome = test.outcome();
    const { retry } = result;

    if (outcome === 'expected') this.stats.expectedResults += 1;
    if (outcome === 'skipped') this.stats.testMarkedSkipped += 1;
    if (outcome === 'flaky') this.stats.flakyTests += 1;
    if (outcome === 'unexpected') {
      this.stats.failures[test.title] = result.status;
      if (retry === 0) {
        this.stats.unexpectedResults += 1;
      }
    }
    this.stats.totalTestsRun += 1;
    this.stats.durationCPU += result.duration;
    this.stats.failureFree = this.stats.unexpectedResults === 0;
  }

  async onEnd() {
    this.stats.durationSuite = Math.floor(
      this.stats.durationCPU / this.stats.workers,
    );
    this.stats.avgTestDuration = this.stats.durationCPU / (this.stats.totalTestsRun || 1);
    this.stats.formattedAvgTestDuration = millisToMinuteSeconds(
      this.stats.avgTestDuration,
    );
    this.stats.formattedDurationSuite = millisToMinuteSeconds(
      this.stats.durationSuite,
    );
    outputReport(this.stats, this.inputTemplate, this.outputFile);
  }
}

function outputReport(
  stats: Stats,
  inputTemplate?: Function,
  outputFile: string = 'results.txt',
) {
  let reportString: string;
  const report = new DefaultReport(stats);
  if (typeof inputTemplate === 'undefined') {
    reportString = report.templateReport();
  } else {
    reportString = inputTemplate(stats);
    if (typeof reportString !== 'string') {
      throw new Error('custom input templates must return a string');
    }
  }

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, reportString);
}

export default PlaywrightReportSummary;
