import { describe, it, expect } from 'vitest'

import { toDass21Entry } from './dass21-entries.js'

const submittedAt = new Date('2026-11-10T08:53:00Z')

function makeAnswers(overrides = {}) {
  const answers = Array(21).fill(0)

  for (const [question, value] of Object.entries(overrides)) {
    answers[Number(question) - 1] = value
  }

  return answers
}

describe('toDass21Entry', () => {
  it('maps a non-flagged submission to the agreed row fields', () => {
    const row = toDass21Entry({
      _id: 'r1',
      studentId: { _id: 's1', firstName: 'Ana', lastName: 'Cruz', studentNumber: 202400001 },
      answers: makeAnswers(),
      submittedAt
    })

    expect(row).toEqual({
      id: 'r1',
      studentName: 'Ana Cruz',
      studentNumber: '202400001',
      submittedAt,
      depression: { score: 0, severity: 'Normal' },
      anxiety: { score: 0, severity: 'Normal' },
      stress: { score: 0, severity: 'Normal' },
      isFlagged: false
    })
  })

  it('flags a submission with a Severe subscale', () => {
    // Questions 3, 5, 10, 13 are depression items: 4 x 3 = 12, doubled = 24 (Severe)
    const row = toDass21Entry({
      _id: 'r2',
      studentId: { _id: 's1', firstName: 'Ana', lastName: 'Cruz' },
      answers: makeAnswers({ 3: 3, 5: 3, 10: 3, 13: 3 }),
      submittedAt
    })

    expect(row.depression).toEqual({ score: 24, severity: 'Severe' })
    expect(row.isFlagged).toBe(true)
    expect(row.studentNumber).toBeNull()
  })

  it('never includes the individual answers', () => {
    const row = toDass21Entry({
      _id: 'r3',
      studentId: { _id: 's1', firstName: 'Ana', lastName: 'Cruz' },
      answers: makeAnswers(),
      submittedAt
    })

    expect(row).not.toHaveProperty('answers')
  })

  it('returns null name and number when the student record is missing', () => {
    const row = toDass21Entry({ _id: 'r4', studentId: null, answers: makeAnswers(), submittedAt })

    expect(row.studentName).toBeNull()
    expect(row.studentNumber).toBeNull()
  })
})