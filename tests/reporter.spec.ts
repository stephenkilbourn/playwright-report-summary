import { Config, expect, test } from '@playwright/test';
import { Suite, TestCase, TestResult } from '@playwright/test/reporter';
import { readFileSync } from 'fs';
import mock from 'mock-fs';
import PlaywrightReportSummary from '../src/index';

type MockConfig = Pick<Config, 'workers'>;
type MockSuite = Pick<Suite, 'allTests'>;
type MockTestCase = Pick<TestCase, 'expectedStatus' | 'outcome' | 'title'>;
type MockTestResult = Pick<TestResult, 'status' | 'duration' | 'retry'>;

const mockedPassingTest: MockTestCase = {
  expectedStatus: 'passed',
  outcome: () => 'expected',
  title: 'mocked test',
};
const mockedPassingResult: MockTestResult = {
  status: 'passed',
  duration: 10000,
  retry: 0,
};

const mockedSkippedTest: MockTestCase = {
  expectedStatus: 'skipped',
  outcome: () => 'skipped',
  title: 'mocked test',
};
const mockedSkippedResult: MockTestResult = {
  status: 'skipped',
  duration: 0,
  retry: 0,
};

const mockedFailingTest: MockTestCase = {
  expectedStatus: 'passed',
  outcome: () => 'unexpected',
  title: 'failed mocked test',
};
const mockedFailingResult: MockTestResult = {
  status: 'failed',
  duration: 10000,
  retry: 0,
};

const mockedTimedOutTest: MockTestCase = {
  expectedStatus: 'passed',
  outcome: () => 'unexpected',
  title: 'timed out mocked test',
};
const mockedTimedOutResult: MockTestResult = {
  status: 'timedOut',
  duration: 10000,
  retry: 1,
};

const mockedPassingTestAfterRetries: MockTestCase = {
  expectedStatus: 'passed',
  outcome: () => 'flaky',
  title: 'timed out mocked test',
};

const mockedPassingResultAfterRetries: MockTestResult = {
  status: 'passed',
  duration: 10000,
  retry: 2,
};

