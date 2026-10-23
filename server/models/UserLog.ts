import type { SchemaDefinition } from 'mongoose'
import { Schema } from 'mongoose'
import { defineMongooseModel } from '#nuxt/mongoose'

import type { UserLog } from '#shared/types/UserLog'

const userLogSchema: SchemaDefinition<UserLog> = {
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  loggedAt: {
    type: Date,
    default: Date.now
  }
}

export const UserLogModel = defineMongooseModel<UserLog>({
  name: 'UserLog',
  schema: userLogSchema,
  options: {
    collection: 'user_logs'
  }
})