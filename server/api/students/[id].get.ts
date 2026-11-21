import { getRouterParam, setResponseStatus, type H3Event } from 'h3'
import { isObjectIdOrHexString } from 'mongoose'

import { EmployeeModel } from '../../models/Employee'
import { StudentModel } from '../../models/Student'
import { getSessionUser } from '../../utils/auth'

type StudentRecord = {
  studentNumber?: unknown
  firstName?: unknown
  lastName?: unknown
  emailAddress?: unknown
  programName?: unknown
  yearLevel?: unknown
  status?: unknown
}

function errorResponse(event: H3Event, statusCode: number, message: string) {
  setResponseStatus(event, statusCode)
  return {
    success: false,
    message
  }
}

export default defineEventHandler(async (event) => {
  try {
    const sessionUser = getSessionUser(event)
    const emailAddress = sessionUser?.emailAddress

    if (typeof emailAddress !== 'string' || !emailAddress.trim()) {
      return errorResponse(event, 401, 'Authentication required.')
    }

    const administrator = await EmployeeModel.findOne({
      emailAddress,
      isAdmin: true
    })

    if (!administrator) {
      return errorResponse(event, 403, 'Access denied. Admin privileges required.')
    }

    const id = getRouterParam(event, 'id')
    if (!id || !isObjectIdOrHexString(id)) {
      return errorResponse(event, 400, 'Invalid student ID format.')
    }

    const student = await StudentModel.findById(id).lean<StudentRecord>()

    if (!student) {
      return errorResponse(event, 404, 'Student not found.')
    }

    if (
      typeof student.studentNumber !== 'string'
      || !student.studentNumber.trim()
      || typeof student.firstName !== 'string'
      || typeof student.lastName !== 'string'
      || typeof student.emailAddress !== 'string'
      || typeof student.programName !== 'string'
      || typeof student.yearLevel !== 'number'
      || typeof student.status !== 'string'
    ) {
      console.error(`Student record ${id} is missing required detail fields.`)
      return errorResponse(event, 500, 'An internal server error occurred.')
    }

    setResponseStatus(event, 200)
    return {
      success: true,
      student: {
        studentNumber: student.studentNumber,
        firstName: student.firstName,
        lastName: student.lastName,
        emailAddress: student.emailAddress,
        program: student.programName,
        yearLevel: student.yearLevel,
        status: student.status
      }
    }
  } catch (error) {
    console.error('Failed to retrieve student details.', error)
    return errorResponse(event, 500, 'An internal server error occurred.')
  }
})
