import { defineEventHandler, getRouterParam, setResponseStatus, type H3Event } from 'h3'

import { EmployeeModel } from '../../models/Employee'
import { UserModel } from '../../models/User'
import { getSessionUser } from '../../utils/auth'

function employeeNotFound(event: H3Event) {
  setResponseStatus(event, 404)
  return {
    success: false,
    message: 'Employee not found.'
  }
}

export default defineEventHandler(async (event) => {
  const sessionUser = getSessionUser(event)

  if (!sessionUser?.emailAddress) {
    return employeeNotFound(event)
  }

  const admin = await UserModel.findOne({
    emailAddress: sessionUser.emailAddress,
    isAdmin: true
  })

  if (!admin) {
    return employeeNotFound(event)
  }

  const employeeNumber = getRouterParam(event, 'id')
  const employee = employeeNumber
    ? await EmployeeModel.collection.findOne({
        employeeNumber,
        __t: 'Employee'
      })
    : null

  if (!employee) {
    return employeeNotFound(event)
  }

  const employeeType = employee.employeeType ?? employee.type

  return {
    employee_number: employee.employeeNumber,
    first_name: employee.firstName,
    last_name: employee.lastName,
    email_address: employee.emailAddress,
    employee_type: employeeType,
    primary_program_assignment: employeeType === 'Faculty'
      ? employee.department ?? null
      : null,
    admin_privileges_status: employeeType === 'ICT Personnel'
      ? employee.isAdmin ?? null
      : null
  }
})