// Backend mock unit tests for DASS-21 input validation, scoring, and counselor flagging
import { describe, it, expect } from 'vitest'

// the file .dass21-form-entry does not exist yet.
// evaluateDass21 is a mock placeholder function name that will be updated
import { evaluateDass21 } from './dass21-form-entry'

// generates a complete, valid responses to the 21 item
function buildResponses(defaultValue = 0, overrides: Record<string, unknown> = {}) {
  const responses: Record<string, unknown> = {}
  for (let i = 1; i <= 21; i++) {
    responses[`item${i}`] = defaultValue
  }
  return { ...responses, ...overrides }
}

//sets responses to the 7 items per category, while keeping the other 14 items at 0, so we can test each scale in isolation.
function buildSubscaleResponses(itemNumbers: number[], valuePerItem: number) {
  const overrides: Record<string, number> = {}
  for (const num of itemNumbers) {
    overrides[`item${num}`] = valuePerItem
  }
  return buildResponses(0, overrides)
}

// DASS-21 grouping based on item numbers
const DEPRESSION_ITEMS = [3, 5, 10, 13, 16, 17, 21]
const ANXIETY_ITEMS = [2, 4, 7, 9, 15, 19, 20]
const STRESS_ITEMS = [1, 6, 8, 11, 12, 14, 18]

