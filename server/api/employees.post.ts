import { z } from 'zod'
import { EmployeeModel } from '../models/Employee'
import { getSessionUser } from '../utils/auth'

const createEmployeeSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),

  lastName: z.string().trim().min(1, 'Last name is required'),

  emailAddress: z.string()
    .trim()
    .toLowerCase()
    .email('Invalid email format')
    .refine((email) => email.endsWith('@sdca.edu.ph'), {
      message: 'Email must use the @sdca.edu.ph domain'
    }),

  employeeNumber: z.string()
    .trim()
    .min(1, 'Employee number is required'),

  type: z.enum(['Faculty', 'Counselor', 'ICT Personnel']),

  department: z.string().trim().min(1).nullable(),

  isAdmin: z.boolean().default(false)
})
  .superRefine((data, ctx) => {
    if (data.type === 'Faculty' && !data.department) {
      ctx.addIssue({
        code: 'custom',
        path: ['department'],
        message: 'Primary program assignment is required for Faculty'
      })
    }

    if (data.type !== 'Faculty' && data.department !== null) {
      ctx.addIssue({
        code: 'custom',
        path: ['department'],
        message: 'Department must be null for non-Faculty employees'
      })
    }

    if (data.type !== 'ICT Personnel' && data.isAdmin) {
      ctx.addIssue({
        code: 'custom',
        path: ['isAdmin'],
        message: 'Admin privileges are only allowed for ICT Personnel'
      })
    }
  })

export default defineEventHandler(async (event) => {
  const sessionUser = getSessionUser(event)

  if (!sessionUser?.emailAddress) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const adminEmployee = await EmployeeModel.findOne({
    emailAddress: sessionUser.emailAddress,
    isAdmin: true
  })

  if (!adminEmployee) {
    setResponseStatus(event, 403)

    return {
      success: false,
      message: 'User not authorized to add employees.'
    }
  }

  const body = await readBody(event)
  const parseResult = createEmployeeSchema.safeParse(body)

  if (!parseResult.success) {
    const conditionalErrors = [
      'Primary program assignment is required for Faculty',
      'Department must be null for non-Faculty employees',
      'Admin privileges are only allowed for ICT Personnel'
    ]

    const isConditionalError = parseResult.error.issues.every(
      issue => conditionalErrors.includes(issue.message)
    )

    setResponseStatus(event, isConditionalError ? 422 : 400)

    return {
      success: false,
      message: isConditionalError
        ? 'Invalid employee details or permissions.'
        : 'Please provide valid employee information.'
    }
  }

  const data = parseResult.data

  const existingEmployee = await EmployeeModel.findOne({
    $or: [
      { emailAddress: data.emailAddress } as any,
      { employeeNumber: data.employeeNumber } as any
    ]
  })

  if (existingEmployee) {
    setResponseStatus(event, 409)

    return {
      success: false,
      message: 'Employee email or employee number already exists.'
    }
  }

  try {
    await EmployeeModel.create({
      firstName: data.firstName,
      lastName: data.lastName,
      emailAddress: data.emailAddress,
      employeeNumber: data.employeeNumber,
      type: data.type,
      department: data.type === 'Faculty' && data.department
        ? data.department
        : 'N/A',
      isAdmin: data.type === 'ICT Personnel' ? data.isAdmin : false
    } as any)

  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      setResponseStatus(event, 409)

      return {
        success: false,
        message: 'Employee email or employee number already exists.'
      }
    }

    if (error instanceof Error && error.name === 'ValidationError') {
      setResponseStatus(event, 422)

      return {
        success: false,
        message: 'Invalid employee details or permissions.'
      }
    }

    throw error
  }



  setResponseStatus(event, 201)

  return {
    success: true,
    message: 'Employee added successfully.'
  }
})
