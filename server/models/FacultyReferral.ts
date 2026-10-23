import type { SchemaDefinition } from 'mongoose'
import { Schema } from 'mongoose'
import { defineMongooseModel } from '#nuxt/mongoose'

import type { FacultyReferral } from '#shared/types/FacultyReferral'

const facultyReferralSchema: SchemaDefinition<FacultyReferral> = {
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: {
    type: String
  },
  status: {
    type: String,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}

export const FacultyReferralModel = defineMongooseModel<FacultyReferral>({
  name: 'FacultyReferral',
  schema: facultyReferralSchema,
  options: {
    collection: 'faculty_referrals',
    timestamps: true
  }
})