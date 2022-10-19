import type { Stats } from './types';

export default class DefaultReport {
  stats: Stats;

  constructor(stats) {
    this.stats = stats;
  }

  templateReport() {
    return (
    // eslint-disable-next-line indent
`Total Tests in Suite: ${this.stats.testsInSuite},
Total Tests Completed: ${this.stats.totalTestsRun},
Tests Passed: ${this.stats.expectedResults},
Tests Failed: ${this.stats.unexpectedResults},
Flaky Tests: ${this.stats.flakyTests},
Test Skipped: ${this.stats.testMarkedSkipped},
Test run was failure free? ${this.stats.failureFree},
Duration of CPU usage in ms: ${this.stats.durationCPU},
Duration of entire test run in ms: ${this.stats.durationSuite},
Average Test Duration in ms:${this.stats.avgTestDuration},
Test Suite Duration: ${this.stats.formattedDurationSuite},
Average Test Duration: ${this.stats.formattedAvgTestDuration},
Number of workers used for test run: ${this.stats.workers}`
    );
  }
}
