import { createError, defineEventHandler, getRouterParam } from 'h3'
import { isValidObjectId } from 'mongoose'

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

  const assessmentId = getRouterParam(event, 'id')

  if (!assessmentId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Assessment ID is required.'
    })
  }

  if (!isValidObjectId(assessmentId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid assessment ID.'
    })
  }

  const assessment = await StudentResponseModel.findOne({
    _id: assessmentId,
    studentId: student._id,
    assessmentType: 'PHQ-9'
  })
    .select('_id scores overallSeverity submittedAt')
    .lean()

  if (!assessment) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PHQ-9 assessment not found.'
    })
  }

  return {
    message: 'PHQ-9 assessment retrieved successfully.',
    data: assessment
  }
})