test.describe('Reporter handles stats', () => {
  test('parses default results successfully', async () => {
    const mockConfig: MockConfig = {
      workers: 1,
    };
    const mockSuite: MockSuite = {
      allTests: () => [],
    };

    const playwrightReportSummary = new PlaywrightReportSummary();

    await playwrightReportSummary.onBegin(mockConfig, mockSuite);
    await playwrightReportSummary.onEnd();

    const results = await playwrightReportSummary.stats;
    expect(results).toEqual({
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
      formattedDurationSuite: '00:00 (mm:ss)',
      formattedAvgTestDuration: '00:00 (mm:ss)',
      failures: {},
      workers: 1,
    });
  });

  test('updates stats if test passes', async () => {
    const mockConfig: MockConfig = {
      workers: 1,
    };
    const mockSuite: MockSuite = {
      allTests: () => [mockedPassingTest],
    };
    const playwrightReportSummary = new PlaywrightReportSummary();

    await playwrightReportSummary.onBegin(mockConfig, mockSuite);
    await playwrightReportSummary.onTestEnd(
      mockedPassingTest,
      mockedPassingResult,
    );
    await playwrightReportSummary.onEnd();

    const results = await playwrightReportSummary.stats;
    expect(results).toEqual({
      testsInSuite: 1,
      totalTestsRun: 1,
      expectedResults: 1,
      unexpectedResults: 0,
      flakyTests: 0,
      testMarkedSkipped: 0,
      failureFree: true,
      durationCPU: 10000,
      durationSuite: 10000,
      avgTestDuration: 10000,
      formattedDurationSuite: '00:10 (mm:ss)',
      formattedAvgTestDuration: '00:10 (mm:ss)',
      failures: {},
      workers: 1,
    });
  });

  test('updates stats if test marked skipped', async () => {
    const mockConfig: MockConfig = {
      workers: 1,
    };
    const mockSuite: MockSuite = {
      allTests: () => [mockedSkippedTest],
    };
    const playwrightReportSummary = new PlaywrightReportSummary();

    await playwrightReportSummary.onBegin(mockConfig, mockSuite);
    await playwrightReportSummary.onTestEnd(
      mockedSkippedTest,
      mockedSkippedResult,
    );
    await playwrightReportSummary.onEnd();

    const results = await playwrightReportSummary.stats;
    expect(results).toEqual({
      testsInSuite: 1,
      totalTestsRun: 1,
      expectedResults: 0,
      unexpectedResults: 0,
      flakyTests: 0,
      testMarkedSkipped: 1,
      failureFree: true,
      durationCPU: 0,
      durationSuite: 0,
      avgTestDuration: 0,
      formattedDurationSuite: '00:00 (mm:ss)',
      formattedAvgTestDuration: '00:00 (mm:ss)',
      failures: {},
      workers: 1,
    });
  });

  test('updates stats if 2 tests pass', async () => {
    const mockConfig: MockConfig = {
      workers: 1,
    };
    const mockSuite: MockSuite = {
      allTests: () => [mockedPassingTest, mockedPassingTest],
    };
    const playwrightReportSummary = new PlaywrightReportSummary();

    await playwrightReportSummary.onBegin(mockConfig, mockSuite);
    await playwrightReportSummary.onTestEnd(
      mockedPassingTest,
      mockedPassingResult,
    );
    await playwrightReportSummary.onTestEnd(
      mockedPassingTest,
      mockedPassingResult,
    );
    await playwrightReportSummary.onEnd();

    const results = await playwrightReportSummary.stats;
    expect(results).toEqual({
      testsInSuite: 2,
      totalTestsRun: 2,
      expectedResults: 2,
      unexpectedResults: 0,
      flakyTests: 0,
      testMarkedSkipped: 0,
      failureFree: true,
      durationCPU: 20000,
      durationSuite: 20000,
      avgTestDuration: 10000,
      formattedDurationSuite: '00:20 (mm:ss)',
      formattedAvgTestDuration: '00:10 (mm:ss)',
      failures: {},
      workers: 1,
    });
  });

  test('show changed workers & suite duration if multiple workers', async () => {
    const mockConfig: MockConfig = {
      workers: 2,
    };
    const mockSuite: MockSuite = {
      allTests: () => [mockedPassingTest, mockedPassingTest],
    };
    const playwrightReportSummary = new PlaywrightReportSummary();

    await playwrightReportSummary.onBegin(mockConfig, mockSuite);
    await playwrightReportSummary.onTestEnd(
      mockedPassingTest,
      mockedPassingResult,
    );
    await playwrightReportSummary.onTestEnd(
      mockedPassingTest,
      mockedPassingResult,
    );
    await playwrightReportSummary.onEnd();

    const results = await playwrightReportSummary.stats;
    expect(results).toEqual({
      testsInSuite: 2,
      totalTestsRun: 2,
      expectedResults: 2,
      unexpectedResults: 0,
      flakyTests: 0,
      testMarkedSkipped: 0,
      failureFree: true,
      durationCPU: 20000,
      durationSuite: 10000,
      avgTestDuration: 10000,
      formattedDurationSuite: '00:10 (mm:ss)',
      formattedAvgTestDuration: '00:10 (mm:ss)',
      failures: {},
      workers: 2,
    });
  });

  test('show failure if tests fails', async () => {
    const mockConfig: MockConfig = {
      workers: 2,
    };
    const mockSuite: MockSuite = {
      allTests: () => [mockedFailingTest, mockedPassingTest],
    };
    const playwrightReportSummary = new PlaywrightReportSummary();

    await playwrightReportSummary.onBegin(mockConfig, mockSuite);
    await playwrightReportSummary.onTestEnd(
      mockedFailingTest,
      mockedFailingResult,
    );
    await playwrightReportSummary.onTestEnd(
      mockedPassingTest,
      mockedPassingResult,
    );

    await playwrightReportSummary.onEnd();

    const results = await playwrightReportSummary.stats;
    expect(results).toEqual({
      testsInSuite: 2,
      totalTestsRun: 2,
      expectedResults: 1,
      unexpectedResults: 1,
      flakyTests: 0,
      testMarkedSkipped: 0,
      failureFree: false,
      durationCPU: 20000,
      durationSuite: 10000,
      avgTestDuration: 10000,
      formattedDurationSuite: '00:10 (mm:ss)',
      formattedAvgTestDuration: '00:10 (mm:ss)',
      failures: { 'failed mocked test': 'failed' },
      workers: 2,
    });
  });

  test('count as flaky if tests fails and then passes', async () => {
    const mockConfig: MockConfig = {
      workers: 1,
    };
    const mockSuite: MockSuite = {
      allTests: () => [mockedPassingTestAfterRetries],
    };
    const playwrightReportSummary = new PlaywrightReportSummary();

    await playwrightReportSummary.onBegin(mockConfig, mockSuite);
    await playwrightReportSummary.onTestEnd(
      mockedFailingTest,
      mockedFailingResult,
    );
    await playwrightReportSummary.onTestEnd(
      mockedTimedOutTest,
      mockedTimedOutResult,
    );
    await playwrightReportSummary.onTestEnd(
      mockedPassingTestAfterRetries,
      mockedPassingResultAfterRetries,
    );

    await playwrightReportSummary.onEnd();

    const results = await playwrightReportSummary.stats;
    expect(results).toEqual({
      testsInSuite: 1,
      totalTestsRun: 3,
      expectedResults: 0,
      unexpectedResults: 1,
      flakyTests: 1,
      testMarkedSkipped: 0,
      failureFree: false,
      durationCPU: 30000,
      durationSuite: 30000,
      avgTestDuration: 10000,
      formattedDurationSuite: '00:30 (mm:ss)',
      formattedAvgTestDuration: '00:10 (mm:ss)',
      failures: {
        'failed mocked test': 'failed',
        'timed out mocked test': 'timedOut',
      },
      workers: 1,
    });
  });
});

