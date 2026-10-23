import type { SchemaDefinition } from 'mongoose'
import { defineMongooseModel } from '#nuxt/mongoose'

import type { User } from '#shared/types/User'

const userSchema: SchemaDefinition<User> = {
  emailAddress: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  }
}

export const UserModel = defineMongooseModel<User>({
  name: 'User',
  schema: userSchema,
  options: {
    collection: 'users',
    timestamps: true
  }
})