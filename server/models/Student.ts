import type { SchemaDefinition } from 'mongoose'
import { defineMongooseDiscriminatorModel } from '#nuxt/mongoose'

import type { Student } from '#shared/types/User'
import { UserModel } from './User'

const studentSchema: SchemaDefinition<Student> = {
  programName: {
    type: String,
    required: true
  },
  yearLevel: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true
  }
}

export const StudentModel = defineMongooseDiscriminatorModel({
  name: 'Student',
  baseModel: UserModel,
  schema: studentSchema
})