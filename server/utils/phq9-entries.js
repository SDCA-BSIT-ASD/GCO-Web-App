// Question 9 is the 9th answer (index 8). Values are 0 to 3.
export function getAnswerValue(answer) {
  if (typeof answer === 'number') return answer
  if (answer && typeof answer === 'object') {
    return Number(answer.value ?? answer.score ?? 0)
  }
  return 0
}

// Flagged = student chose a non-zero answer on Question 9
export function isFlagged(answers) {
  if (!Array.isArray(answers)) return false
  return getAnswerValue(answers[8]) > 0
}

// Individual answers are NOT returned.
export function toPhq9EntryRow(response) {
  const student = response.student || {}
  return {
    _id: String(response._id),
    firstName: student.firstName,
    lastName: student.lastName,
    studentNumber: student.studentNumber,
    submittedAt: response.submittedAt,
    overallSeverity: response.overallSeverity,
    flagged: isFlagged(response.answers)
  }
}