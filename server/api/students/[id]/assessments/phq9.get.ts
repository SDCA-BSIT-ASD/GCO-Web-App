import { setResponseStatus, type H3Event } from 'h3'
import type { Types } from 'mongoose'

import { FlaggedResponseModel } from '../../../../models/FlaggedResponse'
import { StudentResponseModel } from '../../../../models/StudentResponse'
import { authorizeCounselorForStudent } from '../../../../utils/counselor-access'

const PHQ9_ASSESSMENT_TYPE = 'PHQ-9'
// TODO: confirm with the PHQ-9 owner

type Phq9SubmissionRecord = {
  _id: Types.ObjectId | string
  submittedAt: Date | string
  overallSeverity?: string
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

// Returns PHQ-9 submission summaries only, sorted newest first.
export default defineEventHandler(async (event) => {
  try {
    const access = await authorizeCounselorForStudent(event)
    if ('error' in access) return access.error

    const submissions = await StudentResponseModel
      .find({
        studentId: access.studentId,
        assessmentType: PHQ9_ASSESSMENT_TYPE
      })
      .sort({ submittedAt: -1 })
      .select('_id submittedAt overallSeverity')
      .lean<Phq9SubmissionRecord[]>()

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
        // TODO: confirm the overallSeverity format with the PHQ-9 owner
        overallSeverity: submission.overallSeverity ?? null,
        isFlagged: flaggedResponseIds.has(String(submission._id))
      }))
    }
  } catch (error) {
    console.error('Failed to retrieve PHQ-9 submissions.', error)
    return errorResponse(event, 500, 'An internal server error occurred.')
  }
})
