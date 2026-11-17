import { createError, defineEventHandler } from 'h3'

import { StudentModel } from '../../models/Student'
import { getSessionUser } from '../../utils/auth'

function throwApiError(statusCode: number, message: string): never {
  throw createError({
    statusCode,
    statusMessage: message,
    data: {
      success: false,
      message
    }
  })
}

export default defineEventHandler(async (event) => {
  const sessionUser = getSessionUser(event)

  if (!sessionUser?.emailAddress) {
    return throwApiError(401, 'Unauthorized. Please log in to submit your assessment.')
  }

  const student = await StudentModel.findOne({
    emailAddress: sessionUser.emailAddress
  })

  if (!student) {
    return throwApiError(403, 'Access denied. Only authenticated students can submit this assessment.')
  }

  return {
    success: true,
    data: {}
  }
})