describe('evaluateDass21 (mock backend unit tests)', () => {

// INPUT VALIDATION TESTS
  describe('input validation', () => {
    // checks if leaving one item unanswered will be rejected
    it('rejects a session with missing answers for one or more of the 21 items', () => {
      const incomplete = buildResponses(1)
      delete incomplete.item21

      expect(() => evaluateDass21({ responses: incomplete })).toThrow(
        'All 21 assessment items are required.'
      )
    })

    // checks if sending extra input (item22) will be rejected
    it('rejects a session with extra unexpected items', () => {
      const extraItem = buildResponses(1, { item22: 1 })

      expect(() => evaluateDass21({ responses: extraItem })).toThrow(
        'All 21 assessment items are required.'
      )
    })

    // checks if negative numbers, higher, and non-integer values are rejected
    it.each([-1, 4, 1.5, NaN, '2', null])(
      'rejects out-of-range or non-integer item value',
      (invalidValue) => {
        const invalidPayload = buildResponses(1, { item5: invalidValue })

        expect(() => evaluateDass21({ responses: invalidPayload })).toThrow(
          'Each response must be an integer between 0 and 3.'
        )
      }
    )
  })

  
// SUBSCALE GROUPING & x2 MULTIPLIER TESTS
  describe('subscale grouping and x2 multiplier', () => {
    // verifies only Depression items, gives value of 2, then multiply
    it('isolates Depression items and multiplies raw sum by 2', () => {
      const responses = buildSubscaleResponses(DEPRESSION_ITEMS, 2)
      const result = evaluateDass21({ responses })

      expect(result.scores.depression).toEqual({
        rawScore: 14,
        finalScore: 28,
        severity: 'Extremely Severe'
      })
      expect(result.scores.anxiety.finalScore).toBe(0)
      expect(result.scores.stress.finalScore).toBe(0)
    })

    // verifies only Anxiety items, gives value of 1, then multiply
    it('isolates Anxiety items and multiplies raw sum by 2', () => {
      const responses = buildSubscaleResponses(ANXIETY_ITEMS, 1)
      const result = evaluateDass21({ responses })

      expect(result.scores.anxiety).toEqual({
        rawScore: 7,
        finalScore: 14,
        severity: 'Moderate'
      })
      expect(result.scores.depression.finalScore).toBe(0)
      expect(result.scores.stress.finalScore).toBe(0)
    })

    // verifies only Stress items, gives value of 3, then multiply
    it('isolates Stress items and multiplies raw sum by 2', () => {
      const responses = buildSubscaleResponses(STRESS_ITEMS, 3)
      const result = evaluateDass21({ responses })

      expect(result.scores.stress).toEqual({
        rawScore: 21,
        finalScore: 42,
        severity: 'Extremely Severe'
      })
      expect(result.scores.depression.finalScore).toBe(0)
      expect(result.scores.anxiety.finalScore).toBe(0)
    })
  })


// SEVERITY THRESHOLD MAPPING TESTS (using achievable even final scores)
  describe('severity thresholds', () => {
    // checks the threshold mapping for Depression scores to severity levels
    it.each([
      [0, 'Normal'],
      [8, 'Normal'],
      [10, 'Mild'],
      [12, 'Mild'],
      [14, 'Moderate'],
      [20, 'Moderate'],
      [22, 'Severe'],
      [26, 'Severe'],
      [28, 'Extremely Severe'],
      [42, 'Extremely Severe']
    ] as const)('maps Depression final score %i to %s', (targetFinalScore, expectedSeverity) => {
      let remainingRaw = targetFinalScore / 2
      const overrides: Record<string, number> = {}
      for (const itemNum of DEPRESSION_ITEMS) {
        const val = Math.min(3, remainingRaw)
        overrides[`item${itemNum}`] = val
        remainingRaw -= val
      }

      const result = evaluateDass21({ responses: buildResponses(0, overrides) })
      expect(result.scores.depression.finalScore).toBe(targetFinalScore)
      expect(result.scores.depression.severity).toBe(expectedSeverity)
    })

    // checks the threshold mapping for Anxiety scores to severity levels
    it.each([
      [0, 'Normal'],
      [6, 'Normal'],
      [8, 'Mild'],
      [10, 'Moderate'],
      [14, 'Moderate'],
      [16, 'Severe'],
      [18, 'Severe'],
      [20, 'Extremely Severe'],
      [42, 'Extremely Severe']
    ] as const)('maps Anxiety final score %i to %s', (targetFinalScore, expectedSeverity) => {
      let remainingRaw = targetFinalScore / 2
      const overrides: Record<string, number> = {}
      for (const itemNum of ANXIETY_ITEMS) {
        const val = Math.min(3, remainingRaw)
        overrides[`item${itemNum}`] = val
        remainingRaw -= val
      }

      const result = evaluateDass21({ responses: buildResponses(0, overrides) })
      expect(result.scores.anxiety.finalScore).toBe(targetFinalScore)
      expect(result.scores.anxiety.severity).toBe(expectedSeverity)
    })

    // checks the threshold mapping for Stress scores to severity levels
    it.each([
      [0, 'Normal'],
      [14, 'Normal'],
      [16, 'Mild'],
      [18, 'Mild'],
      [20, 'Moderate'],
      [24, 'Moderate'],
      [26, 'Severe'],
      [32, 'Severe'],
      [34, 'Extremely Severe'],
      [42, 'Extremely Severe']
    ] as const)('maps Stress final score %i to %s', (targetFinalScore, expectedSeverity) => {
      let remainingRaw = targetFinalScore / 2
      const overrides: Record<string, number> = {}
      for (const itemNum of STRESS_ITEMS) {
        const val = Math.min(3, remainingRaw)
        overrides[`item${itemNum}`] = val
        remainingRaw -= val
      }

      const result = evaluateDass21({ responses: buildResponses(0, overrides) })
      expect(result.scores.stress.finalScore).toBe(targetFinalScore)
      expect(result.scores.stress.severity).toBe(expectedSeverity)
    })
  })


// COUNSELOR ALERT FLAGGING TESTS
  describe('counselor alert flagging', () => {
    // counselorAlertTriggered stays false when all 3 categories are Normal, Mild, or Moderate
    it('does NOT trigger counselorAlertTriggered when all subscales are Normal to Moderate', () => {
      const responses = buildResponses(0, {
        //input static scores that will lead only to moderate severity for all 3 categories
        item3: 3, item5: 3, item10: 3, item13: 1,
        item2: 3, item4: 3, item7: 1,
        item1: 3, item6: 3, item8: 3, item11: 3
      })

      const result = evaluateDass21({ responses })
      expect(result.counselorAlertTriggered).toBe(false)
    })

    // counselorAlertTriggered turns true if even a single category reaches Severe
    it('triggers counselorAlertTriggered when at least one subscale reaches Severe', () => {
      // anxiety will reach severe while depression and stress will be normal
      const responses = buildResponses(0, {
        item2: 3, item4: 3, item7: 2
      })

      const result = evaluateDass21({ responses })
      expect(result.scores.anxiety.severity).toBe('Severe')
      expect(result.counselorAlertTriggered).toBe(true)
    })

    // counselorAlertTriggered turns true if even a single category reaches Extremely Severe
    it('triggers counselorAlertTriggered when any category reaches Extremely Severe', () => {
      // stress will reach extremely severe while depression and anxiety will be normal
      const responses = buildResponses(0, {
        item1: 3, item6: 3, item8: 3, item11: 3, item12: 3, item14: 2
      })

      const result = evaluateDass21({ responses })
      expect(result.scores.stress.severity).toBe('Extremely Severe')
      expect(result.counselorAlertTriggered).toBe(true)
    })
  })
})