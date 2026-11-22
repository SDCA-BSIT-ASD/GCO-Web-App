import { createError, defineEventHandler, getRouterParam } from 'h3'
import { isObjectIdOrHexString } from 'mongoose'
import { EmployeeModel } from '../../../models/Employee'
import { getSessionUser } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const sessionUser = getSessionUser(event)

  if (!sessionUser?.emailAddress) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const counselor = await EmployeeModel.findOne({
    emailAddress: sessionUser.emailAddress,
    type: 'Counselor'
  }).select('_id').lean()

  if (!counselor) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Counselor access required.'
    })
  }

  const id = getRouterParam(event, 'id')

  if (!id || !isObjectIdOrHexString(id)) {
    throw createError({
      statusCode: 404,
      statusMessage: 'DASS-21 submission not found.'
    })
  }

  
})