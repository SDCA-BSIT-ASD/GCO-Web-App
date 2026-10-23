import type { SchemaDefinition } from 'mongoose'
import { Schema } from 'mongoose'
import { defineMongooseModel } from '#nuxt/mongoose'

import type { StudentResponse } from '#shared/types/StudentResponse'

const studentResponseSchema: SchemaDefinition<StudentResponse> = {
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assessmentType: {
    type: String,
    required: true
  },
  answers: {
    type: [Schema.Types.Mixed],
    default: []
  },
  scores: {
    type: Schema.Types.Mixed
  },
  overallSeverity: {
    type: String
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}

export const StudentResponseModel = defineMongooseModel<StudentResponse>({
  name: 'StudentResponse',
  schema: studentResponseSchema,
  options: {
    collection: 'student_responses'
  }
})