import { describe, expect, it } from 'vitest';
import { migrate, SCHEMA_VERSION, versionOf } from './migrate';

describe('migrate', () => {
  it('leaves a current file unchanged', () => {
    const raw = {
      version: SCHEMA_VERSION,
      tasks: [{ id: 'a', jar: 'simple' }],
    };
    expect(migrate(raw, SCHEMA_VERSION)).toEqual(raw);
  });
});

describe('versionOf', () => {
  it('reads version, then meta.schemaVersion, then defaults to 0', () => {
    expect(versionOf({ version: 2 })).toBe(2);
    expect(versionOf({ meta: { schemaVersion: 1 } })).toBe(1);
    expect(versionOf({})).toBe(0);
  });

  it('treats an invalid version as 0', () => {
    expect(versionOf({ version: -1 })).toBe(0);
    expect(versionOf({ version: 1.5 })).toBe(0);
    expect(versionOf({ version: '2' })).toBe(0);
  });
});
