
import { createError, defineEventHandler } from 'h3'

import { StudentResponseModel } from '../../../../../models/StudentResponse'
import { getSessionUser } from '../../../../../utils/auth'
import { StudentModel } from '../../../../../models/Student'

export default defineEventHandler(async (event) => {
  const sessionUser = getSessionUser(event)

  if (!sessionUser?.emailAddress) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const student = await StudentModel.findOne({
    emailAddress: sessionUser.emailAddress
  }).select('_id')

  if (!student) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Student access required.'
    })
  }

  const assessments = await StudentResponseModel.find({
    studentId: student._id,
    assessmentType: 'PHQ-9'
  })
    .select('_id scores overallSeverity submittedAt')
    .sort({ submittedAt: -1 })
    .lean()

  return {
    message: 'PHQ-9 assessment history retrieved successfully.',
    data: assessments
  }
})
