import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadText } from '../files';

describe('downloadText', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    URL.createObjectURL = vi.fn(() => 'blob:potinhos');
    URL.revokeObjectURL = vi.fn();
  });
  afterEach(() => vi.useRealTimers());

  it('downloads the text as a file and frees it afterwards', async () => {
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        expect(this.download).toBe('potinhos-2026-10-14.json');
        expect(this.href).toBe('blob:potinhos');
      });
    downloadText('potinhos-2026-10-14.json', '{"version":3}');

    expect(click).toHaveBeenCalledOnce();
    const [blob] = vi.mocked(URL.createObjectURL).mock.calls[0] ?? [];
    expect(await (blob as Blob).text()).toBe('{"version":3}');
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:potinhos');
    click.mockRestore();
  });
});
