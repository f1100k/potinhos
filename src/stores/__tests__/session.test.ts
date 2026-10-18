import { beforeEach, describe, expect, it } from 'vitest';
import {
  consumeAppOpening,
  consumeFlowUnlock,
  consumeWeekendAsk,
  resetSession,
  unlockFlow,
} from '../session';

describe('session', () => {
  beforeEach(resetSession);

  it('app opening is true only for the first navigation', () => {
    expect(consumeAppOpening()).toBe(true);
    expect(consumeAppOpening()).toBe(false);
    expect(consumeAppOpening()).toBe(false);
  });

  it('flow unlock is consumed by the first check', () => {
    expect(consumeFlowUnlock()).toBe(false);
    unlockFlow();
    expect(consumeFlowUnlock()).toBe(true);
    expect(consumeFlowUnlock()).toBe(false);
  });

  it('weekend is asked once per session', () => {
    expect(consumeWeekendAsk()).toBe(true);
    expect(consumeWeekendAsk()).toBe(false);
  });
});
