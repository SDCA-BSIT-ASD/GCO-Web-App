import type { SchemaDefinition } from 'mongoose'
import { defineMongooseModel } from '#nuxt/mongoose'

import type { AcademicTerm } from '#shared/types/AcademicTerm'

const academicTermSchema: SchemaDefinition<AcademicTerm> = {
  title: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  startDate: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/
  },
  endDate: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/
  }
}

export const AcademicTermModel = defineMongooseModel<AcademicTerm>({
  name: 'AcademicTerm',
  schema: academicTermSchema,
  options: {
    collection: 'academic_terms',
    timestamps: true
  }
})