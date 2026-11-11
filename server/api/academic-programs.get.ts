import { createError, defineEventHandler } from 'h3'

import { AcademicProgramModel } from '../models/AcademicProgram'
import { getSessionUser } from '../utils/auth'

export default defineEventHandler(async (event) => {
  const sessionUser = getSessionUser(event)

  if (!sessionUser?.emailAddress) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  return AcademicProgramModel.find({}).sort({ programCode: 1 }).lean()
})