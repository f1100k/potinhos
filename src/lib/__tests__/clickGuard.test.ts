import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { swallowClicksFor } from '../clickGuard';

describe('swallowClicksFor', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('stops clicks until the time is up', () => {
    const button = document.createElement('button');
    const onClick = vi.fn();
    button.addEventListener('click', onClick);
    document.body.append(button);

    swallowClicksFor(500);
    button.click();
    expect(onClick).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    button.click();
    expect(onClick).toHaveBeenCalledOnce();
  });
});
