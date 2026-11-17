import { defineEventHandler, setResponseStatus } from 'h3'

import { StudentModel } from '../models/Student'
import { UserModel } from '../models/User'
import { getSessionUser } from '../utils/auth'

export default defineEventHandler(async (event) => {
  const sessionUser = getSessionUser(event)

  if (!sessionUser?.emailAddress) {
    setResponseStatus(event, 401)
    return {
      success: false,
      message: 'Please log in to access student records.'
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
        message: 'Only admins can retrieve student records.'
      }
    }

    const students = await StudentModel.find({})
      .select('studentNumber firstName lastName emailAddress programName yearLevel status -_id')
      .lean()

    return {
      success: true,
      data: students.map(student => ({
        studentNumber: student.studentNumber,
        firstName: student.firstName,
        lastName: student.lastName,
        emailAddress: student.emailAddress,
        programName: student.programName,
        yearLevel: student.yearLevel,
        status: student.status
      }))
    }
  } catch {
    setResponseStatus(event, 500)
    return {
      success: false,
      message: 'An unexpected error occurred while retrieving student records.'
    }
  }
})
