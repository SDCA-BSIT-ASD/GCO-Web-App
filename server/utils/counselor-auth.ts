import type { H3Event } from 'h3'

import { EmployeeModel } from '../models/Employee'
import { getSessionUser } from './auth'

export async function getCounselorAccessError(event: H3Event) {
  const sessionUser = getSessionUser(event)

  if (typeof sessionUser?.emailAddress !== 'string' || !sessionUser.emailAddress) {
    return {
      statusCode: 401,
      message: 'Authentication required.'
    }
  }

  const counselor = await EmployeeModel.findOne({
    emailAddress: sessionUser.emailAddress,
    type: 'Counselor'
  })

  if (!counselor) {
    return {
      statusCode: 403,
      message: 'Counselor access required.'
    }
  }

  return null
}