import { calculateDass21 } from './dass21.js';

export const DASS21_ASSESSMENT_TYPE = 'DASS-21';

// response.studentId is the student record.
export function toDass21Entry(response) {
  const student = response.studentId ?? null;
  const result = calculateDass21(response.answers);

  return {
    id: String(response._id),
    studentName: student?.firstName ? `${student.firstName} ${student.lastName ?? ''}`.trim() : null,
    studentNumber: student?.studentNumber ?? null,
    submittedAt: response.submittedAt,
    depression: result.depression.severity,
    anxiety: result.anxiety.severity,
    stress: result.stress.severity,
    isFlagged: result.isFlagged,
  }
}