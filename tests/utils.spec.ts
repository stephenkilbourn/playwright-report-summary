import { expect, test } from '@playwright/test';
import millisToMinuteSeconds from '../src/utils';

test.describe('(millisToMinutesSeconds', () => {
  test('handles 0 millisceonds', () => {
    const result = millisToMinuteSeconds(0);
    expect(result).toEqual('00:00 (mm:ss)');
  });

  test('handles less than 1 second', () => {
    const result = millisToMinuteSeconds(1000);
    expect(result).toEqual('00:01 (mm:ss)');
  });
  test('handles less than 10 seconds', () => {
    const result = millisToMinuteSeconds(9 * 1000);
    expect(result).toEqual('00:09 (mm:ss)');
  });
  test('handles 10 seconds', () => {
    const result = millisToMinuteSeconds(10 * 1000);
    expect(result).toEqual('00:10 (mm:ss)');
  });

  test('handles over 10 seconds', () => {
    const result = millisToMinuteSeconds(21 * 1000);
    expect(result).toEqual('00:21 (mm:ss)');
  });

  test('handles 60 seconds', () => {
    const result = millisToMinuteSeconds(60 * 1000);
    expect(result).toEqual('01:00 (mm:ss)');
  });

  test('handles 90 seconds', () => {
    const result = millisToMinuteSeconds(90 * 1000);
    expect(result).toEqual('01:30 (mm:ss)');
  });

  test('handles 120 seconds', () => {
    const result = millisToMinuteSeconds(120 * 1000);
    expect(result).toEqual('02:00 (mm:ss)');
  });

  test('handles 10 minutes', () => {
    const result = millisToMinuteSeconds(10 * 60 * 1000);
    expect(result).toEqual('10:00 (mm:ss)');
  });
  test('handles 100 minutes', () => {
    const result = millisToMinuteSeconds(100 * 60 * 1000);
    expect(result).toEqual('100:00 (mm:ss)');
  });
});
