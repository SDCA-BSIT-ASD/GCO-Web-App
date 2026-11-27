import { describe, it, expect } from 'vitest'

import { DASS21_ITEMS, getSeverity, calculateDass21 } from './dass21.js'

// Builds 21 answers where each subscale's items add up to the raw sum given.
function buildAnswers(rawSums = {}) {
  const answers = Array(21).fill(0)

  for (const [subscale, items] of Object.entries(DASS21_ITEMS)) {
    let remaining = rawSums[subscale] ?? 0

    for (const item of items) {
      const value = Math.min(3, remaining)
      answers[item - 1] = value
      remaining -= value
    }
  }

  return answers
}

describe('getSeverity', () => {
  it.each([
    ['depression', 0, 'Normal'],
    ['depression', 9, 'Normal'],
    ['depression', 10, 'Mild'],
    ['depression', 13, 'Mild'],
    ['depression', 14, 'Moderate'],
    ['depression', 20, 'Moderate'],
    ['depression', 21, 'Severe'],
    ['depression', 27, 'Severe'],
    ['depression', 28, 'Extremely Severe'],
    ['depression', 42, 'Extremely Severe'],
    ['anxiety', 0, 'Normal'],
    ['anxiety', 7, 'Normal'],
    ['anxiety', 8, 'Mild'],
    ['anxiety', 9, 'Mild'],
    ['anxiety', 10, 'Moderate'],
    ['anxiety', 14, 'Moderate'],
    ['anxiety', 15, 'Severe'],
    ['anxiety', 19, 'Severe'],
    ['anxiety', 20, 'Extremely Severe'],
    ['anxiety', 42, 'Extremely Severe'],
    ['stress', 0, 'Normal'],
    ['stress', 14, 'Normal'],
    ['stress', 15, 'Mild'],
    ['stress', 18, 'Mild'],
    ['stress', 19, 'Moderate'],
    ['stress', 25, 'Moderate'],
    ['stress', 26, 'Severe'],
    ['stress', 33, 'Severe'],
    ['stress', 34, 'Extremely Severe'],
    ['stress', 42, 'Extremely Severe']
  ])('%s score %i is %s', (subscale, score, expected) => {
    expect(getSeverity(subscale, score)).toBe(expected)
  })

  it('rejects an unknown subscale', () => {
    expect(() => getSeverity('sleep', 5)).toThrow('Unknown subscale: sleep')
  })
})

describe('calculateDass21', () => {
  it('returns Normal and not flagged for all zeros', () => {
    expect(calculateDass21(buildAnswers())).toEqual({
      depression: { score: 0, severity: 'Normal' },
      anxiety: { score: 0, severity: 'Normal' },
      stress: { score: 0, severity: 'Normal' },
      isFlagged: false
    })
  })

  it('multiplies each subscale sum by 2', () => {
    const result = calculateDass21(buildAnswers({ depression: 7 }))

    expect(result.depression).toEqual({ score: 14, severity: 'Moderate' })
  })

  it('maps questions to the correct subscale', () => {
    const q3 = Array(21).fill(0)
    q3[2] = 3
    expect(calculateDass21(q3)).toMatchObject({
      depression: { score: 6 },
      anxiety: { score: 0 },
      stress: { score: 0 }
    })

    const q1 = Array(21).fill(0)
    q1[0] = 3
    expect(calculateDass21(q1)).toMatchObject({
      depression: { score: 0 },
      anxiety: { score: 0 },
      stress: { score: 6 }
    })
  })

  it('flags when one subscale is Severe', () => {
    const result = calculateDass21(buildAnswers({ depression: 11 }))

    expect(result.depression).toEqual({ score: 22, severity: 'Severe' })
    expect(result.isFlagged).toBe(true)
  })

  it('flags Extremely Severe on every subscale', () => {
    const result = calculateDass21(Array(21).fill(3))

    expect(result.depression.score).toBe(42)
    expect(result.anxiety.severity).toBe('Extremely Severe')
    expect(result.isFlagged).toBe(true)
  })

  it('does not flag when the highest label is Moderate', () => {
    const result = calculateDass21(buildAnswers({ depression: 10, anxiety: 7, stress: 12 }))

    expect(result.depression.severity).toBe('Moderate')
    expect(result.anxiety.severity).toBe('Moderate')
    expect(result.stress.severity).toBe('Moderate')
    expect(result.isFlagged).toBe(false)
  })

  it('rejects the wrong number of answers', () => {
    expect(() => calculateDass21(Array(20).fill(0))).toThrow('exactly 21 answers')
    expect(() => calculateDass21('not an array')).toThrow('exactly 21 answers')
  })

  it('rejects answers outside 0 to 3 or not whole numbers', () => {
    expect(() => calculateDass21([...Array(20).fill(0), 4])).toThrow('whole number from 0 to 3')
    expect(() => calculateDass21([...Array(20).fill(0), 1.5])).toThrow('whole number from 0 to 3')
    expect(() => calculateDass21([...Array(20).fill(0), '2'])).toThrow('whole number from 0 to 3')
  })
})