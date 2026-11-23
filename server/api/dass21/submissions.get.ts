import { defineEventHandler, setResponseStatus } from 'h3'

import { StudentResponseModel } from '../../models/StudentResponse'
import { UserModel } from '../../models/User'
import { getSessionUser } from '../../utils/auth'
import { isCounselor } from '../../utils/counselor'
import { DASS21_ASSESSMENT_TYPE, toDass21Entry } from '../../utils/dass21-entries'

export default defineEventHandler(async (event) => {
  const sessionUser = getSessionUser(event)

  if (!sessionUser?.emailAddress) {
    setResponseStatus(event, 401)
    return { success: false, message: 'You must be logged in.' }
  }

  const currentUser = await UserModel.findOne({ emailAddress: sessionUser.emailAddress }).lean()

  if (!isCounselor(currentUser)) {
    setResponseStatus(event, 403)
    return { success: false, message: 'Only counselors can view DASS-21 entries.' }
  }

  const responses = await StudentResponseModel
    .find({ assessmentType: DASS21_ASSESSMENT_TYPE })
    .sort({ submittedAt: -1 })
    .populate('studentId')
    .lean()

  return {
    success: true,
    data: responses.map((response) => toDass21Entry(response))
  }
})