import { defineEventHandler, setResponseStatus, type H3Event } from 'h3'

import { StudentModel } from '../models/Student'
import { getCounselorAccessError } from '../utils/counselor-auth'

async function getStudents(event: H3Event) {
  const accessError = await getCounselorAccessError(event)

  if (accessError) {
    setResponseStatus(event, accessError.statusCode)
    return {
      success: false,
      message: accessError.message
    }
  }

  const students = await StudentModel.find()
    .select('studentNumber firstName lastName emailAddress programName yearLevel status')
    .lean()

  return {
    success: true,
    data: students.map((student) => ({
      studentNumber: student.studentNumber,
      firstName: student.firstName,
      lastName: student.lastName,
      emailAddress: student.emailAddress,
      programName: student.programName,
      yearLevel: student.yearLevel,
      status: student.status
    }))
  }
}

export default defineEventHandler(getStudents)