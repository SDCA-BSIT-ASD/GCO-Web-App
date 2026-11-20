export const DASS21_ITEMS = {
  depression: [3, 5, 10, 13, 16, 17, 21],
  anxiety: [2, 4, 7, 9, 15, 19, 20],
  stress: [1, 6, 8, 11, 12, 14, 18]
}

// Highest final (doubled) score for each label, in order.
// Anything above the last number is Extremely Severe.
const SEVERITY_LIMITS = {
  depression: [9, 13, 20, 27],
  anxiety: [7, 9, 14, 19],
  stress: [14, 18, 25, 33]
}

const SEVERITY_LABELS = ['Normal', 'Mild', 'Moderate', 'Severe', 'Extremely Severe']
const FLAG_LABELS = ['Severe', 'Extremely Severe']

export function getSeverity(subscale, score) {
  const limits = SEVERITY_LIMITS[subscale]

  if (!limits) {
    throw new Error(`Unknown subscale: ${subscale}`)
  }

  const index = limits.findIndex((limit) => score <= limit)

  return SEVERITY_LABELS[index === -1 ? limits.length : index]
}

export function calculateDass21(answers) {
  if (!Array.isArray(answers) || answers.length !== 21) {
    throw new Error('DASS-21 requires exactly 21 answers.')
  }

  if (!answers.every((answer) => Number.isInteger(answer) && answer >= 0 && answer <= 3)) {
    throw new Error('Each DASS-21 answer must be a whole number from 0 to 3.')
  }

  const result = {}

  for (const [subscale, items] of Object.entries(DASS21_ITEMS)) {
    const score = items.reduce((sum, itemNumber) => sum + answers[itemNumber - 1], 0) * 2

    result[subscale] = { score, severity: getSeverity(subscale, score) }
  }

  const isFlagged = Object.keys(DASS21_ITEMS).some((subscale) =>
    FLAG_LABELS.includes(result[subscale].severity)
  )

  return { ...result, isFlagged }
}