import { createError, defineEventHandler } from 'h3'

import { StudentResponseModel } from '../../models/StudentResponse'
import { UserModel } from '../../models/User'
import { getSessionUser } from '../../utils/auth'
import { isCounselor } from '../../utils/counselor'
import { DASS21_ASSESSMENT_TYPE, toDass21Entry } from '../../utils/dass21-entries'

export default defineEventHandler(async (event) => {
  const sessionUser = getSessionUser(event)

  if (!sessionUser?.emailAddress) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const currentUser = await UserModel.findOne({ emailAddress: sessionUser.emailAddress }).lean()

  if (!isCounselor(currentUser)) {
    throw createError ({
      statusCode: 403,
      statusMessage: 'Forbidden: Counselor access required.'
    })
  }

  const responses = await StudentResponseModel
    .find({ assessmentType: DASS21_ASSESSMENT_TYPE })
    .sort({ submittedAt: -1 })
    .populate('studentId')
    .lean()

  return {
    data: responses.map((response) => toDass21Entry(response))
  }
})