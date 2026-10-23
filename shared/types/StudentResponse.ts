import type { Types } from 'mongoose'

export interface StudentResponse {
  studentId: Types.ObjectId
  assessmentType: string
  answers: unknown[]
  scores: unknown
  overallSeverity?: string
  submittedAt: Date
}