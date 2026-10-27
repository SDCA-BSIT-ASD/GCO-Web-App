import type { SchemaDefinition } from 'mongoose'
import { defineMongooseModel } from '#nuxt/mongoose'

import type { AcademicProgram } from '#shared/types/AcademicProgram'

const academicProgramSchema: SchemaDefinition<AcademicProgram> = {
  programCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    match: /^[A-Za-z0-9]+$/
  },
  programName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^[A-Za-z0-9]+(?: [A-Za-z0-9]+)*$/
  },
  isActive: {
    type: Boolean,
    default: true
  }
}

export const AcademicProgramModel = defineMongooseModel<AcademicProgram>({
  name: 'AcademicProgram',
  schema: academicProgramSchema,
  options: {
    collection: 'academic_programs',
    timestamps: true
  }
})
