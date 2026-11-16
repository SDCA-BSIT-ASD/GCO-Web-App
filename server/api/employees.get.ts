import { defineEventHandler, setResponseStatus } from 'h3'

import { EmployeeModel } from '../models/Employee'
import { UserModel } from '../models/User'
import { getSessionUser } from '../utils/auth'

export default defineEventHandler(async (event) => {
  const sessionUser = getSessionUser(event)

  if (!sessionUser?.emailAddress) {
    setResponseStatus(event, 401)
    return {
      success: false,
      message: 'Authentication required. Please log in.'
    }
  }

  try {
    const admin = await UserModel.findOne({
      emailAddress: sessionUser.emailAddress,
      isAdmin: true
    })

    if (!admin) {
      setResponseStatus(event, 403)
      return {
        success: false,
        message: 'Only admins are authorized to view the employee list.'
      }
    }

    const employees = await EmployeeModel.find({})
      .select('employeeNumber firstName lastName emailAddress type')
      .lean()

    if (employees.length === 0) {
      return {
        success: true,
        message: 'Employee Records Are Currently Empty',
        data: []
      }
    }

    return {
      success: true,
      message: 'Employee data retrieved successfully',
      data: employees.map(employee => ({
        employeeNumber: employee.employeeNumber || '',
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.emailAddress,
        employeeType: employee.type
      }))
    }
  } catch {
    setResponseStatus(event, 500)
    return {
      success: false,
      message: 'Failed To Retrieve Employees Data.'
    }
  }
})
