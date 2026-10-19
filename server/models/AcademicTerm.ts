import type { InferSchemaType } from 'mongoose'
import { defineMongooseModel } from '#nuxt/mongoose'

const academicTermSchema = {
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

export const AcademicTermModel = defineMongooseModel({
  name: 'AcademicTerm',
  schema: academicTermSchema,
  options: {
    collection: 'academic_terms',
    timestamps: true
  }
})

export type AcademicTerm = InferSchemaType<typeof academicTermSchema>