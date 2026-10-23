import type { Types } from 'mongoose'

export interface FacultyReferral {
  employeeId: Types.ObjectId
  studentId: Types.ObjectId
  comments?: string
  status: string
  submittedAt: Date
  createdAt: Date
  updatedAt: Date
}