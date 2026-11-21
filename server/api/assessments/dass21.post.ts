import { createError, defineEventHandler, readBody, setResponseStatus } from 'h3'

import { StudentModel } from '../../models/Student'
import { StudentResponseModel } from '../../models/StudentResponse'
import { FlaggedResponseModel } from '../../models/FlaggedResponse'
import { getSessionUser } from '../../utils/auth'

interface Dass21Responses extends Record<string, unknown> {
  item1: number
  item2: number
  item3: number
  item4: number
  item5: number
  item6: number
  item7: number
  item8: number
  item9: number
  item10: number
  item11: number
  item12: number
  item13: number
  item14: number
  item15: number
  item16: number
  item17: number
  item18: number
  item19: number
  item20: number
  item21: number
}

type Severity = 'Normal' | 'Mild' | 'Moderate' | 'Severe' | 'Extremely Severe'

interface SeverityThresholds {
  normal: number
  mild: number
  moderate: number
  severe: number
}

const DEPRESSION_THRESHOLDS: SeverityThresholds = {
  normal: 9,
  mild: 13,
  moderate: 20,
  severe: 27
}

const ANXIETY_THRESHOLDS: SeverityThresholds = {
  normal: 7,
  mild: 9,
  moderate: 14,
  severe: 19
}

const STRESS_THRESHOLDS: SeverityThresholds = {
  normal: 14,
  mild: 18,
  moderate: 25,
  severe: 33
}

// Create the same error response format for authentication and validation failures.
function throwApiError(statusCode: number, message: string): never {
  throw createError({
    statusCode,
    statusMessage: message,
    data: {
      success: false,
      message
    }
  })
}

// Narrow unknown input to a non-null object that can be inspected safely.
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// Confirm that every expected response is valid before narrowing its type.
function hasValidResponseValues(
  responses: Record<string, unknown>,
  expectedItems: string[]
): responses is Dass21Responses {
  for (const item of expectedItems) {
    const responseValue = responses[item]

    if (
      typeof responseValue !== 'number' ||
      !Number.isInteger(responseValue) ||
      responseValue < 0 ||
      responseValue > 3
    ) {
      return false
    }
  }

  return true
}

function classifySeverity(
  finalScore: number,
  thresholds: SeverityThresholds
): Severity {
  if (finalScore <= thresholds.normal) return 'Normal'
  if (finalScore <= thresholds.mild) return 'Mild'
  if (finalScore <= thresholds.moderate) return 'Moderate'
  if (finalScore <= thresholds.severe) return 'Severe'
  return 'Extremely Severe'
}

// Check the request structure and every submitted DASS-21 response before processing it.
function validateRequestBody(body: unknown): Dass21Responses {
  if (!isObject(body)) {
    throwApiError(400, 'Request body must contain a responses object.')
  }

  // The request must contain exactly one top-level property named responses.
  const topLevelKeys = Object.keys(body)
  if (topLevelKeys.length !== 1 || topLevelKeys[0] !== 'responses') {
    throwApiError(400, 'Request body must contain only the responses property.')
  }

  const responses = body.responses
  if (!isObject(responses)) {
    throwApiError(400, 'The responses property must be an object.')
  }

  // List the only valid item names and compare them with the submitted keys.
  const expectedItems = [
    'item1', 'item2', 'item3', 'item4', 'item5',
    'item6', 'item7', 'item8', 'item9', 'item10',
    'item11', 'item12', 'item13', 'item14', 'item15',
    'item16', 'item17', 'item18', 'item19', 'item20',
    'item21'
  ]
  const responseKeys = Object.keys(responses)
  const hasAllItems = expectedItems.every((item) => responseKeys.includes(item))
  const hasOnlyExpectedItems = responseKeys.every((item) => expectedItems.includes(item))

  if (
    responseKeys.length !== expectedItems.length ||
    !hasAllItems ||
    !hasOnlyExpectedItems
  ) {
    throwApiError(400, 'All 21 assessment items are required.')
  }

  // The type guard checks that responses are numbers and whole values from 0 through 3.
  if (!hasValidResponseValues(responses, expectedItems)) {
    throwApiError(400, 'Each response must be an integer between 0 and 3.')
  }

  return responses
}

