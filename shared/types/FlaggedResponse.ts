import type { Types } from 'mongoose'

export interface FlaggedResponse {
  responseId: Types.ObjectId
  status: string
  resolvedAt?: Date
  createdAt: Date
  updatedAt: Date
}