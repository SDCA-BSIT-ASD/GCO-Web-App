import { createError, defineEventHandler, readBody } from 'h3'

import { StudentModel } from '../../models/Student'
import { getSessionUser } from '../../utils/auth'

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

// Check the request structure and every submitted DASS-21 response before processing it.
function validateRequestBody(body: unknown): void {
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

  // Build the only valid item names and compare them with the submitted keys.
  const expectedItems = Array.from({ length: 21 }, (_, index) => `item${index + 1}`)
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

  // Responses must remain numbers and must be whole values from 0 through 3.
  for (const item of expectedItems) {
    const responseValue = responses[item]

    if (
      typeof responseValue !== 'number' ||
      !Number.isInteger(responseValue) ||
      responseValue < 0 ||
      responseValue > 3
    ) {
      throwApiError(400, 'Each response must be an integer between 0 and 3.')
    }
  }
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
  validateRequestBody(body)

  // The request reaches this response only after all checks have passed.
  return {
    success: true,
    data: {}
  }
})