// Handle DASS-21 submissions after authentication, authorization, and validation.
export default defineEventHandler(async (event) => {
  // Read the authenticated user from the existing signed session cookie.
  const sessionUser = getSessionUser(event)

  if (!sessionUser?.emailAddress) {
    return throwApiError(401, 'Unauthorized. Please log in to submit your assessment.')
  }

  // A matching Student document confirms that the authenticated account is a student.
  const student = await StudentModel.findOne({
    emailAddress: sessionUser.emailAddress
  })

  if (!student) {
    return throwApiError(403, 'Access denied. Only authenticated students can submit this assessment.')
  }

  // Read and validate the submitted body before allowing the request to continue.
  const body = await readBody(event)
  const responses = validateRequestBody(body)

  const depressionRawScore =
    responses.item3 +
    responses.item5 +
    responses.item10 +
    responses.item13 +
    responses.item16 +
    responses.item17 +
    responses.item21

  const anxietyRawScore =
    responses.item2 +
    responses.item4 +
    responses.item7 +
    responses.item9 +
    responses.item15 +
    responses.item19 +
    responses.item20

  const stressRawScore =
    responses.item1 +
    responses.item6 +
    responses.item8 +
    responses.item11 +
    responses.item12 +
    responses.item14 +
    responses.item18

  const depressionFinalScore = depressionRawScore * 2
  const anxietyFinalScore = anxietyRawScore * 2
  const stressFinalScore = stressRawScore * 2
  const depressionSeverity = classifySeverity(depressionFinalScore, DEPRESSION_THRESHOLDS)
  const anxietySeverity = classifySeverity(anxietyFinalScore, ANXIETY_THRESHOLDS)
  const stressSeverity = classifySeverity(stressFinalScore, STRESS_THRESHOLDS)

  const requiresCounselorReview =
    depressionSeverity === 'Severe' ||
    depressionSeverity === 'Extremely Severe' ||
    anxietySeverity === 'Severe' ||
    anxietySeverity === 'Extremely Severe' ||
    stressSeverity === 'Severe' ||
    stressSeverity === 'Extremely Severe'

  let submission

  try {
    submission = await StudentResponseModel.create({
      studentId: student._id,
      assessmentType: 'DASS-21',
      answers: [
        responses.item1,
        responses.item2,
        responses.item3,
        responses.item4,
        responses.item5,
        responses.item6,
        responses.item7,
        responses.item8,
        responses.item9,
        responses.item10,
        responses.item11,
        responses.item12,
        responses.item13,
        responses.item14,
        responses.item15,
        responses.item16,
        responses.item17,
        responses.item18,
        responses.item19,
        responses.item20,
        responses.item21
      ],
      scores: {
        depression: {
          rawScore: depressionRawScore,
          finalScore: depressionFinalScore,
          severity: depressionSeverity
        },
        anxiety: {
          rawScore: anxietyRawScore,
          finalScore: anxietyFinalScore,
          severity: anxietySeverity
        },
        stress: {
          rawScore: stressRawScore,
          finalScore: stressFinalScore,
          severity: stressSeverity
        }
      },
      submittedAt: new Date()
    })

    if (requiresCounselorReview) {
      await FlaggedResponseModel.create({
        responseId: submission._id,
        status: 'pending_priority_review'
      })
    }
  } catch {
    throwApiError(500, 'Unable to save the assessment. Please try again.')
  }

  setResponseStatus(event, 201)

  // Use the successfully saved record for the returned assessment data.
  return {
    message: 'DASS-21 assessment submitted successfully.',
    data: {
      success: true,
      counselorAlertTriggered: requiresCounselorReview,
      submissionId: submission._id,
      submittedAt: submission.submittedAt,
      scores: {
        depression: {
          rawScore: depressionRawScore,
          finalScore: depressionFinalScore
        },
        anxiety: {
          rawScore: anxietyRawScore,
          finalScore: anxietyFinalScore
        },
        stress: {
          rawScore: stressRawScore,
          finalScore: stressFinalScore
        },
        depressionSeverity,
        anxietySeverity,
        stressSeverity
      }
    }
  }
})