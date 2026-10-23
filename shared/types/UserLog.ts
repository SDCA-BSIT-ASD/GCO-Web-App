import type { Types } from 'mongoose'

export interface UserLog {
  userId: Types.ObjectId
  action: string
  loggedAt: Date
}