test.describe('outputReport correctly writes files', () => {
  test.beforeAll(() => {
    mock({});
  });
  test.afterAll(() => {
    mock.restore();
  });
  test('write to default location if no outPut file provided', async () => {
    const defaultString = `Total Tests in Suite: 0,
Total Tests Completed: 0,
Tests Passed: 0,
Tests Failed: 0,
Flaky Tests: 0,
Test Skipped: 0,
Test run was failure free? true,
Duration of CPU usage in ms: 0,
Duration of entire test run in ms: 0,
Average Test Duration in ms: 0,
Test Suite Duration: 00:00 (mm:ss),
Average Test Duration: 00:00 (mm:ss),
Number of workers used for test run: 1`;

    const mockConfig: MockConfig = {
      workers: 1,
    };
    const mockSuite: MockSuite = {
      allTests: () => [],
    };

    const playwrightReportSummary = new PlaywrightReportSummary();

    await playwrightReportSummary.onBegin(mockConfig, mockSuite);
    await playwrightReportSummary.onEnd();

    const result = readFileSync('results.txt', 'utf8');
    await expect(result).toEqual(defaultString);
  });

  test('write to specified location if outPut filepath provided', async () => {
    const defaultString = `Total Tests in Suite: 0,
Total Tests Completed: 0,
Tests Passed: 0,
Tests Failed: 0,
Flaky Tests: 0,
Test Skipped: 0,
Test run was failure free? true,
Duration of CPU usage in ms: 0,
Duration of entire test run in ms: 0,
Average Test Duration in ms: 0,
Test Suite Duration: 00:00 (mm:ss),
Average Test Duration: 00:00 (mm:ss),
Number of workers used for test run: 1`;

    const mockConfig: MockConfig = {
      workers: 1,
    };
    const mockSuite: MockSuite = {
      allTests: () => [],
    };

    const playwrightReportSummary = new PlaywrightReportSummary({
      outputFile: 'subdirectory/results.txt',
    });

    await playwrightReportSummary.onBegin(mockConfig, mockSuite);
    await playwrightReportSummary.onEnd();

    const result = readFileSync('subdirectory/results.txt', 'utf8');
    await expect(result).toEqual(defaultString);
  });

  test('write output of custom inputTemplate if provided', async () => {
    const testInputTemplate = () => 'my custom template';

    const mockConfig: MockConfig = {
      workers: 1,
    };
    const mockSuite: MockSuite = {
      allTests: () => [],
    };

    const playwrightReportSummary = new PlaywrightReportSummary({
      inputTemplate: testInputTemplate,
    });

    await playwrightReportSummary.onBegin(mockConfig, mockSuite);
    await playwrightReportSummary.onEnd();

    const result = readFileSync('results.txt', 'utf8');
    await expect(result).toEqual('my custom template');
  });

  test('throw error if output of custom inputTemplate is not string', async () => {
    const testInputTemplate = () => true;

    const mockConfig: MockConfig = {
      workers: 1,
    };
    const mockSuite: MockSuite = {
      allTests: () => [],
    };

    const playwrightReportSummary = new PlaywrightReportSummary({
      inputTemplate: testInputTemplate,
    });

    await playwrightReportSummary.onBegin(mockConfig, mockSuite);

    expect(async () => {
      await playwrightReportSummary.onEnd();
    }).rejects.toThrow({
      Error: 'custom input templates must return a string',
    });
  });
});
