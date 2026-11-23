import { defineEventHandler, setResponseStatus } from 'h3'

import { EmployeeModel } from '../../models/Employee'
import { getSessionUser } from '../../utils/auth'
import { getPhq9AccessError } from '../../utils/phq9-access'

export default defineEventHandler(async (event) => {
  const sessionUser = getSessionUser(event)

  const employee = sessionUser?.emailAddress
    ? await EmployeeModel.findOne({ emailAddress: sessionUser.emailAddress }).lean()
    : null

  const accessError = getPhq9AccessError(sessionUser, employee)
  if (accessError) {
    setResponseStatus(event, accessError.status)
    return { success: false, message: accessError.message }
  }

  return { success: true, data: [] }
})