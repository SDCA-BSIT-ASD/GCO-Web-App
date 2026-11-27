import { describe, it, expect } from 'vitest';

import { COUNSELOR_TYPE, isCounselor } from './counselor.js';

describe('isCounselor', () => {
  it('accepts an employee whose type is counselor, ignoring case and whitespace', () => {
    expect(isCounselor({ type: COUNSELOR_TYPE })).toBe(true);
    expect(isCounselor({ type: `${COUNSELOR_TYPE.toUpperCase()}`})).toBe(true);
  })

  it('rejects other employee types, students and missing users', () => {
    expect(isCounselor({ type: 'admin' })).toBe(false);
    expect(isCounselor({ programName: 'BSIT' })).toBe(false);
    expect(isCounselor(null)).toBe(false);
    expect(isCounselor(undefined)).toBe(false);
  })
})