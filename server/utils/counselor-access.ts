import { getRouterParam, setResponseStatus, type H3Event } from 'h3'
import { isObjectIdOrHexString } from 'mongoose'

import { EmployeeModel } from '../models/Employee'
import { StudentModel } from '../models/Student'
import { getSessionUser } from './auth'

// TODO: Confirm the real Employee.type value used for counselors with the team.
export const COUNSELOR_TYPE = 'counselor'

type CounselorAccessError = {
  error: {
    success: false
    message: string
  }
}

type CounselorAccessSuccess = {
  studentId: string
}

type CounselorAccessResult = CounselorAccessError | CounselorAccessSuccess

function errorResponse(event: H3Event, statusCode: number, message: string) {
  setResponseStatus(event, statusCode)
  return {
    success: false,
    message
  }
}

export async function authorizeCounselorForStudent(
  event: H3Event
): Promise<CounselorAccessResult> {
  try {
    const sessionUser = getSessionUser(event)
    const emailAddress = sessionUser?.emailAddress

    if (typeof emailAddress !== 'string' || !emailAddress.trim()) {
      return {
        error: errorResponse(event, 401, 'Authentication required.')
      }
    }

    const employee = await EmployeeModel
      .findOne({ emailAddress })
      .select('type')
      .lean<{ type?: unknown }>()

    if (
      typeof employee?.type !== 'string'
      || employee.type.trim().toLowerCase() !== COUNSELOR_TYPE
    ) {
      return {
        error: errorResponse(event, 403, 'Access denied. Counselor privileges required.')
      }
    }

    const id = getRouterParam(event, 'id')
    if (!id || !isObjectIdOrHexString(id)) {
      return {
        error: errorResponse(event, 400, 'Invalid student ID format.')
      }
    }

    const studentExists = await StudentModel.exists({ _id: id })
    if (!studentExists) {
      return {
        error: errorResponse(event, 404, 'Student not found.')
      }
    }

    return { studentId: id }
  } catch (error) {
    console.error('Failed to authorize counselor for student.', error)
    return {
      error: errorResponse(event, 500, 'An internal server error occurred.')
    }
  }
}
