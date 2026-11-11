import { createError, defineEventHandler, readBody } from 'h3'
import { EmployeeModel } from '../models/Employee'
import { getSessionUser } from '../utils/auth'

export default defineEventHandler(async (event) => {
  const sessionUser = getSessionUser(event)

  if (!sessionUser?.emailAddress) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const admin = await EmployeeModel.findOne({
    emailAddress: sessionUser.emailAddress,
    isAdmin: true
  })

  if (!admin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Admin access required.'
    })
  }

  const body = await readBody(event)

})