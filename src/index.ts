import * as fs from 'fs';

import * as path from 'path';

import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';

import millisToMinuteSeconds from './utils';

import DefaultReport from './defaultReport';

export type Stats = {
  testsInSuite: number;
  totalTestsRun: number;
  expectedResults: number;
  unexpectedResults: number;
  flakyTests: number;
  testMarkedSkipped: number;
  failureFree: boolean;
  durationCPU: number;
  durationSuite: number;
  avgTestDuration: number;
  formattedDurationSuite: string;
  formattedAvgTestDuration: string;
  failures: object;
  workers: number;
};

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
  private stats!: Stats;

  private outputFile: string;

  private inputTemplate: Function;

  constructor(options: { outputFile?: string; inputTemplate?: Function } = {}) {
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
    if (outcome === 'unexpected' && retry === 0) {
      this.stats.failures[test.title] = result.status;
      this.stats.unexpectedResults += 1;
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
    this.stats.formattedAvgTestDuration = millisToMinuteSeconds(this.stats.avgTestDuration);
    this.stats.formattedDurationSuite = millisToMinuteSeconds(this.stats.durationSuite);
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
  }

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, reportString);
}

export default PlaywrightReportSummary;
