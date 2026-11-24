export type Dass21Severity =
  | 'Normal'
  | 'Mild'
  | 'Moderate'
  | 'Severe'
  | 'Extremely Severe'

export interface Dass21SubscaleResult {
  score: number
  severity: Dass21Severity
}

export interface Dass21Submission {
  id: string
  studentName: string
  studentNumber: string
  submittedAt: string
  depression: Dass21SubscaleResult
  anxiety: Dass21SubscaleResult
  stress: Dass21SubscaleResult
  isFlagged: boolean
}

export interface Dass21SubmissionsResponse {
  success: boolean
  data: Dass21Submission[]
}