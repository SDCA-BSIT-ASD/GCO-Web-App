import { setResponseStatus, type H3Event } from 'h3'
import type { Types } from 'mongoose'

import { FlaggedResponseModel } from '../../../../models/FlaggedResponse'
import { StudentResponseModel } from '../../../../models/StudentResponse'
import { authorizeCounselorForStudent } from '../../../../utils/counselor-access'

type Dass21SubmissionRecord = {
  _id: Types.ObjectId | string
  submittedAt: Date | string
  scores?: {
    depression?: { severity?: string }
    anxiety?: { severity?: string }
    stress?: { severity?: string }
  }
}

type FlagRecord = {
  responseId: Types.ObjectId | string
}

function errorResponse(event: H3Event, statusCode: number, message: string) {
  setResponseStatus(event, statusCode)
  return {
    success: false,
    message
  }
}

// Returns DASS-21 submission summaries only, sorted newest first.
export default defineEventHandler(async (event) => {
  try {
    const access = await authorizeCounselorForStudent(event)
    if ('error' in access) return access.error

    const submissions = await StudentResponseModel
      .find({
        studentId: access.studentId,
        assessmentType: 'DASS-21'
      })
      .sort({ submittedAt: -1 })
      .select('_id submittedAt scores.depression.severity scores.anxiety.severity scores.stress.severity')
      .lean<Dass21SubmissionRecord[]>()

    if (submissions.length === 0) {
      setResponseStatus(event, 200)
      return {
        success: true,
        submissions: []
      }
    }

    const responseIds = submissions.map(submission => submission._id)
    const flags = await FlaggedResponseModel
      .find({ responseId: { $in: responseIds } })
      .select('responseId')
      .lean<FlagRecord[]>()

    const flaggedResponseIds = new Set(
      flags.map(flag => String(flag.responseId))
    )

    setResponseStatus(event, 200)
    return {
      success: true,
      submissions: submissions.map(submission => ({
        id: String(submission._id),
        submittedAt: submission.submittedAt,
        depressionSeverity: submission.scores?.depression?.severity ?? null,
        anxietySeverity: submission.scores?.anxiety?.severity ?? null,
        stressSeverity: submission.scores?.stress?.severity ?? null,
        isFlagged: flaggedResponseIds.has(String(submission._id))
      }))
    }
  } catch (error) {
    console.error('Failed to retrieve DASS-21 submissions.', error)
    return errorResponse(event, 500, 'An internal server error occurred.')
  }
})
